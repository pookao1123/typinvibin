import { useState, useCallback, useEffect } from 'react';
import { splitContextIntoWords } from '../utils/wordDetection';
import {
  getCurrentWord,
  getCurrentChar,
  isSpecialChar,
  isCharacterCorrect,
  hasMoreChars,
  hasMoreWords
} from '../utils/wordProgression';
import CharacterDisplay, { CharStatus } from './CharacterDisplay';

interface WordProgressionInputProps {
  context: string;
  onComplete: () => void;
  isComplete: boolean;
}

function WordProgressionInput({ context, onComplete }: WordProgressionInputProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isWordComplete, setIsWordComplete] = useState(false);
  // Track correctness for each position
  const [charCorrectness, setCharCorrectness] = useState<Record<number, boolean>>({});
  // Finished word kept mounted briefly so it can pan up + fade out
  const [exiting, setExiting] = useState<{
    word: string;
    correctness: Record<number, boolean>;
    id: number;
  } | null>(null);

  // Fallback cleanup in case animationend never fires (e.g. hidden tab)
  useEffect(() => {
    if (!exiting) return;
    const id = window.setTimeout(() => setExiting(null), 700);
    return () => window.clearTimeout(id);
  }, [exiting]);

  const words = splitContextIntoWords(context);
  const currentWord = getCurrentWord(words, wordIndex);
  const nextWord = wordIndex + 1 < words.length ? words[wordIndex + 1] : null;
  const currentChar = getCurrentChar(currentWord, charIndex);
  const isInputCorrect = userInput.length > 0 && isCharacterCorrect(userInput[userInput.length - 1], currentChar);

  // Memoized word completion handler. Receives the word's final correctness
  // map so the exiting copy keeps its red/green feedback while animating out.
  const completeWord = useCallback((finalCorrectness: Record<number, boolean>) => {
    setIsWordComplete(true);

    if (hasMoreWords(words, wordIndex)) {
      // Keep the finished word mounted for its pan-up/fade-out animation
      setExiting({
        word: getCurrentWord(words, wordIndex),
        correctness: finalCorrectness,
        id: wordIndex
      });
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

  // Memoized handler with stable reference
  const handleCharacterInput = useCallback((char: string) => {
    const word = getCurrentWord(words, wordIndex);
    const expectedChar = getCurrentChar(word, charIndex);

    setUserInput((prevInput) => prevInput + char);

    // Handle special characters (apostrophes, punctuation) - auto-skip,
    // but record them as passed so they display a state (green)
    if (isSpecialChar(expectedChar)) {
      setCharCorrectness((prev) => ({
        ...prev,
        [charIndex]: true
      }));
      if (hasMoreChars(word, charIndex + 1)) {
        setCharIndex((prev) => prev + 1);
        setUserInput('');
      } else {
        completeWord({ ...charCorrectness, [charIndex]: true });
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
      completeWord({ ...charCorrectness, [charIndex]: isCorrect });
    }
  }, [wordIndex, charIndex, words, charCorrectness, completeWord]);

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

  // Global window keydown listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

  // Render current word with character feedback.
  // Keyed by wordIndex so each new word re-mounts and plays the
  // slide-up-from-preview animation.
  const renderWord = () => {
    return (
      <div className="word-display" key={wordIndex}>
        {currentWord.split('').map((char, idx) => {
          let status: CharStatus = 'untyped';

          // Check if this position has been typed
          if (Object.prototype.hasOwnProperty.call(charCorrectness, idx)) {
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
      <div className="word-stage">
        {exiting && (
          <div
            className="word-display word-exit"
            key={`exit-${exiting.id}`}
            aria-hidden="true"
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget) setExiting(null);
            }}
          >
            {exiting.word.split('').map((char, idx) => (
              <CharacterDisplay
                key={idx}
                char={char}
                status={exiting.correctness[idx] ? 'correct' : 'incorrect'}
                isCursor={false}
              />
            ))}
          </div>
        )}
        {renderWord()}
      </div>
      {nextWord && (
        <div className="word-next" key={`next-${wordIndex}`} aria-hidden="true">
          {nextWord}
        </div>
      )}
    </div>
  );
}

export default WordProgressionInput;
