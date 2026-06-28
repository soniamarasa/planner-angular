import { Injectable } from '@angular/core';

import { SoundLayer } from '../models/focus';
import {
  DEFAULT_GAP_RANGE,
  FocusSound,
  getFocusSoundById,
} from '../config/focus-sounds';

interface ActiveLayer {
  gain: GainNode;
  /** Present for continuous ('bed') sounds. */
  source?: AudioBufferSourceNode;
  /** Present for intermittent ('oneshot') sounds. */
  timer?: ReturnType<typeof setTimeout>;
  density: number;
}

const DEFAULT_DENSITY = 0.5;

@Injectable({
  providedIn: 'root',
})
export class AmbientSoundService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterVolume = 1;
  private readonly layers = new Map<string, ActiveLayer>();
  private readonly buffers = new Map<string, AudioBuffer>();

  /**
   * Reconciles the currently playing layers with the desired mix:
   * adds new sounds, removes the ones no longer present and updates
   * volume/density of the ones that stay.
   */
  async setMix(mix: SoundLayer[]): Promise<void> {
    if (!mix.length) {
      this.stop();
      return;
    }

    this.ensureContext();
    const desiredIds = new Set(mix.map((layer) => layer.id));

    for (const id of [...this.layers.keys()]) {
      if (!desiredIds.has(id)) {
        this.removeLayer(id);
      }
    }

    for (const layer of mix) {
      const active = this.layers.get(layer.id);
      if (active) {
        this.setLayerVolume(layer.id, layer.volume);
        const nextDensity = layer.density ?? DEFAULT_DENSITY;
        const densityChanged = nextDensity !== active.density;
        active.density = nextDensity;
        // Reschedule the pending shot so a frequency change takes effect now
        // instead of only after the current (old) interval elapses.
        if (densityChanged && active.timer) {
          this.scheduleOneshot(layer.id);
        }
      } else {
        await this.addLayer(layer);
      }
    }
  }

  /** Plays a single shot of a sound (used as immediate slider feedback). */
  previewLayer(id: string): void {
    this.playOneshot(id);
  }

  setLayerVolume(id: string, volume: number): void {
    const layer = this.layers.get(id);
    if (layer && this.audioContext) {
      layer.gain.gain.setValueAtTime(this.clamp(volume), this.audioContext.currentTime);
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = this.clamp(volume);
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
    }
  }

  stop(): void {
    for (const id of [...this.layers.keys()]) {
      this.removeLayer(id);
    }

    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
  }

  private async addLayer(layer: SoundLayer): Promise<void> {
    const sound = getFocusSoundById(layer.id);
    if (!sound || !this.audioContext || !this.masterGain) {
      return;
    }

    const buffer = await this.loadBuffer(layer.id, sound.file);
    // The mix may have changed while the buffer was loading.
    if (!this.audioContext || !this.masterGain || this.layers.has(layer.id)) {
      return;
    }

    const gain = this.audioContext.createGain();
    gain.gain.value = this.clamp(layer.volume);
    gain.connect(this.masterGain);

    const density = layer.density ?? DEFAULT_DENSITY;

    if (sound.mode === 'oneshot') {
      this.layers.set(layer.id, { gain, density });
      this.playOneshot(layer.id);
      this.scheduleOneshot(layer.id);
    } else {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();
      this.layers.set(layer.id, { gain, source, density });
    }
  }

  private playOneshot(id: string): void {
    const active = this.layers.get(id);
    const buffer = this.buffers.get(id);
    if (!this.audioContext || !active || !buffer) {
      return;
    }
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(active.gain);
    source.start();
  }

  private scheduleOneshot(id: string): void {
    const active = this.layers.get(id);
    const sound = getFocusSoundById(id);
    if (!active || !sound) {
      return;
    }

    if (active.timer) {
      clearTimeout(active.timer);
    }

    const wait = this.nextGapSeconds(sound, active.density) * 1000;
    active.timer = setTimeout(() => {
      if (!this.layers.has(id)) {
        return;
      }
      this.playOneshot(id);
      this.scheduleOneshot(id);
    }, wait);
  }

  /**
   * Maps density (0 rare → 1 frequent) to a gap inside the sound's range,
   * with a little jitter so it never feels metronomic.
   */
  private nextGapSeconds(sound: FocusSound, density: number): number {
    const [min, max] = sound.gapRange ?? DEFAULT_GAP_RANGE;
    const base = max - this.clamp(density) * (max - min);
    const jitter = 0.8 + Math.random() * 0.4;
    return Math.max(min, base * jitter);
  }

  private removeLayer(id: string): void {
    const layer = this.layers.get(id);
    if (!layer) {
      return;
    }

    if (layer.timer) {
      clearTimeout(layer.timer);
    }
    if (layer.source) {
      try {
        layer.source.stop();
      } catch {
        // already stopped
      }
      layer.source.disconnect();
    }
    layer.gain.disconnect();
    this.layers.delete(id);
  }

  private async loadBuffer(id: string, file: string): Promise<AudioBuffer> {
    const cached = this.buffers.get(id);
    if (cached) {
      return cached;
    }

    const response = await fetch(file);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.audioContext!.decodeAudioData(arrayBuffer);
    this.buffers.set(id, buffer);
    return buffer;
  }

  private ensureContext(): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioContext.destination);
    }

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }
  }

  private clamp(volume: number): number {
    if (Number.isNaN(volume)) {
      return 0;
    }
    return Math.min(Math.max(volume, 0), 1);
  }
}
