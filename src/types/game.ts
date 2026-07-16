/**
 * Game Phase Enum
 * Represents the finite state machine for the game
 */
export enum GamePhase {
  IDLE = 'IDLE',
  SETUP = 'SETUP',
  RULES = 'RULES',
  GENERATING_LAYOUT = 'GENERATING_LAYOUT',
  MEMORIZATION = 'MEMORIZATION',
  TRANSITION = 'TRANSITION',
  GUESSING = 'GUESSING',
  COMPLETED = 'COMPLETED',
}

/**
 * Word Interface
 * Represents a single word in the game
 */
export interface Word {
  id: string
  original: string
  normalized: string
  found: boolean
  position: {
    x: number
    y: number
  }
  fontSize: number
  rotation: number
  color: string
}

/**
 * Game Statistics Interface
 */
export interface GameStatistics {
  totalWords: number
  foundWords: number
  remainingWords: number
  completionPercentage: number
  totalGuesses: number
  incorrectGuesses: number
  duplicateGuesses: number
  elapsedTime: number
}

/**
 * Game Settings Interface
 */
export interface GameSettings {
  soundEnabled: boolean
  animationEnabled: boolean
  fullscreenEnabled: boolean
}

/**
 * Game State Interface
 * Contains only business information, not UI state
 */
export interface GameState {
  id: string
  title: string
  duration: number
  phase: GamePhase
  startedAt: number | null
  words: Word[]
  statistics: GameStatistics
  settings: GameSettings
  pendingConfig?: {
    title: string
    duration: number
    words: string[]
  }
}

/**
 * Font Size Distribution
 * Weighted distribution for word sizes as per PRD
 */
export type FontSize = 'extra-large' | 'large' | 'medium' | 'small' | 'tiny'

/**
 * Rotation Type
 * Most words horizontal, some vertical
 */
export type Rotation = 'horizontal' | 'vertical'

/**
 * Guess Result
 * Result of validating a guess
 */
export interface GuessResult {
  valid: boolean
  type: 'correct' | 'incorrect' | 'duplicate'
  wordId?: string
  message?: string
}
