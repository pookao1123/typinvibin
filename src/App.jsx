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

  // Detect when topic name is complete (length only, allow typos)
  useEffect(() => {
    if (stage === 'topic' && topicInput.length > 0) {
      if (topicInput.length === currentTopic.name.length) {
        setStage('context');
        setTopicInput('');
      }
    }
  }, [topicInput, currentTopic.name, stage]);

  const handleContextComplete = () => {
    setStage('completed');
    setTimeout(() => {
      advanceToNextTopic();
    }, 1500);
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

        {stage === 'context' && (
          <WordProgressionInput
            context={currentTopic.context}
            onComplete={handleContextComplete}
            isComplete={false}
          />
        )}

        {stage === 'completed' && (
          <WordProgressionInput
            context={currentTopic.context}
            onComplete={handleContextComplete}
            isComplete={true}
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
