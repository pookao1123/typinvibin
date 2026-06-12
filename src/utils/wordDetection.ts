// Smart word detection that handles punctuation naturally
export function splitContextIntoWords(text: string): string[] {
  // Split by spaces, but keep punctuation attached intelligently
  const words: string[] = [];
  let currentWord = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === ' ') {
      if (currentWord) {
        words.push(currentWord);
        currentWord = '';
      }
    } else {
      currentWord += char;
    }
  }

  if (currentWord) {
    words.push(currentWord);
  }

  return words;
}

// Get the full text of a word including punctuation
export function getWordText(words: string[], index: number): string {
  return words[index] || '';
}

// Compare characters and return if they match
export function compareCharacters(typed: string, expected: string): boolean {
  return typed === expected;
}

// Get all characters from context as a flat array
export function getContextCharacters(context: string): string[] {
  return context.split('');
}

// Find character index for a given word and position
export function getCharacterIndexInContext(
  wordIndex: number,
  charInWord: number,
  words: string[]
): number {
  let charIndex = 0;

  for (let w = 0; w < wordIndex; w++) {
    charIndex += words[w].length + 1; // +1 for space
  }

  charIndex += charInWord;
  return charIndex;
}

// Check if a character is a word boundary (space or punctuation)
export function isWordBoundary(char: string): boolean {
  return char === ' ' || /[.,!?;:'"\-—()]/.test(char);
}

// Get next word boundary position
export function getNextWordBoundary(text: string, startIndex: number): number {
  for (let i = startIndex; i < text.length; i++) {
    if (isWordBoundary(text[i])) {
      return i;
    }
  }
  return text.length;
}
