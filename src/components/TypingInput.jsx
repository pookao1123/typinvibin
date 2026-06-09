import React, { useRef, useEffect } from 'react';

function TypingInput({ value, onChange, disabled, placeholder }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <div className="typing-input-wrapper">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="typing-input"
        spellCheck="false"
        autoComplete="off"
      />
    </div>
  );
}

export default TypingInput;
