// Helper functions for word-by-word progression

export interface Progress {
  wordIndex: number;
  charIndex: number;
  totalChars: number;
  progress: number;
}

export function getCurrentWord(words: string[], wordIndex: number): string {
  return words[wordIndex] || '';
}

export function getCurrentChar(word: string, charIndex: number): string {
  return word[charIndex] || '';
}

export function isSpecialChar(char: string): boolean {
  return /[\s.,!?;:'"\-—()[\]{}]/.test(char);
}

export function isCharacterCorrect(inputChar: string, expectedChar: string): boolean {
  return inputChar === expectedChar;
}

export function getNextWordIndex(words: string[], currentIndex: number): number {
  return (currentIndex + 1) % words.length;
}

export function hasMoreChars(word: string, charIndex: number): boolean {
  return charIndex < word.length;
}

export function hasMoreWords(words: string[], wordIndex: number): boolean {
  return wordIndex < words.length - 1;
}

export function getProgress(wordIndex: number, charIndex: number, word: string): Progress {
  return {
    wordIndex,
    charIndex,
    totalChars: word.length,
    progress: charIndex / word.length
  };
}
