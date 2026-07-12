import { memo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface CountdownProps {
  remainingSeconds: number
  className?: string
}

/**
 * Countdown Timer Component
 * Displays the remaining time in a large, prominent format
 * Changes color as time runs low
 */
export const Countdown = memo(function Countdown({ remainingSeconds, className }: CountdownProps) {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Determine color based on remaining time
  const getColor = () => {
    if (remainingSeconds <= 10) return 'text-danger'
    if (remainingSeconds <= 30) return 'text-warning'
    return 'text-primary'
  }

  // Animation when time is critical
  const isCritical = remainingSeconds <= 10

  return (
    <motion.div
      className={cn(
        'text-center',
        getColor(),
        className
      )}
      animate={
        isCritical
          ? {
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1],
            }
          : {}
      }
      transition={
        isCritical
          ? {
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : {}
      }
    >
      <div className="text-8xl font-bold tabular-nums">
        {formatTime(remainingSeconds)}
      </div>
    </motion.div>
  )
})
