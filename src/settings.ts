export type PlaybackMode = 'loop' | 'shuffle' | 'lock';

export interface Settings {
  fontScale: number;        // 0.5 - 2, multiplies the practice text size
  theme: 'light' | 'dark';
  bgmOn: boolean;
  bgmVolume: number;        // 0 - 1, BGM playback volume
  bgmFade: number;          // seconds — fade in/out at track start/end/stop
  bgOpacity: number;        // 0 - 1, how visible the background photo is
  bgInterval: number;       // seconds between background randomizations (0 = off)
  // loop: cycle topics in sequence | shuffle: random topic order |
  // lock: stay on the current topic until changed manually via the arrows
  playback: PlaybackMode;
}

export const defaultSettings: Settings = {
  fontScale: 1,
  theme: 'light',
  bgmOn: false,
  bgmVolume: 0.4,
  bgmFade: 1,
  bgOpacity: 0.2,
  bgInterval: 0,
  playback: 'loop',
};

/** Allowed fade durations in seconds */
export const FADE_STEPS = [0.2, 0.5, 1, 2, 3, 5, 10];

/** Background randomize intervals in seconds (0 = off) */
export const BG_INTERVAL_STEPS: { label: string; value: number }[] = [
  { label: 'Off', value: 0 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
  { label: '5m', value: 300 },
];

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
