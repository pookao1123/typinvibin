import React, { useState, useEffect } from 'react';
import CharacterDisplay from './CharacterDisplay';

function TopicNameInput({ topicName, userInput, onInputChange, isComplete }) {
  // Global window keydown listener
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Filter control key combinations to allow browser shortcuts
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      const char = event.key;

      // Process single character input only up to topic name length
      if (char.length === 1 && userInput.length < topicName.length && !isComplete) {
        onInputChange(userInput + char);
        event.preventDefault();
      }
      // Handle backspace for corrections
      else if (char === 'Backspace' && userInput.length > 0) {
        onInputChange(userInput.slice(0, -1));
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userInput, topicName.length, isComplete, onInputChange]);

  const getCharacterStatus = (index) => {
    if (index < userInput.length) {
      return userInput[index] === topicName[index] ? 'correct' : 'incorrect';
    }
    return 'untyped';
  };

  const cursorPosition = userInput.length;

  return (
    <div className="topic-input-section">
      <div className="topic-name-display">
        {topicName.split('').map((char, index) => (
          <CharacterDisplay
            key={index}
            char={char}
            status={getCharacterStatus(index)}
            isCursor={index === cursorPosition}
          />
        ))}
      </div>

      {isComplete && (
        <div className="topic-complete-message">
          Perfect! Loading context...
        </div>
      )}
    </div>
  );
}

export default TopicNameInput;
