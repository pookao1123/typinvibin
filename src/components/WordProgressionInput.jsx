import React, { useState, useRef, useEffect } from 'react';
import { splitContextIntoWords } from '../utils/wordDetection';
import {
  getCurrentWord,
  getCurrentChar,
  isSpecialChar,
  isCharacterCorrect,
  hasMoreChars,
  hasMoreWords
} from '../utils/wordProgression';
import CharacterDisplay from './CharacterDisplay';

function WordProgressionInput({ context, onComplete, isComplete }) {
  const inputRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [wordInputHistory, setWordInputHistory] = useState([]);
  const [isWordComplete, setIsWordComplete] = useState(false);

  const words = splitContextIntoWords(context);
  const currentWord = getCurrentWord(words, wordIndex);
  const currentChar = getCurrentChar(currentWord, charIndex);
  const isInputCorrect = userInput.length > 0 && isCharacterCorrect(userInput[userInput.length - 1], currentChar);

  useEffect(() => {
    if (inputRef.current && !isComplete) {
      inputRef.current.focus();
    }
  }, [isComplete, wordIndex]);

  const handleCharacterInput = (e) => {
    const input = e.target.value;
    setUserInput(input);

    if (input.length === 0) return;

    const lastChar = input[input.length - 1];
    const expectedChar = currentChar;

    // Handle special characters (spaces, punctuation) - auto-skip
    if (isSpecialChar(expectedChar)) {
      if (hasMoreChars(currentWord, charIndex + 1)) {
        setCharIndex(charIndex + 1);
        setUserInput('');
      } else {
        // Word complete, move to next word
        completeWord();
      }
      return;
    }

    // Check character input
    if (isCharacterCorrect(lastChar, expectedChar)) {
      // Correct character - advance cursor
      if (hasMoreChars(currentWord, charIndex + 1)) {
        setCharIndex(charIndex + 1);
        setUserInput('');
      } else {
        // Word complete
        completeWord();
      }
    } else {
      // Incorrect character - keep showing red feedback but allow backspace
      // User can continue typing or delete
    }
  };

  const completeWord = () => {
    setIsWordComplete(true);
    setWordInputHistory([...wordInputHistory, { word: currentWord, correct: true }]);

    if (hasMoreWords(words, wordIndex)) {
      setTimeout(() => {
        setWordIndex(wordIndex + 1);
        setCharIndex(0);
        setUserInput('');
        setIsWordComplete(false);
      }, 600);
    } else {
      // All words complete
      setTimeout(() => {
        onComplete();
      }, 800);
    }
  };

  // Render current word with character feedback
  const renderWord = () => {
    return (
      <div className="word-display">
        {currentWord.split('').map((char, idx) => {
          let status = 'untyped';
          if (idx < charIndex) {
            status = 'correct';
          } else if (idx === charIndex) {
            status = isInputCorrect ? 'correct' : (userInput.length > 0 ? 'incorrect' : 'untyped');
          }

          return (
            <CharacterDisplay
              key={idx}
              char={char}
              status={status}
              isCursor={idx === charIndex && !isWordComplete}
            />
          );
        })}
      </div>
    );
  };

  const progressPercent = (wordIndex / words.length) * 100;

  return (
    <div className="word-progression-section">
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleCharacterInput}
        disabled={isComplete || isWordComplete}
        className="hidden-input"
        spellCheck="false"
        autoComplete="off"
        maxLength={1}
      />

      <div className="context-header">
        <h3>Word by Word Practice</h3>
      </div>

      <div className="word-display-container">
        {renderWord()}
      </div>

      <div className="character-feedback">
        <div className="feedback-row">
          <span className="feedback-label">Expected:</span>
          <span className="feedback-value">{currentChar || '(space)'}</span>
        </div>
        <div className="feedback-row">
          <span className="feedback-label">Your input:</span>
          <span className={`feedback-value ${isInputCorrect ? 'correct' : (userInput.length > 0 ? 'incorrect' : '')}`}>
            {userInput || '(waiting...)'}
          </span>
        </div>
      </div>

      <div className="progress-indicator">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="progress-text">
          Word {wordIndex + 1} of {words.length} • Character {charIndex + 1} of {currentWord.length}
        </div>
      </div>

      {isWordComplete && (
        <div className="word-complete-message">
          ✓ Perfect word! Loading next...
        </div>
      )}

      {isComplete && (
        <div className="context-complete-message">
          ✨ Excellent! All words completed!
        </div>
      )}
    </div>
  );
}

export default WordProgressionInput;
