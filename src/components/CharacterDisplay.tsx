export type CharStatus = 'correct' | 'incorrect' | 'untyped';

interface CharacterDisplayProps {
  char: string;
  status: CharStatus;
  isCursor: boolean;
}

function CharacterDisplay({ char, status, isCursor }: CharacterDisplayProps) {
  const getStatusClass = (): string => {
    switch (status) {
      case 'correct':
        return 'char-correct';
      case 'incorrect':
        return 'char-incorrect';
      case 'untyped':
        return 'char-untyped';
      default:
        return '';
    }
  };

  return (
    <span className={`character ${getStatusClass()} ${isCursor ? 'cursor-position' : ''}`}>
      {char === ' ' ? ' ' : char}
      {isCursor && <span className="cursor"></span>}
    </span>
  );
}

export default CharacterDisplay;
