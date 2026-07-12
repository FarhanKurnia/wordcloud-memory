import { useEffect, useCallback } from 'react'

type KeyboardShortcutHandler = (event: KeyboardEvent) => void

interface KeyboardShortcut {
  key: string
  handler: KeyboardShortcutHandler
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  preventDefault?: boolean
}

/**
 * Keyboard shortcuts hook for keyboard-first interaction
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const {
        key,
        handler,
        ctrlKey = false,
        shiftKey = false,
        altKey = false,
        preventDefault = true,
      } = shortcut

      const matchesKey = event.key === key || event.code === key
      const matchesCtrl = ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
      const matchesShift = shiftKey === event.shiftKey
      const matchesAlt = altKey === event.altKey

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
        if (preventDefault) {
          event.preventDefault()
        }
        handler(event)
        break
      }
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

/**
 * Predefined keyboard shortcuts
 */
export const SHORTCUTS = {
  SUBMIT: 'Enter',
  CANCEL: 'Escape',
  FULLSCREEN: 'KeyF',
  SKIP: 'Space',
  TAB_FORWARD: 'Tab',
} as const
