import React, { useRef, useEffect } from 'react';
import CharacterDisplay from './CharacterDisplay';

function TopicNameInput({ topicName, userInput, onInputChange, isComplete }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !isComplete) {
      inputRef.current.focus();
    }
  }, [isComplete]);

  const getCharacterStatus = (index) => {
    if (index < userInput.length) {
      return userInput[index] === topicName[index] ? 'correct' : 'incorrect';
    }
    return 'untyped';
  };

  const cursorPosition = userInput.length;

  return (
    <div className="topic-input-section">
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={(e) => onInputChange(e.target.value)}
        disabled={isComplete}
        className="hidden-input"
        spellCheck="false"
        autoComplete="off"
        maxLength={topicName.length}
      />

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
