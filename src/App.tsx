import { useState, useEffect, useRef } from 'react';
import { topics } from './data/topics';
import TopicNameInput from './components/TopicNameInput';
import WordProgressionInput from './components/WordProgressionInput';
import BackgroundFader from './components/BackgroundFader';
import SettingsPanel from './components/SettingsPanel';
import { fetchTopicImage } from './utils/unsplash';
import { useTopicContexts } from './hooks/useTopicContexts';
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

  const currentTopic = topics[currentTopicIndex];
  const { contexts } = useTopicContexts(currentTopic.name);

  // Apply and persist settings
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.style.setProperty('--font-scale', String(settings.fontScale));
    root.style.setProperty('--bg-opacity', String(settings.bgOpacity));
    saveSettings(settings);
  }, [settings]);

  // Background music — lazily created, toggled from settings
  useEffect(() => {
    if (settings.bgmOn && !audioRef.current) {
      const audio = new Audio('/bgm.mp3');
      audio.loop = true;
      audio.volume = 0.4;
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (settings.bgmOn) {
      audio.play().catch((err: Error) => console.warn('BGM unavailable:', err.message));
    } else {
      audio.pause();
    }
  }, [settings.bgmOn]);

  // Stop audio when the app unmounts
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Load a topic-matched Unsplash background; keep the previous one on failure
  useEffect(() => {
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
  }, [currentTopic.name]);

  // Detect when topic name is complete (length only, allow typos),
  // then pick this visit's context from the pool (rotates per visit)
  useEffect(() => {
    if (stage === 'topic' && topicInput.length > 0) {
      if (topicInput.length === currentTopic.name.length) {
        const pool = contexts.length > 0 ? contexts : [currentTopic.context];
        const visits = visitsRef.current[currentTopic.name] ?? 0;
        visitsRef.current[currentTopic.name] = visits + 1;

        setSelectedContext(pool[visits % pool.length]);
        setStage('context');
        setTopicInput('');
      }
    }
  }, [topicInput, currentTopic, stage, contexts]);

  const handleContextComplete = () => {
    setStage('topic');
    setTopicInput('');

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
            onClick={() => switchTopic(-1)}
          >
            ‹
          </button>
          <p className="current-topic">{currentTopic.name}</p>
          <button
            type="button"
            className="topic-nav-btn"
            aria-label="Next topic"
            onClick={() => switchTopic(1)}
          >
            ›
          </button>
        </div>
        <SettingsPanel settings={settings} onChange={handleSettingsChange} />
      </header>

      <main className="app-main">
        {stage === 'topic' && (
          <TopicNameInput
            topicName={currentTopic.name}
            userInput={topicInput}
            onInputChange={setTopicInput}
            isComplete={false}
          />
        )}

        {stage === 'context' && (
          <WordProgressionInput
            key={`${currentTopic.name}-${selectedContext}`}
            context={selectedContext || currentTopic.context}
            onComplete={handleContextComplete}
            isComplete={false}
          />
        )}
      </main>
    </div>
  );
}

export default App;
