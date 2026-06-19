import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AmbientSoundService {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private activeSound = 'none';

  start(sound: string, volume: number): void {
    if (sound === 'none') {
      this.stop();
      return;
    }

    if (this.activeSound === sound && this.sourceNode) {
      this.setVolume(volume);
      return;
    }

    this.stop();
    this.activeSound = sound;

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume;
    this.gainNode.connect(this.audioContext.destination);

    const buffer = this.createNoiseBuffer(sound);
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = buffer;
    this.sourceNode.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = sound === 'rain' ? 'lowpass' : 'bandpass';
    filter.frequency.value = sound === 'rain' ? 900 : sound === 'cafe' ? 500 : 1200;

    this.sourceNode.connect(filter);
    filter.connect(this.gainNode);
    this.sourceNode.start();
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  stop(): void {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }

    this.gainNode = null;
    this.activeSound = 'none';
  }

  private createNoiseBuffer(sound: string): AudioBuffer {
    const context = this.audioContext!;
    const bufferSize = context.sampleRate * 2;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i += 1) {
      const white = Math.random() * 2 - 1;
      if (sound === 'cafe') {
        data[i] = (data[i - 1] || 0) * 0.98 + white * 0.15;
      } else if (sound === 'white') {
        data[i] = white * 0.35;
      } else {
        data[i] = (data[i - 1] || 0) * 0.96 + white * 0.08;
      }
    }

    return buffer;
  }
}
