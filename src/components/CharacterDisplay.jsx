import React from 'react';

function CharacterDisplay({ char, status }) {
  // status: 'correct' | 'incorrect' | 'untyped'
  const getStatusClass = () => {
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
    <span className={`character ${getStatusClass()}`}>
      {char === ' ' ? ' ' : char}
    </span>
  );
}

export default CharacterDisplay;
