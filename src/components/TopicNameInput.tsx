import { useEffect } from 'react';
import CharacterDisplay, { CharStatus } from './CharacterDisplay';

interface TopicNameInputProps {
  topicName: string;
  userInput: string;
  onInputChange: (input: string) => void;
  isComplete: boolean;
}

function TopicNameInput({ topicName, userInput, onInputChange, isComplete }: TopicNameInputProps) {
  // Global window keydown listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Filter control key combinations to allow browser shortcuts
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      const char = event.key;

      // Process any single character input and track it (typo tolerance)
      if (char.length === 1 && !isComplete) {
        // Only add if we haven't filled all positions yet
        if (userInput.length < topicName.length) {
          onInputChange(userInput + char);
          event.preventDefault();
        }
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

  const getCharacterStatus = (index: number): CharStatus => {
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
