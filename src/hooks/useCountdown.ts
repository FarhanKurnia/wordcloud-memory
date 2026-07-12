import { useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_DURATION } from '../constants/game'

interface UseCountdownOptions {
  duration?: number
  initialRemaining?: number
  onTick?: (remaining: number) => void
  onComplete?: () => void
  autoStart?: boolean
}

interface UseCountdownReturn {
  remainingSeconds: number
  isRunning: boolean
  isComplete: boolean
  start: () => void
  pause: () => void
  reset: () => void
  resume: () => void
}

/**
 * Countdown timer hook with timestamp-based calculation
 * Prevents timer drift and handles unmounting
 */
export function useCountdown({
  duration = DEFAULT_DURATION,
  initialRemaining,
  onTick,
  onComplete,
  autoStart = false,
}: UseCountdownOptions = {}): UseCountdownReturn {
  // Use initialRemaining if provided, otherwise use duration
  const getInitialRemaining = () => {
    if (initialRemaining !== undefined && initialRemaining >= 0) {
      return initialRemaining
    }
    return duration
  }

  const [remainingSeconds, setRemainingSeconds] = useState(getInitialRemaining())
  const [isRunning, setIsRunning] = useState(autoStart)
  const isComplete = remainingSeconds <= 0

  // Update countdown when initialRemaining changes (for localStorage restore)
  useEffect(() => {
    if (initialRemaining !== undefined && initialRemaining >= 0 && initialRemaining !== remainingSeconds) {
      console.log('[useCountdown] Updating initialRemaining:', initialRemaining)
      setRemainingSeconds(initialRemaining)
      // Auto-start if this is a restored game (less than full duration)
      if (initialRemaining < duration && initialRemaining > 0) {
        setIsRunning(true)
      }
    }
  }, [initialRemaining, duration, remainingSeconds])

  const startTimeRef = useRef<number | null>(null)
  const remainingRef = useRef(remainingSeconds)
  const intervalRef = useRef<number | null>(null)

  // Update ref when remaining changes
  useEffect(() => {
    remainingRef.current = remainingSeconds
  }, [remainingSeconds])

  // Calculate remaining time based on elapsed time
  useEffect(() => {
    if (!isRunning || isComplete) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    console.log('[useCountdown] Starting timer, duration:', duration, 'remainingSeconds:', remainingSeconds)

    // Record start time
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
      console.log('[useCountdown] Set start time:', startTimeRef.current)
    }

    intervalRef.current = window.setInterval(() => {
      if (startTimeRef.current === null) return

      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, duration - elapsed)

      setRemainingSeconds(Math.ceil(remaining))

      if (remaining <= 0) {
        console.log('[useCountdown] Countdown complete! Calling onComplete')
        setIsRunning(false)
        onComplete?.()
      }
    }, 100) // Update every 100ms for smooth countdown

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isComplete, duration, onComplete])

  // Call onTick when remaining changes
  useEffect(() => {
    if (isRunning && !isComplete) {
      onTick?.(remainingSeconds)
    }
  }, [remainingSeconds, isRunning, isComplete, onTick])

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now()
      setRemainingSeconds(duration)
      setIsRunning(true)
    }
  }, [duration, isRunning])

  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false)
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  const reset = useCallback(() => {
    setIsRunning(false)
    startTimeRef.current = null
    setRemainingSeconds(duration)
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [duration])

  const resume = useCallback(() => {
    if (!isRunning && !isComplete) {
      startTimeRef.current = Date.now() - (duration - remainingSeconds) * 1000
      setIsRunning(true)
    }
  }, [duration, remainingSeconds, isRunning, isComplete])

  return {
    remainingSeconds,
    isRunning,
    isComplete,
    start,
    pause,
    reset,
    resume,
  }
}
