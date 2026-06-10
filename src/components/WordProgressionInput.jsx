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

  // Memoized backspace handler - unified logic
  const handleBackspace = useCallback(() => {
    // Handle delete from current input first
    setUserInput((prevInput) => {
      if (prevInput.length > 0) {
        // Delete one character from current input
        return prevInput.slice(0, -1);
      }
      return prevInput;
    });

    // Then check if we need to move cursor back
    setCharIndex((prevIndex) => {
      if (prevIndex > 0) {
        // Move cursor back one position
        setCharCorrectness((prev) => {
          const updated = { ...prev };
          delete updated[prevIndex - 1];
          return updated;
        });
        return prevIndex - 1;
      }
      return prevIndex;
    });
  }, []);

  // Memoized word completion handler
  const completeWord = useCallback(() => {
    setIsWordComplete(true);

    if (hasMoreWords(words, wordIndex)) {
      // Move to next word immediately - no delay blocking input
      setWordIndex((prev) => prev + 1);
      setCharIndex(0);
      setUserInput('');
      setCharCorrectness({}); // Reset for new word
      setIsWordComplete(false);
    } else {
      // Complete context immediately
      onComplete();
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
    </div>
  );
}

export default WordProgressionInput;
