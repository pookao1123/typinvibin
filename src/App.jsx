import React, { useState, useEffect } from 'react';
import { topics } from './data/topics.js';
import TopicNameInput from './components/TopicNameInput';
import ContextWordInput from './components/ContextWordInput';
import { splitContextIntoWords } from './utils/wordDetection';
import './styles/globals.css';

function App() {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [stage, setStage] = useState('topic'); // 'topic' | 'context' | 'completed'
  const [topicInput, setTopicInput] = useState('');
  const [contextInput, setContextInput] = useState('');

  const currentTopic = topics[currentTopicIndex];
  const words = splitContextIntoWords(currentTopic.context);

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

  // Detect when context is complete
  useEffect(() => {
    if (stage === 'context' && contextInput.length > 0) {
      // Check if user has typed the full context
      if (contextInput === currentTopic.context) {
        setStage('completed');
        const timer = setTimeout(() => {
          advanceToNextTopic();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [contextInput, currentTopic.context, stage]);

  const advanceToNextTopic = () => {
    setCurrentTopicIndex((prev) => (prev + 1) % topics.length);
    setContextInput('');
    setStage('topic');
  };

  // Determine current word being typed
  const getCurrentWord = () => {
    if (stage !== 'context') return '';

    const typed = contextInput.trim();
    const typedWords = typed.split(/\s+/).filter((w) => w);

    if (typedWords.length === 0) return '';
    return typedWords[typedWords.length - 1];
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
            Loading context...
          </div>
        )}

        {(stage === 'context' || stage === 'completed') && (
          <ContextWordInput
            context={currentTopic.context}
            userInput={contextInput}
            onInputChange={setContextInput}
            isComplete={stage === 'completed'}
            currentWord={getCurrentWord()}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          {stage === 'topic' && 'Type the topic name'}
          {stage === 'context' && 'Type the context word by word'}
          {stage === 'completed' && 'Perfect!'}
          {stage === 'contextLoading' && 'Preparing context...'}
        </p>
      </footer>
    </div>
  );
}

export default App;
