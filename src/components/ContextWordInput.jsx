import React, { useRef, useEffect } from 'react';
import CharacterDisplay from './CharacterDisplay';
import { splitContextIntoWords } from '../utils/wordDetection';

function ContextWordInput({ context, userInput, onInputChange, isComplete, currentWord }) {
  const inputRef = useRef(null);
  const words = splitContextIntoWords(context);

  useEffect(() => {
    if (inputRef.current && !isComplete) {
      inputRef.current.focus();
    }
  }, [isComplete]);

  const getCharacterStatus = (char, idx) => {
    if (idx < userInput.length) {
      return userInput[idx] === char ? 'correct' : 'incorrect';
    }
    return 'untyped';
  };

  const contextChars = context.split('');
  const cursorPosition = userInput.length;

  return (
    <div className="context-input-section">
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={(e) => onInputChange(e.target.value)}
        disabled={isComplete}
        className="hidden-input"
        spellCheck="false"
        autoComplete="off"
      />

      <div className="context-header">
        <h3>Context</h3>
      </div>

      <div className="context-display-area">
        <p className="context-text">
          {contextChars.map((char, idx) => (
            <CharacterDisplay
              key={idx}
              char={char}
              status={getCharacterStatus(char, idx)}
              isCursor={idx === cursorPosition}
            />
          ))}
        </p>
      </div>

      <div className="context-stats">
        <div className="current-word">
          Current word: <strong>{currentWord}</strong>
        </div>
        <div className="word-progress">
          Words: {Math.ceil((userInput.split(/\s+/).length))} / {words.length}
        </div>
      </div>

      {isComplete && (
        <div className="context-complete-message">
          ✨ Perfect! Moving to next topic...
        </div>
      )}
    </div>
  );
}

export default ContextWordInput;
