import React, { useState, useCallback, useEffect } from 'react';
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
  const [charCorrectness, setCharCorrectness] = useState({}); // Track correctness for each position

  const words = splitContextIntoWords(context);
  const currentWord = getCurrentWord(words, wordIndex);
  const currentChar = getCurrentChar(currentWord, charIndex);
  const isInputCorrect = userInput.length > 0 && isCharacterCorrect(userInput[userInput.length - 1], currentChar);

  // Memoized handler with stable reference - no dependencies
  const handleCharacterInput = useCallback((char) => {
    const word = getCurrentWord(words, wordIndex);
    const expectedChar = getCurrentChar(word, charIndex);

    setUserInput((prevInput) => prevInput + char);

    // Handle special characters (spaces, punctuation) - auto-skip
    if (isSpecialChar(expectedChar)) {
      if (hasMoreChars(word, charIndex + 1)) {
        setCharIndex((prev) => prev + 1);
        setUserInput('');
      } else {
        completeWord();
      }
      return;
    }

    // Track whether this character is correct
    const isCorrect = isCharacterCorrect(char, expectedChar);
    setCharCorrectness((prev) => ({
      ...prev,
      [charIndex]: isCorrect
    }));

    // Advance cursor regardless of correctness (typo tolerance)
    // Visual feedback (red/green) is shown by JSX status logic
    if (hasMoreChars(word, charIndex + 1)) {
      setCharIndex((prev) => prev + 1);
      setUserInput('');
    } else {
      completeWord();
    }
  }, [wordIndex, charIndex, words]);

  // Memoized backspace handler
  const handleBackspace = useCallback(() => {
    setUserInput((prevInput) => {
      if (prevInput.length > 0) {
        // Delete from current input
        const newInput = prevInput.slice(0, -1);
        // If input becomes empty, clear charCorrectness for current position
        if (newInput.length === 0) {
          setCharCorrectness((prev) => {
            const updated = { ...prev };
            delete updated[charIndex];
            return updated;
          });
        }
        return newInput;
      } else if (charIndex > 0) {
        // Move cursor back to previous character
        setCharIndex((prev) => prev - 1);
        // Clear correctness for the position we're moving back to
        setCharCorrectness((prev) => {
          const updated = { ...prev };
          delete updated[charIndex - 1];
          return updated;
        });
        return '';
      }
      return prevInput;
    });
  }, [charIndex]);

  // Memoized word completion handler
  const completeWord = useCallback(() => {
    setIsWordComplete(true);

    if (hasMoreWords(words, wordIndex)) {
      setTimeout(() => {
        setWordIndex((prev) => prev + 1);
        setCharIndex(0);
        setUserInput('');
        setCharCorrectness({}); // Reset for new word
        setIsWordComplete(false);
      }, 200); // Faster transition to next word
    } else {
      setTimeout(() => {
        onComplete();
      }, 300); // Faster completion transition
    }
  }, [wordIndex, words, onComplete]);

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
  }, [handleCharacterInput, handleBackspace]);

  // Render current word with character feedback
  const renderWord = () => {
    return (
      <div className="word-display">
        {currentWord.split('').map((char, idx) => {
          let status = 'untyped';

          // Check if this position has been typed
          if (charCorrectness.hasOwnProperty(idx)) {
            status = charCorrectness[idx] ? 'correct' : 'incorrect';
          } else if (idx === charIndex) {
            // Current position - show based on current input
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

      {isComplete && (
        <div className="context-complete-message">
          ✨ All words completed!
        </div>
      )}
    </div>
  );
}

export default WordProgressionInput;
