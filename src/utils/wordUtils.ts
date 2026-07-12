/**
 * Normalize a word for comparison
 * Rules: trim, lowercase, collapse spaces, remove invisible characters
 */
export function normalizeWord(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[​-‍﻿]/g, '')
}

/**
 * Normalize a list of words and remove duplicates
 */
export function normalizeWordList(words: string[]): string[] {
  const normalized = words.map(normalizeWord).filter(w => w.length > 0)
  const unique = Array.from(new Set(normalized))
  return unique
}

/**
 * Check if two words match (case-insensitive, normalized)
 */
export function wordsMatch(word1: string, word2: string): boolean {
  return normalizeWord(word1) === normalizeWord(word2)
}

/**
 * Validate word input statistics
 */
export interface WordValidationStats {
  inputCount: number
  duplicateCount: number
  emptyCount: number
  finalWordCount: number
  normalizedWords: string[]
}

export function validateWordList(rawWords: string[]): WordValidationStats {
  const inputCount = rawWords.length
  const normalized = rawWords.map(normalizeWord)
  const emptyCount = normalized.filter(w => w.length === 0).length
  const validNormalized = normalized.filter(w => w.length > 0)
  const uniqueWords = Array.from(new Set(validNormalized))

  return {
    inputCount,
    duplicateCount: inputCount - emptyCount - uniqueWords.length,
    emptyCount,
    finalWordCount: uniqueWords.length,
    normalizedWords: uniqueWords,
  }
}
