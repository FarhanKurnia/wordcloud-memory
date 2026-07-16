import { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react'
import {
  GameState,
  GamePhase,
  Word,
  GameStatistics,
  GameSettings,
  GuessResult,
} from '../../types/game'
import { DEFAULT_DURATION } from '../../constants/game'
import { generateWordCloudLayout } from '../../services/wordCloudLayout'
import { normalizeWordList } from '../../utils/wordUtils'
import { GameStorage } from '../../storage/gameStorage'

/**
 * Game Actions
 */
type GameAction =
  | { type: 'CREATE_GAME'; payload: { title: string; duration: number; words: string[] } }
  | { type: 'STORE_PENDING_CONFIG'; payload: { title: string; duration: number; words: string[] } }
  | { type: 'START_GAME' }
  | { type: 'GENERATE_LAYOUT'; payload: { viewportWidth: number; viewportHeight: number } }
  | { type: 'TRANSITION_TO_GUESS' }
  | { type: 'SUBMIT_GUESS'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'RESTORE_STATE'; payload: GameState }
  | { type: 'RESET_GAME' }
  | { type: 'SET_PHASE'; payload: GamePhase }

/**
 * Initial Game State
 */
const createInitialGameState = (): GameState => ({
  id: '',
  title: '',
  duration: DEFAULT_DURATION,
  phase: GamePhase.IDLE,
  startedAt: null,
  words: [],
  statistics: {
    totalWords: 0,
    foundWords: 0,
    remainingWords: 0,
    completionPercentage: 0,
    totalGuesses: 0,
    incorrectGuesses: 0,
    duplicateGuesses: 0,
    elapsedTime: 0,
  },
  settings: {
    soundEnabled: true,
    animationEnabled: true,
    fullscreenEnabled: false,
  },
})

/**
 * Game State Transitions (Finite State Machine)
 */
const validTransitions: Record<GamePhase, GamePhase[]> = {
  [GamePhase.IDLE]: [GamePhase.SETUP, GamePhase.RULES],
  [GamePhase.SETUP]: [GamePhase.RULES, GamePhase.IDLE],
  [GamePhase.RULES]: [GamePhase.GENERATING_LAYOUT, GamePhase.SETUP],
  [GamePhase.GENERATING_LAYOUT]: [GamePhase.MEMORIZATION, GamePhase.SETUP],
  [GamePhase.MEMORIZATION]: [GamePhase.TRANSITION, GamePhase.GUESSING], // Allow direct to GUESSING
  [GamePhase.TRANSITION]: [GamePhase.GUESSING],
  [GamePhase.GUESSING]: [GamePhase.COMPLETED],
  [GamePhase.COMPLETED]: [GamePhase.IDLE, GamePhase.SETUP],
}

/**
 * Validate state transition
 */
function canTransition(from: GamePhase, to: GamePhase): boolean {
  return validTransitions[from]?.includes(to) ?? false
}

/**
 * Calculate statistics from words
 */
function calculateStatistics(words: Word[], totalGuesses: number, incorrectGuesses: number, duplicateGuesses: number): GameStatistics {
  const totalWords = words.length
  const foundWords = words.filter(w => w.found).length
  const remainingWords = totalWords - foundWords
  const completionPercentage = totalWords > 0 ? (foundWords / totalWords) * 100 : 0

  return {
    totalWords,
    foundWords,
    remainingWords,
    completionPercentage,
    totalGuesses,
    incorrectGuesses,
    duplicateGuesses,
    elapsedTime: 0,
  }
}

/**
 * Game Reducer
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'STORE_PENDING_CONFIG': {
      const { title, duration, words } = action.payload
      console.log('[useGame] STORE_PENDING_CONFIG action received')
      console.log('[useGame] Payload:', { title, duration, wordCount: words.length })

      const newState = {
        ...state,
        pendingConfig: { title, duration, words },
        title,
        duration,
        words: words.map((word, index) => ({
          id: `word-${index}`,
          original: word,
          normalized: word.toLowerCase().trim(),
          found: false,
          position: { x: 0, y: 0 },
          fontSize: 24,
          rotation: 0,
          color: '#3B82F6',
        })),
      }

      console.log('[useGame] New state after STORE_PENDING_CONFIG:')
      console.log('[useGame] - Phase:', newState.phase)
      console.log('[useGame] - Has pendingConfig:', !!newState.pendingConfig)
      console.log('[useGame] - Words count:', newState.words.length)

      return newState
    }

    case 'CREATE_GAME': {
      const { title, duration, words } = action.payload
      const normalizedWords = normalizeWordList(words)

      console.log('[useGame] CREATE_GAME action received')
      console.log('[useGame] Current phase:', state.phase)
      console.log('[useGame] Title:', title, 'Duration:', duration, 'Words:', words.length)

      // Allow creating game from IDLE, SETUP, RULES, or COMPLETED phases
      if (state.phase !== GamePhase.IDLE &&
          state.phase !== GamePhase.SETUP &&
          state.phase !== GamePhase.RULES &&
          state.phase !== GamePhase.COMPLETED) {
        console.log('[useGame] Invalid phase for CREATE_GAME, returning current state')
        return state
      }

      const newState = {
        ...state,
        id: `game-${Date.now()}`,
        title,
        duration,
        phase: GamePhase.GENERATING_LAYOUT,
        words: normalizedWords.map((word, index) => ({
          id: `word-${index}`,
          original: word,
          normalized: word.toLowerCase().trim(),
          found: false,
          position: { x: 0, y: 0 },
          fontSize: 24,
          rotation: 0,
          color: '#3B82F6',
        })),
        statistics: {
          totalWords: normalizedWords.length,
          foundWords: 0,
          remainingWords: normalizedWords.length,
          completionPercentage: 0,
          totalGuesses: 0,
          incorrectGuesses: 0,
          duplicateGuesses: 0,
          elapsedTime: 0,
        },
      }

      console.log('[useGame] New state phase:', newState.phase)
      console.log('[useGame] New state word count:', newState.words.length)

      return newState
    }

    case 'START_GAME': {
      if (!canTransition(state.phase, GamePhase.MEMORIZATION)) {
        return state
      }

      return {
        ...state,
        phase: GamePhase.MEMORIZATION,
        startedAt: Date.now(),
      }
    }

    case 'GENERATE_LAYOUT': {
      console.log('[useGame] GENERATE_LAYOUT action, current words:', state.words.length)
      const { viewportWidth, viewportHeight } = action.payload
      const normalizedWords = state.words.map(w => w.normalized)

      console.log('[useGame] Calling generateWordCloudLayout with', normalizedWords.length, 'words and dimensions:', viewportWidth, 'x', viewportHeight)
      const layoutWords = generateWordCloudLayout(normalizedWords, viewportWidth, viewportHeight)

      console.log('[useGame] Layout generation complete. Placed words:', layoutWords.length)

      if (layoutWords.length === 0) {
        console.error('[useGame] ERROR: No words were placed! Layout generation failed!')
        return state // Don't transition if no words placed
      }

      return {
        ...state,
        phase: GamePhase.MEMORIZATION,
        startedAt: Date.now(),
        words: layoutWords,
        statistics: {
          ...state.statistics,
          totalWords: layoutWords.length,
          remainingWords: layoutWords.length,
        },
      }
    }

    case 'TRANSITION_TO_GUESS': {
      if (!canTransition(state.phase, GamePhase.GUESSING)) {
        return state
      }

      return {
        ...state,
        phase: GamePhase.GUESSING,
      }
    }

    case 'SUBMIT_GUESS': {
      if (state.phase !== GamePhase.GUESSING) {
        return state
      }

      const guess = normalizeWord(action.payload)
      let foundWord: Word | null = null
      let isDuplicate = false

      // Check if word exists and is not already found
      for (const word of state.words) {
        if (word.normalized === guess) {
          if (word.found) {
            isDuplicate = true
          } else {
            foundWord = word
          }
          break
        }
      }

      // Update words and statistics
      let updatedWords = state.words
      let incorrectGuesses = state.statistics.incorrectGuesses
      let duplicateGuesses = state.statistics.duplicateGuesses
      let totalGuesses = state.statistics.totalGuesses + 1

      if (foundWord) {
        updatedWords = state.words.map(w =>
          w.id === foundWord!.id ? { ...w, found: true } : w
        )
      } else if (!isDuplicate) {
        incorrectGuesses += 1
      } else {
        duplicateGuesses += 1
      }

      const updatedStatistics = calculateStatistics(
        updatedWords,
        totalGuesses,
        incorrectGuesses,
        duplicateGuesses
      )

      // Check if game is complete
      const isComplete = updatedStatistics.completionPercentage >= 100

      return {
        ...state,
        words: updatedWords,
        statistics: updatedStatistics,
        phase: isComplete ? GamePhase.COMPLETED : state.phase,
      }
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      }
    }

    case 'RESTORE_STATE': {
      return action.payload
    }

    case 'RESET_GAME': {
      return createInitialGameState()
    }

    case 'SET_PHASE': {
      const newPhase = action.payload
      console.log('[useGame] SET_PHASE action received')
      console.log('[useGame] Current phase:', state.phase)
      console.log('[useGame] Target phase:', newPhase)
      console.log('[useGame] Can transition:', canTransition(state.phase, newPhase))

      if (canTransition(state.phase, newPhase)) {
        const newState = {
          ...state,
          phase: newPhase,
        }
        console.log('[useGame] Phase transition successful, new phase:', newState.phase)
        return newState
      }

      console.log('[useGame] Phase transition failed, returning current state')
      return state
    }

    default:
      return state
  }
}

/**
 * Game Context
 */
interface GameContextValue {
  state: GameState
  createGame: (title: string, duration: number, words: string[]) => void
  storePendingConfig: (title: string, duration: number, words: string[]) => void
  startGame: () => void
  generateLayout: (width: number, height: number) => void
  transitionToGuess: () => void
  submitGuess: (guess: string) => GuessResult
  updateSettings: (settings: Partial<GameSettings>) => void
  resetGame: () => void
  setPhase: (phase: GamePhase) => void
}

const GameContext = createContext<GameContextValue | undefined>(undefined)

/**
 * Game Provider Component
 */
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialGameState())

  // Auto-save to localStorage
  useEffect(() => {
    if (state.phase !== GamePhase.IDLE) {
      GameStorage.save(state)
    }
  }, [state])

  // Load saved state on mount
  useEffect(() => {
    const savedState = GameStorage.load()
    if (savedState) {
      // Validate saved state before restoring
      if (savedState.phase && savedState.words && Array.isArray(savedState.words)) {
        dispatch({ type: 'RESTORE_STATE', payload: savedState })
      } else {
        // If state is corrupted, clear it and start fresh
        GameStorage.clear()
      }
    }
  }, [])

  /**
   * Create a new game
   */
  const createGame = useCallback((title: string, duration: number, words: string[]) => {
    dispatch({ type: 'CREATE_GAME', payload: { title, duration, words } })
  }, [])

  /**
   * Store pending game configuration
   */
  const storePendingConfig = useCallback((title: string, duration: number, words: string[]) => {
    dispatch({ type: 'STORE_PENDING_CONFIG', payload: { title, duration, words } })
  }, [])

  /**
   * Start the game (enter memorization phase)
   */
  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' })
  }, [])

  /**
   * Generate word cloud layout
   */
  const generateLayout = useCallback((width: number, height: number) => {
    dispatch({ type: 'GENERATE_LAYOUT', payload: { viewportWidth: width, viewportHeight: height } })
  }, [])

  /**
   * Transition to guess phase
   */
  const transitionToGuess = useCallback(() => {
    dispatch({ type: 'TRANSITION_TO_GUESS' })
  }, [])

  /**
   * Submit a guess and return result
   */
  const submitGuess = useCallback((guess: string): GuessResult => {
    const normalizedGuess = normalizeWord(guess)

    // Check if word exists
    const wordExists = state.words.some(w => w.normalized === normalizedGuess)

    if (!wordExists) {
      dispatch({ type: 'SUBMIT_GUESS', payload: guess })
      return {
        valid: false,
        type: 'incorrect',
        message: 'Word not found',
      }
    }

    // Check if already found
    const alreadyFound = state.words.some(
      w => w.normalized === normalizedGuess && w.found
    )

    if (alreadyFound) {
      dispatch({ type: 'SUBMIT_GUESS', payload: guess })
      return {
        valid: true,
        type: 'duplicate',
        message: 'Already found',
      }
    }

    // Correct guess
    const word = state.words.find(w => w.normalized === normalizedGuess)!
    dispatch({ type: 'SUBMIT_GUESS', payload: guess })
    return {
      valid: true,
      type: 'correct',
      wordId: word.id,
      message: 'Correct!',
    }
  }, [state.words])

  /**
   * Update game settings
   */
  const updateSettings = useCallback((settings: Partial<GameSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
  }, [])

  /**
   * Reset game
   */
  const resetGame = useCallback(() => {
    console.log('[useGame] Resetting game and clearing localStorage')
    // Clear localStorage to remove saved state
    GameStorage.clear()
    // Dispatch RESET_GAME action
    dispatch({ type: 'RESET_GAME' })
  }, [])

  /**
   * Set game phase
   */
  const setPhase = useCallback((phase: GamePhase) => {
    dispatch({ type: 'SET_PHASE', payload: phase })
  }, [])

  const value: GameContextValue = {
    state,
    createGame,
    storePendingConfig,
    startGame,
    generateLayout,
    transitionToGuess,
    submitGuess,
    updateSettings,
    resetGame,
    setPhase,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

/**
 * Hook to use game context
 */
export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

/**
 * Helper function to normalize words
 */
function normalizeWord(word: string): string {
  return word.trim().toLowerCase()
}
