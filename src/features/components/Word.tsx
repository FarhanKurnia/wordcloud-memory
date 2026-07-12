import { memo } from 'react'
import { Word as WordType, GamePhase } from '../../types/game'

interface WordProps {
  word: WordType
  gamePhase: GamePhase
  centerOffset?: { x: number; y: number }
}

/**
 * Individual Word Component
 * Renders a single word with appropriate visibility and styling
 * Words are positioned absolutely within the scaled content wrapper
 */
export const Word = memo(function Word({ word, gamePhase, centerOffset }: WordProps) {
  const {
    id,
    original,
    found,
    position,
    fontSize,
    rotation,
    color,
  } = word

  // Visibility logic based on game phase and found state
  const shouldShow =
    gamePhase === GamePhase.MEMORIZATION ||
    gamePhase === GamePhase.COMPLETED ||
    found

  // Calculate adjusted position relative to center
  const adjustedX = centerOffset ? position.x - centerOffset.x : position.x
  const adjustedY = centerOffset ? position.y - centerOffset.y : position.y

  // Inline style for word positioning and appearance
  const style: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: `${adjustedX}px`,
    marginTop: `${adjustedY}px`,
    fontSize: `${fontSize}px`,
    transform: `rotate(${rotation}deg)`,
    color,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    cursor: 'default',
    opacity: shouldShow ? 1 : 0,
    transition: 'opacity 0.3s ease',
  }

  return (
    <div
      id={id}
      style={style}
    >
      {original}
    </div>
  )
})
