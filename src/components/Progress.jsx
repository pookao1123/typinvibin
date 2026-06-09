import React from 'react';

function Progress({ completed, total, percent, isCompleted }) {
  return (
    <div className="progress-section">
      <div className="progress-bar-container">
        <div
          className={`progress-bar ${isCompleted ? 'completed' : ''}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className="progress-stats">
        <span className="stat">
          {completed} / {total} characters
        </span>
        <span className="stat">
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
}

export default Progress;
