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
        completeWord();
      }
      return;
    }

    // Check character input - if correct, advance
    if (isCharacterCorrect(lastChar, expectedChar)) {
      if (hasMoreChars(currentWord, charIndex + 1)) {
        setCharIndex(charIndex + 1);
        setUserInput('');
      } else {
        completeWord();
      }
    }
    // If incorrect, just show red feedback and let user continue/backspace
  };

  const completeWord = () => {
    setIsWordComplete(true);

    if (hasMoreWords(words, wordIndex)) {
      setTimeout(() => {
        setWordIndex(wordIndex + 1);
        setCharIndex(0);
        setUserInput('');
        setIsWordComplete(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 600);
    } else {
      setTimeout(() => {
        onComplete();
      }, 800);
    }
  };

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

      {renderWord()}

      {isWordComplete && (
        <div className="word-complete-message">
          ✓
        </div>
      )}

      {isComplete && (
        <div className="context-complete-message">
          ✨ All words completed!
        </div>
      )}
    </div>
  );
}

export default WordProgressionInput;
