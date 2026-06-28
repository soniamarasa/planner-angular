export type FocusSoundMode = 'bed' | 'oneshot';

export interface FocusSound {
  id: string;
  file: string;
  labelKey: string;
  icon: string;
  /**
   * 'bed' loops continuously (rain, wind...). 'oneshot' plays at randomized
   * intervals (owl, whale...) so short clips don't repeat back-to-back.
   */
  mode: FocusSoundMode;
  /** Seconds between repetitions for 'oneshot' sounds: [minGap, maxGap]. */
  gapRange?: [number, number];
}

export const MAX_SOUND_LAYERS = 5;
// [minGap, maxGap] seconds. Min is a few seconds (not 0) so a clip never
// retriggers on top of itself endlessly; max is the 60s ceiling.
export const DEFAULT_GAP_RANGE: [number, number] = [3, 60];

export const FOCUS_SOUNDS: FocusSound[] = [
  { id: 'rain-1', file: 'assets/sounds/rain-1.mp3', labelKey: 'focusSound.rain1', icon: 'mdi:weather-pouring', mode: 'bed' },
  { id: 'rain-2', file: 'assets/sounds/rain-2.mp3', labelKey: 'focusSound.rain2', icon: 'mdi:weather-partly-rainy', mode: 'bed' },
  { id: 'rain-window', file: 'assets/sounds/rain-window.mp3', labelKey: 'focusSound.rainWindow', icon: 'mdi:window-closed-variant', mode: 'bed' },
  { id: 'rain-forest', file: 'assets/sounds/rain-forest.mp3', labelKey: 'focusSound.rainForest', icon: 'mdi:forest', mode: 'bed' },
  { id: 'beach', file: 'assets/sounds/beach.mp3', labelKey: 'focusSound.beach', icon: 'mdi:beach', mode: 'bed' },
  { id: 'forest', file: 'assets/sounds/forest.mp3', labelKey: 'focusSound.forest', icon: 'mdi:pine-tree', mode: 'bed' },
  { id: 'coffee-shop', file: 'assets/sounds/coffee-shop.mp3', labelKey: 'focusSound.coffeeShop', icon: 'mdi:coffee', mode: 'bed' },
  { id: 'wind', file: 'assets/sounds/wind.mp3', labelKey: 'focusSound.wind', icon: 'mdi:weather-windy', mode: 'oneshot' },
  { id: 'waves', file: 'assets/sounds/waves.mp3', labelKey: 'focusSound.waves', icon: 'mdi:waves', mode: 'oneshot' },
  { id: 'birds', file: 'assets/sounds/birds.mp3', labelKey: 'focusSound.birds', icon: 'mdi:bird', mode: 'oneshot' },
  { id: 'thunder', file: 'assets/sounds/thunder.mp3', labelKey: 'focusSound.thunder', icon: 'mdi:weather-lightning', mode: 'oneshot' },
  { id: 'owl-1', file: 'assets/sounds/owl-1.mp3', labelKey: 'focusSound.owl1', icon: 'mdi:owl', mode: 'oneshot' },
  { id: 'owl-2', file: 'assets/sounds/owl-2.mp3', labelKey: 'focusSound.owl2', icon: 'mdi:owl', mode: 'oneshot' },
  { id: 'whale', file: 'assets/sounds/whale.mp3', labelKey: 'focusSound.whale', icon: 'game-icons:sperm-whale', mode: 'oneshot' },
  { id: 'tibetan-bowl-1', file: 'assets/sounds/tibetan-bowl-1.mp3', labelKey: 'focusSound.tibetanBowl1', icon: 'game-icons:gong', mode: 'oneshot' },
];

export function getFocusSoundById(soundId: string): FocusSound | undefined {
  return FOCUS_SOUNDS.find((sound) => sound.id === soundId);
}
