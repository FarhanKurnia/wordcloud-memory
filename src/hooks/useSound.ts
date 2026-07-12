import { useCallback, useRef, useEffect } from 'react'

interface SoundOptions {
  volume?: number
  loop?: boolean
}

/**
 * Sound management hook using Howler.js
 * Centralizes sound playing and respects mute preferences
 */
export function useSound(enabled: boolean = true) {
  const soundsRef = useRef<Record<string, Howl>>({})

  // Initialize sounds
  useEffect(() => {
    // For now, we'll use browser's Web Audio API
    // In production, you'd load actual sound files
    soundsRef.current = {}
  }, [])

  const playSound = useCallback((type: 'correct' | 'wrong' | 'countdown' | 'victory', options: SoundOptions = {}) => {
    if (!enabled) return

    const { volume = 0.5 } = options

    // Use Web Audio API for simple sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    gainNode.gain.value = volume

    switch (type) {
      case 'correct':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break

      case 'wrong':
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break

      case 'countdown':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
        break

      case 'victory':
        // Play arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
          const osc = audioContext.createOscillator()
          const gain = audioContext.createGain()
          osc.connect(gain)
          gain.connect(audioContext.destination)
          osc.frequency.value = freq
          gain.gain.value = volume
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5 + i * 0.1)
          osc.start(audioContext.currentTime + i * 0.1)
          osc.stop(audioContext.currentTime + 0.5 + i * 0.1)
        })
        break
    }
  }, [enabled])

  const playCorrect = useCallback((options?: SoundOptions) => {
    playSound('correct', options)
  }, [playSound])

  const playWrong = useCallback((options?: SoundOptions) => {
    playSound('wrong', options)
  }, [playSound])

  const playCountdown = useCallback((options?: SoundOptions) => {
    playSound('countdown', options)
  }, [playSound])

  const playVictory = useCallback((options?: SoundOptions) => {
    playSound('victory', options)
  }, [playSound])

  return {
    playCorrect,
    playWrong,
    playCountdown,
    playVictory,
    playSound,
  }
}
