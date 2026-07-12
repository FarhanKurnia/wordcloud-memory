import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { GameLayout, GameContent, GameHeader } from '../layouts'
import { WordCloud, Countdown, GuessInput } from '../features/components'
import { ProgressBar, Badge, Button } from '../components'
import { useGame } from '../features/hooks/useGame'
import { useSound } from '../hooks/useSound'
import { useFullscreen } from '../hooks/useFullscreen'
import { GamePhase } from '../types/game'
import { DEFAULT_DURATION } from '../constants/game'

/**
 * Game Page
 * Main gameplay screen with word cloud and guessing interface
 */
export function GamePage() {
  const { state, generateLayout, transitionToGuess, submitGuess, resetGame } = useGame()
  const [guess, setGuess] = useState('')
  const [shakeAnimation, setShakeAnimation] = useState(false)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const memorizeAreaRef = useRef<HTMLDivElement>(null)
  const guessAreaRef = useRef<HTMLDivElement>(null)

  // Unified ref handler to maintain consistent dimensions
  const setGameAreaRef = useCallback((phase: GamePhase) => {
    return (element: HTMLDivElement | null) => {
      if (phase === GamePhase.MEMORIZATION) {
        ;(memorizeAreaRef as React.MutableRefObject<HTMLDivElement | null>).current = element
        ;(gameAreaRef as React.MutableRefObject<HTMLDivElement | null>).current = element
      } else if (phase === GamePhase.TRANSITION || phase === GamePhase.GUESSING) {
        ;(guessAreaRef as React.MutableRefObject<HTMLDivElement | null>).current = element
        ;(gameAreaRef as React.MutableRefObject<HTMLDivElement | null>).current = element
      }
    }
  }, [])

  const { playCorrect, playWrong, playVictory } = useSound(state.settings.soundEnabled)
  const { toggleFullscreen } = useFullscreen()

  // Setup countdown - ultra simple approach
  const countdownDuration = state.duration || DEFAULT_DURATION

  // Calculate remaining time directly from startedAt
  const getRemainingTime = (): number => {
    if (state.phase === GamePhase.MEMORIZATION && state.startedAt) {
      const elapsed = (Date.now() - state.startedAt) / 1000
      return Math.max(0, Math.ceil(countdownDuration - elapsed))
    }
    return countdownDuration
  }

  const [remainingSeconds, setRemainingSeconds] = useState(getRemainingTime())
  const previousSecondsRef = useRef<number>(getRemainingTime())

  // Simple interval that just updates display
  useEffect(() => {
    if (state.phase !== GamePhase.MEMORIZATION) {
      const current = getRemainingTime()
      setRemainingSeconds(current)
      previousSecondsRef.current = current
      return
    }

    const interval = setInterval(() => {
      const remaining = getRemainingTime()
      setRemainingSeconds(remaining)

      // Play countdown beep when time is low AND second changed
      // Only play when the second value actually changes (once per second)
      if (remaining <= 10 && remaining > 0 && remaining !== previousSecondsRef.current) {
        playWrong({ volume: 0.3 })
        previousSecondsRef.current = remaining
      }

      // Auto-transition when countdown reaches 0
      if (remaining === 0) {
        clearInterval(interval)
        transitionToGuess()
      }
    }, 100)

    return () => clearInterval(interval)
  }, [state.phase, countdownDuration, transitionToGuess])

  // Generate layout when entering GENERATING_LAYOUT phase
  useEffect(() => {
    if (state.phase === GamePhase.GENERATING_LAYOUT) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (gameAreaRef.current) {
          const { width, height } = gameAreaRef.current.getBoundingClientRect()
          console.log('[GamePage] Generating layout with ref dimensions:', width, 'x', height)
          generateLayout(width, height)
        } else {
          // Fallback to window size if ref not available
          const fallbackWidth = window.innerWidth * 0.8
          const fallbackHeight = window.innerHeight * 0.6
          console.log('[GamePage] Using fallback dimensions:', fallbackWidth, 'x', fallbackHeight)
          generateLayout(fallbackWidth, fallbackHeight)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [state.phase, generateLayout])

  // Handle guess submission
  const handleSubmitGuess = useCallback(() => {
    if (!guess.trim()) return

    const result = submitGuess(guess)

    if (result.valid) {
      if (result.type === 'correct') {
        playCorrect()
        setGuess('')
      } else if (result.type === 'duplicate') {
        playWrong()
        setGuess('')
        // Trigger shake animation for duplicate
        triggerShake()
      }
    } else {
      playWrong()
      // Trigger shake animation for wrong guess
      triggerShake()
      setGuess('')
    }

    // Check for victory
    if (state.statistics.completionPercentage >= 100) {
      playVictory()
      triggerConfetti()
    }
  }, [guess, submitGuess, playCorrect, playWrong, playVictory, state.statistics.completionPercentage])

  // Trigger shake animation
  const triggerShake = useCallback(() => {
    setShakeAnimation(true)
    setTimeout(() => setShakeAnimation(false), 500)
  }, [])

  // Trigger confetti celebration
  const triggerConfetti = useCallback(() => {
    const duration = 3000
    const animationEnd = Date.now() + duration

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      confetti({
        particleCount: 3,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.2, 0.8), y: Math.random() - 0.2 },
      })
    }, 50)
  }, [])

  // Reset game
  const handleReset = useCallback(() => {
    resetGame()
  }, [resetGame])

  // Early return if not in proper phase
  if (state.phase === GamePhase.IDLE || state.phase === GamePhase.SETUP) {
    return null
  }

  return (
    <GameLayout onToggleFullscreen={toggleFullscreen}>
      <GameContent>
        {/* Loading/Generating Layout Phase */}
        {state.phase === GamePhase.GENERATING_LAYOUT && (
          <div className="w-full text-center">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Generating Word Cloud...
              </h2>
              <p className="text-neutral-600">
                Preparing your game
              </p>
            </div>
          </div>
        )}

        {/* Memorization Phase */}
        {state.phase === GamePhase.MEMORIZATION && (
          <div className="w-full">
              <GameHeader
                title={state.title}
                subtitle="Memorize these words!"
              />

              <div className="mb-4">
                <Countdown remainingSeconds={remainingSeconds} />
              </div>

              <div
                ref={setGameAreaRef(state.phase)}
                className="relative w-full flex-1 min-h-[50vh] bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <WordCloud words={state.words} gamePhase={state.phase} />
              </div>

              <div className="mt-6 text-center">
                <Badge variant="info" size="lg">
                  {state.words.length} words to memorize
                </Badge>
              </div>
            </div>
          )}

          {/* Guessing Phase */}
          {(state.phase === GamePhase.TRANSITION || state.phase === GamePhase.GUESSING) && (
            <div className="w-full">
              <GameHeader
                title={state.title}
                subtitle="Call out the words you remember!"
              />

              {/* Reset Button */}
              <div className="flex justify-center mb-4">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleReset}
                >
                  Reset Game
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <ProgressBar
                  value={state.statistics.foundWords}
                  max={state.statistics.totalWords}
                  color="success"
                  showLabel
                />
              </div>

              {/* Statistics */}
              <div className="flex justify-center gap-4 mb-6">
                <Badge variant="success" size="md">
                  Found: {state.statistics.foundWords}
                </Badge>
                <Badge variant="default" size="md">
                  Remaining: {state.statistics.remainingWords}
                </Badge>
              </div>

              {/* Word Cloud */}
              <div
                ref={setGameAreaRef(state.phase)}
                className="relative w-full flex-1 min-h-[50vh] bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
              >
                <WordCloud words={state.words} gamePhase={state.phase} />
              </div>

              {/* Guess Input */}
              <div className="max-w-2xl mx-auto">
                <motion.div
                  animate={shakeAnimation ? {
                    x: [0, -10, 10, -10, 10, -10, 10, -10, 10, 0],
                    transition: { duration: 0.5 }
                  } : {}}
                  className="w-full"
                >
                  <GuessInput
                    value={guess}
                    onChange={setGuess}
                    onSubmit={handleSubmitGuess}
                    placeholder="Type a word and press Enter..."
                    disabled={state.phase !== GamePhase.GUESSING}
                  />
                </motion.div>
              </div>
            </div>
          )}

          {/* Victory Phase */}
          {state.phase === GamePhase.COMPLETED && (
            <div className="w-full text-center">
              <div className="mb-8">
                <h1 className="text-6xl font-bold text-success mb-4">
                  Congratulations!
                </h1>
                <p className="text-2xl text-neutral-600">
                  You found all {state.statistics.totalWords} words!
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow">
                  <div className="text-3xl font-bold text-primary">
                    {state.statistics.totalWords}
                  </div>
                  <div className="text-sm text-neutral-600">Total Words</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow">
                  <div className="text-3xl font-bold text-success">
                    {state.statistics.foundWords}
                  </div>
                  <div className="text-sm text-neutral-600">Found</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow">
                  <div className="text-3xl font-bold text-warning">
                    {state.statistics.incorrectGuesses}
                  </div>
                  <div className="text-sm text-neutral-600">Incorrect</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow">
                  <div className="text-3xl font-bold text-neutral-600">
                    {Math.floor((state.duration - remainingSeconds) / 60)}:
                    {String((state.duration - remainingSeconds) % 60).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-neutral-600">Time</div>
                </div>
              </div>

              <Button size="lg" onClick={handleReset}>
                New Game
              </Button>
            </div>
          )}
      </GameContent>
    </GameLayout>
  )
}
