import { useState, useEffect, useRef, useMemo } from 'react';
import TopicNameInput from './components/TopicNameInput';
import WordProgressionInput from './components/WordProgressionInput';
import BackgroundFader from './components/BackgroundFader';
import SettingsPanel from './components/SettingsPanel';
import { fetchTopicImage, fetchFreshTopicImage } from './utils/unsplash';
import { useTopics } from './hooks/useTopics';
import { useTopicContexts } from './hooks/useTopicContexts';
import { useTopicBgm } from './hooks/useTopicBgm';
import { Settings, loadSettings, saveSettings } from './settings';
import './styles/globals.css';

type Stage = 'topic' | 'context';

function App() {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('topic');
  const [topicInput, setTopicInput] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Per-topic visit counters drive sequential context rotation
  const visitsRef = useRef<Record<string, number>>({});

  const { topics, loading: topicsLoading } = useTopics();
  const longestTopicName = useMemo(
    () => (topics.length ? Math.max(...topics.map((t) => t.name.length)) : 0),
    [topics]
  );
  const currentTopic = topics[currentTopicIndex];
  const { contexts } = useTopicContexts(currentTopic?.name ?? '');
  const { tracks } = useTopicBgm(currentTopic?.name ?? '');
  const [trackIndex, setTrackIndex] = useState(0);
  const currentTrack = tracks.length > 0 ? tracks[trackIndex % tracks.length] : null;

  // Apply and persist settings
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.style.setProperty('--font-scale', String(settings.fontScale));
    root.style.setProperty('--bg-opacity', String(settings.bgOpacity));
    saveSettings(settings);
  }, [settings]);

  // One persistent audio element for the BGM playlist
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Start the playlist from the first track when the topic changes
  useEffect(() => {
    setTrackIndex(0);
  }, [currentTopic?.name]);

  // Auto-advance to the next track when one finishes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setTrackIndex((prev) => (tracks.length > 0 ? (prev + 1) % tracks.length : 0));
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [tracks.length]);

  // Latest volume/fade values for the envelope loop (avoids effect churn)
  const volumeRef = useRef(settings.bgmVolume);
  const fadeRef = useRef(settings.bgmFade);
  useEffect(() => {
    volumeRef.current = settings.bgmVolume;
    fadeRef.current = settings.bgmFade;
  }, [settings.bgmVolume, settings.bgmFade]);

  // Play/pause the current track with fade in/out envelope
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Stopping: fade out from the current volume, then pause
    if (!settings.bgmOn || !currentTrack) {
      if (audio.paused) return;
      const startVolume = audio.volume;
      const fadeMs = Math.max(50, fadeRef.current * 1000);
      const start = performance.now();
      const fadeOut = window.setInterval(() => {
        const progress = Math.min(1, (performance.now() - start) / fadeMs);
        audio.volume = startVolume * (1 - progress);
        if (progress >= 1) {
          window.clearInterval(fadeOut);
          audio.pause();
        }
      }, 50);
      return () => window.clearInterval(fadeOut);
    }

    let envelope: number | undefined;
    let crossfade: number | undefined;
    let retry: (() => void) | null = null;

    const startPlayback = () => {
      if (audio.src !== currentTrack.url) {
        audio.src = currentTrack.url;
      }
      audio.volume = 0;

      // Envelope: fade in at track start, fade out approaching track end
      envelope = window.setInterval(() => {
        if (audio.paused) return;
        const fade = fadeRef.current;
        const target = volumeRef.current;
        let volume = target;
        if (fade > 0) {
          volume = Math.min(volume, target * Math.min(1, audio.currentTime / fade));
          if (isFinite(audio.duration) && audio.duration > 0) {
            const remaining = audio.duration - audio.currentTime;
            volume = Math.min(volume, target * Math.max(0, Math.min(1, remaining / fade)));
          }
        }
        audio.volume = Math.max(0, Math.min(1, volume));
      }, 50);

      audio.play().catch(() => {
        // Autoplay blocked until the user interacts — retry on next keypress
        retry = () => {
          audio.play().catch((err: Error) => console.warn('BGM playback blocked:', err.message));
        };
        window.addEventListener('keydown', retry, { once: true });
      });
    };

    if (!audio.paused && audio.src && audio.src !== currentTrack.url) {
      // Track replaced mid-play (topic change / manual skip):
      // fade the old one out before starting the new one
      const startVolume = audio.volume;
      const fadeMs = Math.max(50, fadeRef.current * 1000);
      const start = performance.now();
      crossfade = window.setInterval(() => {
        const progress = Math.min(1, (performance.now() - start) / fadeMs);
        audio.volume = startVolume * (1 - progress);
        if (progress >= 1) {
          window.clearInterval(crossfade);
          startPlayback();
        }
      }, 50);
    } else {
      startPlayback();
    }

    return () => {
      if (envelope) window.clearInterval(envelope);
      if (crossfade) window.clearInterval(crossfade);
      if (retry) window.removeEventListener('keydown', retry);
    };
  }, [settings.bgmOn, currentTrack]);

  // Periodically randomize the background within the current topic
  useEffect(() => {
    if (settings.bgInterval <= 0 || !currentTopic) return;

    const id = window.setInterval(async () => {
      try {
        const url = await fetchFreshTopicImage(currentTopic.name);
        if (url) {
          setBackgroundUrl(url);
        }
      } catch (error) {
        console.warn('Background refresh failed:', (error as Error).message);
      }
    }, settings.bgInterval * 1000);

    return () => window.clearInterval(id);
  }, [settings.bgInterval, currentTopic?.name]);

  const stepTrack = (delta: number) => {
    if (tracks.length === 0) return;
    setTrackIndex((prev) => (prev + delta + tracks.length) % tracks.length);
  };

  // Load a topic-matched Unsplash background; keep the previous one on failure
  useEffect(() => {
    if (!currentTopic) return;
    let cancelled = false;

    const loadBackground = async () => {
      try {
        const url = await fetchTopicImage(currentTopic.name);
        if (!cancelled && url) {
          setBackgroundUrl(url);
        }
      } catch (error) {
        console.warn('Background image unavailable:', (error as Error).message);
      }
    };

    loadBackground();
    return () => {
      cancelled = true;
    };
  }, [currentTopic?.name]);

  // Detect when topic name is complete (length only, allow typos),
  // then pick this visit's context from the pool (rotates per visit)
  useEffect(() => {
    if (!currentTopic) return;
    if (stage === 'topic' && topicInput.length > 0) {
      if (topicInput.length === currentTopic.name.length && contexts.length > 0) {
        const visits = visitsRef.current[currentTopic.name] ?? 0;
        visitsRef.current[currentTopic.name] = visits + 1;

        setSelectedContext(contexts[visits % contexts.length]);
        setStage('context');
        setTopicInput('');
      }
    }
  }, [topicInput, currentTopic, stage, contexts]);

  const handleContextComplete = () => {
    setStage('topic');
    setTopicInput('');

    if (topics.length === 0) return;

    switch (settings.playback) {
      case 'loop':
        // Run all topics in sequence, cycling forever
        setCurrentTopicIndex((prev) => (prev + 1) % topics.length);
        break;
      case 'shuffle': {
        // Jump to a random different topic
        setCurrentTopicIndex((prev) => {
          if (topics.length < 2) return prev;
          let next = prev;
          while (next === prev) {
            next = Math.floor(Math.random() * topics.length);
          }
          return next;
        });
        break;
      }
      case 'lock':
        // Stay on the current topic until the user switches manually
        break;
    }
  };

  // Manual topic switching (‹ ›) — always available
  const switchTopic = (delta: number) => {
    if (topics.length === 0) return;
    setCurrentTopicIndex((prev) => (prev + delta + topics.length) % topics.length);
    setStage('topic');
    setTopicInput('');
  };

  const handleSettingsChange = (patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="app-container">
      <BackgroundFader url={backgroundUrl} />

      <header className="app-header">
        <div className="app-logo">
          {/* logo image goes here later */}
          <h1>TypinVibin</h1>
        </div>
        <div className="topic-nav">
          <button
            type="button"
            className="topic-nav-btn"
            aria-label="Previous topic"
            disabled={topics.length === 0}
            onClick={() => switchTopic(-1)}
          >
            ‹
          </button>
          <p className="current-topic" style={{ width: `${longestTopicName}ch` }}>
            {currentTopic?.name ?? ''}
          </p>
          <button
            type="button"
            className="topic-nav-btn"
            aria-label="Next topic"
            disabled={topics.length === 0}
            onClick={() => switchTopic(1)}
          >
            ›
          </button>
        </div>
        <div className={`bgm-controls ${settings.bgmOn && currentTrack ? '' : 'bgm-dimmed'}`}>
          <button
            type="button"
            className="bgm-btn"
            aria-label="Previous track"
            disabled={!settings.bgmOn || tracks.length === 0}
            onClick={() => stepTrack(-1)}
          >
            ⏮
          </button>
          <span className="bgm-track" title={currentTrack?.name ?? ''}>
            {currentTrack ? (
              <span className="bgm-track-text">{currentTrack.name}</span>
            ) : (
              '—'
            )}
          </span>
          <button
            type="button"
            className="bgm-btn"
            aria-label="Next track"
            disabled={!settings.bgmOn || tracks.length === 0}
            onClick={() => stepTrack(1)}
          >
            ⏭
          </button>
        </div>
        <SettingsPanel settings={settings} onChange={handleSettingsChange} />
      </header>

      <main className="app-main">
        {topicsLoading && topics.length === 0 && (
          <p className="app-status">Loading…</p>
        )}

        {!topicsLoading && topics.length === 0 && (
          <p className="app-status">No topics available</p>
        )}

        {currentTopic && stage === 'topic' && (
          <TopicNameInput
            topicName={currentTopic.name}
            userInput={topicInput}
            onInputChange={setTopicInput}
            isComplete={false}
          />
        )}

        {currentTopic && stage === 'context' && selectedContext && (
          <WordProgressionInput
            key={`${currentTopic.name}-${selectedContext}`}
            context={selectedContext}
            onComplete={handleContextComplete}
            isComplete={false}
          />
        )}
      </main>
    </div>
  );
}

export default App;
