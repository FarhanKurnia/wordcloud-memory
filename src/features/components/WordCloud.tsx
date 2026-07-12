import { memo, useRef, useEffect, useState, useCallback } from 'react'
import { Word as WordComponent } from './Word'
import { Word as WordType, GamePhase } from '../../types/game'

interface WordCloudProps {
  words: WordType[]
  gamePhase?: GamePhase
}

interface BoundingRect {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

/**
 * Word Cloud Component
 * Renders the adaptive word cloud with responsive scaling
 * Maintains consistent positioning across game phases for memory aid
 */
export const WordCloud = memo(function WordCloud({ words, gamePhase }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const initialLayoutRef = useRef<{ scale: number; offsetX: number; offsetY: number } | null>(null)
  const [transform, setTransform] = useState({ scale: 1, offsetX: 0, offsetY: 0 })

  // Helper function to measure text dimensions accurately
  const measureWord = useCallback((text: string, fontSize: number, rotation: number) => {
    // Create temporary canvas for accurate text measurement
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return { width: fontSize, height: fontSize }

    ctx.font = `${fontSize}px Inter, sans-serif`
    const metrics = ctx.measureText(text)

    // For horizontal text
    if (rotation === 0) {
      return {
        width: metrics.width,
        height: fontSize,
      }
    }
    // For vertical text (rotated 90deg)
    else {
      return {
        width: fontSize,
        height: metrics.width,
      }
    }
  }, [])

  // Calculate content bounds from word positions
  const calculateContentBounds = useCallback((): BoundingRect => {
    if (words.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    words.forEach((word) => {
      const dimensions = measureWord(word.original, word.fontSize, word.rotation)

      const wordRight = word.position.x + dimensions.width
      const wordBottom = word.position.y + dimensions.height

      minX = Math.min(minX, word.position.x)
      minY = Math.min(minY, word.position.y)
      maxX = Math.max(maxX, wordRight)
      maxY = Math.max(maxY, wordBottom)
    })

    const padding = 50
    const width = maxX - minX + padding * 2
    const height = maxY - minY + padding * 2

    return { minX, minY, maxX, maxY, width, height }
  }, [words, measureWord])

  // Calculate transform to fit content in container
  const updateTransform = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const bounds = calculateContentBounds()

    if (bounds.width === 0 || bounds.height === 0) {
      const defaultTransform = { scale: 1, offsetX: 0, offsetY: 0 }
      setTransform(defaultTransform)
      return
    }

    // Calculate scale to fit content within container
    const scaleX = containerRect.width / bounds.width
    const scaleY = containerRect.height / bounds.height
    const scale = Math.min(scaleX, scaleY)

    // Calculate center offset
    const contentCenterX = (bounds.minX + bounds.maxX) / 2
    const contentCenterY = (bounds.minY + bounds.maxY) / 2

    const newTransform = { scale, offsetX: contentCenterX, offsetY: contentCenterY }

    // Store initial layout for consistency across phases
    if (!initialLayoutRef.current) {
      initialLayoutRef.current = newTransform
      console.log('[WordCloud] Initial layout stored:', newTransform)
    }

    // Use initial layout if in guessing phase to maintain position consistency
    const currentPhase = gamePhase || GamePhase.IDLE
    if (currentPhase === GamePhase.GUESSING && initialLayoutRef.current) {
      console.log('[WordCloud] Using initial layout for consistency')
      setTransform(initialLayoutRef.current)
    } else {
      setTransform(newTransform)
    }
  }, [calculateContentBounds, gamePhase])

  // Set up ResizeObserver to detect container size changes
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Initial calculation
    updateTransform()

    // Observe container size changes
    const resizeObserver = new ResizeObserver(() => {
      // Only update if not in guessing phase to maintain consistency
      const currentPhase = gamePhase || GamePhase.IDLE
      if (currentPhase !== GamePhase.GUESSING || !initialLayoutRef.current) {
        updateTransform()
      } else {
        // In guessing phase, just ensure container doesn't break
        console.log('[WordCloud] Maintaining initial layout during guessing phase')
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [updateTransform, gamePhase])

  // Recalculate when words change (but preserve initial layout)
  useEffect(() => {
    const currentPhase = gamePhase || GamePhase.IDLE
    // Only calculate initial layout when in memorization phase or if no layout exists
    if (currentPhase === GamePhase.MEMORIZATION || !initialLayoutRef.current) {
      updateTransform()
    } else {
      // In guessing phase, use stored layout
      if (initialLayoutRef.current) {
        setTransform(initialLayoutRef.current)
      }
    }
  }, [words, updateTransform, gamePhase])

  // Reset initial layout when game phase changes back to setup
  useEffect(() => {
    const currentPhase = gamePhase || GamePhase.IDLE
    if (currentPhase === GamePhase.IDLE || currentPhase === GamePhase.SETUP) {
      initialLayoutRef.current = null
      console.log('[WordCloud] Resetting initial layout')
    }
  }, [gamePhase])

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '400px',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  }

  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '100%',
    height: '100%',
    transform: `translate(-50%, -50%) scale(${transform.scale})`,
    transformOrigin: 'center center',
    pointerEvents: 'none',
  }

  return (
    <div ref={containerRef} style={containerStyle}>
      <div ref={contentRef} style={contentStyle}>
        {words.map((word) => (
          <WordComponent
            key={word.id}
            word={word}
            gamePhase={gamePhase || GamePhase.IDLE}
            centerOffset={{ x: transform.offsetX, y: transform.offsetY }}
          />
        ))}
      </div>
    </div>
  )
})
