import { useState } from 'react';
import { Settings } from '../settings';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="settings">
      <button
        type="button"
        className="settings-toggle"
        aria-label="Settings"
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div className="settings-panel">
          <div className="settings-row">
            <span className="settings-label">Font size</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.fontScale}
              onChange={(e) => onChange({ fontScale: parseFloat(e.target.value) })}
            />
            <span className="settings-value">{settings.fontScale.toFixed(1)}x</span>
          </div>

          <div className="settings-row">
            <span className="settings-label">Dark theme</span>
            <input
              type="checkbox"
              checked={settings.theme === 'dark'}
              onChange={(e) => onChange({ theme: e.target.checked ? 'dark' : 'light' })}
            />
          </div>

          <div className="settings-row">
            <span className="settings-label">BGM</span>
            <input
              type="checkbox"
              checked={settings.bgmOn}
              onChange={(e) => onChange({ bgmOn: e.target.checked })}
            />
          </div>

          <div className="settings-row">
            <span className="settings-label">Background</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.bgOpacity}
              onChange={(e) => onChange({ bgOpacity: parseFloat(e.target.value) })}
            />
            <span className="settings-value">{Math.round(settings.bgOpacity * 100)}%</span>
          </div>

          <div className="settings-row">
            <span className="settings-label">Playback</span>
            <div className="playback-toggles" role="radiogroup" aria-label="Playback mode">
              <button
                type="button"
                className={`playback-toggle ${settings.playback === 'loop' ? 'active' : ''}`}
                title="Loop — run all topics in sequence, cycling forever"
                onClick={() => onChange({ playback: 'loop' })}
              >
                🔁
              </button>
              <button
                type="button"
                className={`playback-toggle ${settings.playback === 'shuffle' ? 'active' : ''}`}
                title="Shuffle — run all topics in randomized order"
                onClick={() => onChange({ playback: 'shuffle' })}
              >
                🔀
              </button>
              <button
                type="button"
                className={`playback-toggle ${settings.playback === 'lock' ? 'active' : ''}`}
                title="Lock — stay on this topic; change topics only with the arrows"
                onClick={() => onChange({ playback: 'lock' })}
              >
                🔒
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPanel;
