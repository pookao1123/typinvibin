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
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isWordComplete, setIsWordComplete] = useState(false);

  const words = splitContextIntoWords(context);
  const currentWord = getCurrentWord(words, wordIndex);
  const currentChar = getCurrentChar(currentWord, charIndex);
  const isInputCorrect = userInput.length > 0 && isCharacterCorrect(userInput[userInput.length - 1], currentChar);

  // Global window keydown listener
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Filter control key combinations to allow browser shortcuts
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      const char = event.key;

      // Process single character input
      if (char.length === 1) {
        handleCharacterInput(char);
        event.preventDefault();
      }
      // Handle backspace for corrections
      else if (char === 'Backspace') {
        handleBackspace();
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wordIndex, charIndex, userInput, currentWord, currentChar]);

  const handleCharacterInput = (char) => {
    const input = userInput + char;
    setUserInput(input);

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
    if (isCharacterCorrect(char, expectedChar)) {
      if (hasMoreChars(currentWord, charIndex + 1)) {
        setCharIndex(charIndex + 1);
        setUserInput('');
      } else {
        completeWord();
      }
    }
    // If incorrect, just show red feedback and let user backspace or continue
  };

  const handleBackspace = () => {
    if (userInput.length > 0) {
      setUserInput(userInput.slice(0, -1));
    } else if (charIndex > 0) {
      // Allow backspacing to previous character
      setCharIndex(charIndex - 1);
      setUserInput('');
    }
  };

  const completeWord = () => {
    setIsWordComplete(true);

    if (hasMoreWords(words, wordIndex)) {
      setTimeout(() => {
        setWordIndex(wordIndex + 1);
        setCharIndex(0);
        setUserInput('');
        setIsWordComplete(false);
      }, 600);
    } else {
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

  return (
    <div className="word-progression-section">
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
