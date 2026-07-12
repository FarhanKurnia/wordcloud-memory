/**
 * Default game configuration
 */
export const DEFAULT_DURATION = 60 // seconds

export const MIN_DURATION = 10
export const MAX_DURATION = 600

export const MIN_WORDS = 10
export const MAX_WORDS = 1000

/**
 * Font size distribution as per PRD
 * 5% Extra Large
 * 15% Large
 * 30% Medium
 * 35% Small
 * 15% Tiny
 */
export const FONT_SIZE_DISTRIBUTION = {
  'extra-large': 0.05,
  'large': 0.15,
  'medium': 0.30,
  'small': 0.35,
  'tiny': 0.15,
} as const

/**
 * Font sizes in pixels (responsive based on word count)
 */
export const FONT_SIZES = {
  'extra-large': [48, 64],
  'large': [36, 48],
  'medium': [28, 36],
  'small': [20, 28],
  'tiny': [16, 20],
} as const

/**
 * Rotation distribution
 * 80% Horizontal
 * 20% Vertical
 */
export const ROTATION_DISTRIBUTION = {
  horizontal: 0.80,
  vertical: 0.20,
} as const

/**
 * Color palette for words
 * Semantic colors from the design system
 */
export const WORD_COLORS = [
  '#3B82F6', // Primary Blue
  '#F97316', // Secondary Orange
  '#8B5CF6', // Accent Purple
  '#10B981', // Success Green
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#F59E0B', // Warning Amber
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#84CC16', // Lime
]

/**
 * Word cloud layout settings
 */
export const LAYOUT_SETTINGS = {
  TARGET_VIEWPORT_COVERAGE: 0.85, // 85% of viewport
  SPIRAL_SPACING: 20,
  MAX_COLLISION_ATTEMPTS: 500,
  WORD_PADDING: 8,
} as const

/**
 * Animation durations (ms)
 */
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  GAME_STATE: 'memory-word-game-state',
  SETTINGS: 'memory-word-game-settings',
} as const

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  F: 'KeyF',
  M: 'KeyM',
} as const
