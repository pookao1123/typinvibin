// Helper functions for word-by-word progression

export function getCurrentWord(words, wordIndex) {
  return words[wordIndex] || '';
}

export function getCurrentChar(word, charIndex) {
  return word[charIndex] || '';
}

export function isSpecialChar(char) {
  return /[\s.,!?;:'"\-—()[\]{}]/.test(char);
}

export function isCharacterCorrect(inputChar, expectedChar) {
  return inputChar === expectedChar;
}

export function getNextWordIndex(words, currentIndex) {
  return (currentIndex + 1) % words.length;
}

export function hasMoreChars(word, charIndex) {
  return charIndex < word.length;
}

export function hasMoreWords(words, wordIndex) {
  return wordIndex < words.length - 1;
}

export function getProgress(wordIndex, charIndex, word) {
  return {
    wordIndex,
    charIndex,
    totalChars: word.length,
    progress: charIndex / word.length
  };
}
