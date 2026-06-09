import React, { useState, useEffect } from 'react';
import { topics } from './data/topics.js';
import TopicDisplay from './components/TopicDisplay';
import ContextDisplay from './components/ContextDisplay';
import TypingInput from './components/TypingInput';
import Progress from './components/Progress';
import './styles/globals.css';

function App() {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const currentTopic = topics[currentTopicIndex];
  const progressPercent = (userInput.length / currentTopic.context.length) * 100;
  const isMatching = userInput === currentTopic.context.substring(0, userInput.length);

  useEffect(() => {
    if (userInput.length > 0 && userInput === currentTopic.context) {
      setIsCompleted(true);
      const timer = setTimeout(() => {
        advanceToNextTopic();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userInput]);

  const advanceToNextTopic = () => {
    setCurrentTopicIndex((prev) => (prev + 1) % topics.length);
    setUserInput('');
    setIsCompleted(false);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>TypinVibin</h1>
        <p className="subtitle">Immerse yourself in mindful typing practice</p>
      </header>

      <main className="main-content">
        <TopicDisplay
          topic={currentTopic.name}
          topicNumber={currentTopicIndex + 1}
          totalTopics={topics.length}
        />

        <ContextDisplay
          context={currentTopic.context}
          userInput={userInput}
          isMatching={isMatching}
          isCompleted={isCompleted}
        />

        <TypingInput
          value={userInput}
          onChange={setUserInput}
          disabled={isCompleted}
          placeholder="Start typing..."
        />

        <Progress
          completed={userInput.length}
          total={currentTopic.context.length}
          percent={progressPercent}
          isCompleted={isCompleted}
        />

        {isCompleted && (
          <div className="completion-message">
            <p>✨ Perfect! Moving to next topic...</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Type to practice • Progress flows naturally • Take your time</p>
      </footer>
    </div>
  );
}

export default App;
