import React, { useState, useEffect } from 'react';
import { topics } from './data/topics.js';
import TopicNameInput from './components/TopicNameInput';
import WordProgressionInput from './components/WordProgressionInput';
import './styles/globals.css';

function App() {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [stage, setStage] = useState('topic'); // 'topic' | 'context' | 'completed'
  const [topicInput, setTopicInput] = useState('');

  const currentTopic = topics[currentTopicIndex];

  // Detect when topic name is complete
  useEffect(() => {
    if (topicInput.length === currentTopic.name.length && topicInput === currentTopic.name) {
      setStage('contextLoading');
      const timer = setTimeout(() => {
        setStage('context');
        setTopicInput('');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [topicInput, currentTopic.name]);

  const handleContextComplete = () => {
    setStage('completed');
    const timer = setTimeout(() => {
      advanceToNextTopic();
    }, 1500);
    return () => clearTimeout(timer);
  };

  const advanceToNextTopic = () => {
    setCurrentTopicIndex((prev) => (prev + 1) % topics.length);
    setStage('topic');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>TypinVibin</h1>
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

        {stage === 'contextLoading' && (
          <div className="loading-message">
            Loading word progression...
          </div>
        )}

        {(stage === 'context' || stage === 'completed') && (
          <WordProgressionInput
            context={currentTopic.context}
            onComplete={handleContextComplete}
            isComplete={stage === 'completed'}
          />
        )}
      </main>

      <footer className="app-footer">
        {stage === 'topic' && 'Type the topic name'}
        {stage === 'context' && 'Type each character'}
        {stage === 'completed' && 'Perfect!'}
      </footer>
    </div>
  );
}

export default App;
