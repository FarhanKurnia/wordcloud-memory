import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../utils/cn'

interface GameLayoutProps {
  children: ReactNode
  className?: string
  showFullscreen?: boolean
  onToggleFullscreen?: () => void
}

/**
 * Game Layout Component
 * Provides consistent layout for all game screens
 * Optimized for projector presentation
 */
export function GameLayout({
  children,
  className,
  showFullscreen = true,
  onToggleFullscreen,
}: GameLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100', className)}>
      {/* Fullscreen Toggle */}
      {showFullscreen && onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-neutral-200 hover:bg-white transition-colors"
          aria-label="Toggle fullscreen"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen flex flex-col"
      >
        {children}
      </motion.div>
    </div>
  )
}

interface GameContentProps {
  children: ReactNode
  className?: string
}

/**
 * Game Content Wrapper
 * Centers content and provides max-width constraints
 */
export function GameContent({ children, className }: GameContentProps) {
  return (
    <div className={cn('flex-1 flex items-center justify-center p-8', className)}>
      <div className="w-full max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
}

interface GameHeaderProps {
  title?: string
  subtitle?: string
  className?: string
}

/**
 * Game Header
 * Displays game title and optional subtitle
 */
export function GameHeader({ title, subtitle, className }: GameHeaderProps) {
  if (!title && !subtitle) return null

  return (
    <div className={cn('text-center mb-8', className)}>
      {title && (
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-neutral-900 mb-2"
        >
          {title}
        </motion.h1>
      )}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-neutral-600"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
