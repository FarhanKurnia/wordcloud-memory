import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose?: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
  ...props
}: DialogProps) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative w-full mx-4 bg-white rounded-2xl shadow-2xl',
          sizes[size],
          className
        )}
        {...props}
      >
        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="text-2xl font-semibold text-neutral-900">{title}</h2>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
