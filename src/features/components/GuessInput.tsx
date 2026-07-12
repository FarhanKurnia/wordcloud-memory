import { memo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Input } from '../../components/Input'
import { cn } from '../../utils/cn'

interface GuessInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  autoFocus?: boolean
  disabled?: boolean
  className?: string
}

/**
 * Guess Input Component
 * Keyboard-first input for submitting guesses
 * Auto-focuses and maintains focus during gameplay
 */
export const GuessInput = memo(function GuessInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type your guess...',
  autoFocus = true,
  disabled = false,
  className,
}: GuessInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus when mounted
  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRef.current?.focus()
    }
  }, [autoFocus, disabled])

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit()
    }
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        fullWidth
        className="text-xl py-4"
      />
    </motion.div>
  )
})
