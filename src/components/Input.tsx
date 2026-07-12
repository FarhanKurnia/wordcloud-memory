import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, fullWidth = false, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          // Base styles
          'px-4 py-3 rounded-lg border-2 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',

          // Default state
          'border-neutral-300 focus:border-primary focus:ring-primary',

          // Error state
          error && 'border-danger focus:border-danger focus:ring-danger',

          // Full width
          fullWidth && 'w-full',

          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed',

          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  fullWidth?: boolean
  rows?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, fullWidth = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'px-4 py-3 rounded-lg border-2 border-neutral-300',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'transition-all duration-200 resize-none',
          fullWidth && 'w-full',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
