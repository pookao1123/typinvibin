import React from 'react';

function ContextDisplay({ context, userInput, isMatching, isCompleted }) {
  const typed = context.substring(0, userInput.length);
  const untyped = context.substring(userInput.length);

  return (
    <div className={`context-display ${isCompleted ? 'completed' : ''}`}>
      <p className="context-text">
        <span className={`typed ${isMatching ? 'correct' : 'incorrect'}`}>
          {typed}
        </span>
        <span className="untyped">{untyped}</span>
      </p>
      {!isMatching && userInput.length > 0 && (
        <div className="error-indicator">
          <span>⚠ Check your typing</span>
        </div>
      )}
    </div>
  );
}

export default ContextDisplay;
