import React from 'react';

function TopicDisplay({ topic, topicNumber, totalTopics }) {
  return (
    <div className="topic-display">
      <div className="topic-header">
        <h2 className="topic-name">{topic}</h2>
        <span className="topic-count">{topicNumber} of {totalTopics}</span>
      </div>
      <div className="topic-separator"></div>
    </div>
  );
}

export default TopicDisplay;
