export type PlaybackMode = 'loop' | 'shuffle' | 'lock';

export interface Settings {
  fontScale: number;        // 0.5 - 2, multiplies the practice text size
  theme: 'light' | 'dark';
  bgmOn: boolean;
  bgOpacity: number;        // 0 - 1, how visible the background photo is
  // loop: cycle topics in sequence | shuffle: random topic order |
  // lock: stay on the current topic until changed manually via the arrows
  playback: PlaybackMode;
}

export const defaultSettings: Settings = {
  fontScale: 1,
  theme: 'light',
  bgmOn: false,
  bgOpacity: 0.2,
  playback: 'loop',
};

const STORAGE_KEY = 'typinvibin_settings';

export function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return { ...defaultSettings, ...saved };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
