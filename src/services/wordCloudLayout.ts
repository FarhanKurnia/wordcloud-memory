import {
  Word,
  FontSize,
  Rotation,
} from '../types/game'
import {
  FONT_SIZE_DISTRIBUTION,
  ROTATION_DISTRIBUTION,
  WORD_COLORS,
  LAYOUT_SETTINGS,
} from '../constants/game'

/**
 * Word Cloud Layout Engine
 * Generates adaptive word cloud layouts with collision detection
 */
export class WordCloudLayoutEngine {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly viewportWidth: number
  private readonly viewportHeight: number
  private readonly wordCount: number

  constructor(viewportWidth: number, viewportHeight: number, wordCount: number) {
    this.viewportWidth = viewportWidth
    this.viewportHeight = viewportHeight
    this.wordCount = wordCount

    // Create offscreen canvas for text measurement
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!

    // Set canvas size for accurate measurement
    this.canvas.width = viewportWidth
    this.canvas.height = viewportHeight
  }

  /**
   * Generate the complete layout for all words
   */
  generateLayout(normalizedWords: string[]): Word[] {
    const words: Word[] = []
    const occupiedRectangles: Array<{x: number, y: number, width: number, height: number}> = []

    console.log('[WordCloudLayout] Starting layout generation')
    console.log('[WordCloudLayout] Viewport dimensions:', this.viewportWidth, 'x', this.viewportHeight)
    console.log('[WordCloudLayout] Word count:', normalizedWords.length)

    // Assign font sizes based on word count
    const fontSizes = this.calculateResponsiveFontSizes()

    // Process words in random order for better distribution
    const shuffledWords = [...normalizedWords].sort(() => Math.random() - 0.5)

    for (let i = 0; i < shuffledWords.length; i++) {
      const word = shuffledWords[i]

      // Assign properties
      const fontSize = this.assignFontSize(fontSizes)
      const rotation = this.assignRotation()
      const color = this.assignColor(occupiedRectangles, words)

      // Measure text
      this.ctx.font = `${fontSize}px Inter, sans-serif`
      const metrics = this.ctx.measureText(word)
      const textWidth = metrics.width
      const textHeight = fontSize

      // Calculate dimensions based on rotation
      const width = rotation === 'horizontal' ? textWidth : textHeight
      const height = rotation === 'horizontal' ? textHeight : textWidth

      console.log(`[WordCloudLayout] Processing word "${word}":`, {fontSize, rotation, width, height})

      // Find position using improved spiral algorithm
      const position = this.findPosition(
        width,
        height,
        occupiedRectangles,
        i
      )

      if (position) {
        const wordObject: Word = {
          id: `word-${i}`,
          original: word,
          normalized: word.toLowerCase().trim(),
          found: false,
          position,
          fontSize,
          rotation: rotation === 'horizontal' ? 0 : 90,
          color,
        }

        console.log(`[WordCloudLayout] Placed "${word}" at:`, position)
        words.push(wordObject)
        occupiedRectangles.push({
          x: position.x - LAYOUT_SETTINGS.WORD_PADDING,
          y: position.y - LAYOUT_SETTINGS.WORD_PADDING,
          width: width + LAYOUT_SETTINGS.WORD_PADDING * 2,
          height: height + LAYOUT_SETTINGS.WORD_PADDING * 2,
        })
      } else {
        console.log(`[WordCloudLayout] Failed to place "${word}" - no position found`)
      }
    }

    console.log('[WordCloudLayout] Layout complete. Total words placed:', words.length, 'of', normalizedWords.length)

    // Optimize layout to fill viewport
    return this.optimizeViewportUsage(words)
  }

  /**
   * Calculate responsive font sizes based on word count - EXTREMELY LARGE for desktop
   */
  private calculateResponsiveFontSizes(): Record<FontSize, number> {
    const baseSizes: Record<FontSize, number> = {
      'extra-large': 120, // Extremely large for desktop readability
      'large': 95,
      'medium': 75,
      'small': 60,
      'tiny': 48,
    }

    // Very conservative scaling to maintain maximum readability
    let scaleFactor = 1
    if (this.wordCount > 150) {
      scaleFactor = 0.75 // Much less aggressive scaling
    } else if (this.wordCount > 100) {
      scaleFactor = 0.82 // Much less aggressive scaling
    } else if (this.wordCount > 75) {
      scaleFactor = 0.88
    } else if (this.wordCount > 50) {
      scaleFactor = 0.95
    }

    console.log('[WordCloudLayout] Font scale factor:', scaleFactor, 'for', this.wordCount, 'words')

    return Object.entries(baseSizes).reduce((acc, [size, value]) => ({
      ...acc,
      [size as FontSize]: Math.round(value * scaleFactor),
    }), {} as Record<FontSize, number>)
  }

  /**
   * Assign font size using weighted distribution
   */
  private assignFontSize(fontSizes: Record<FontSize, number>): number {
    const random = Math.random()
    let cumulative = 0

    const distribution = [
      { size: 'extra-large' as FontSize, weight: FONT_SIZE_DISTRIBUTION['extra-large'] },
      { size: 'large' as FontSize, weight: FONT_SIZE_DISTRIBUTION['large'] },
      { size: 'medium' as FontSize, weight: FONT_SIZE_DISTRIBUTION['medium'] },
      { size: 'small' as FontSize, weight: FONT_SIZE_DISTRIBUTION['small'] },
      { size: 'tiny' as FontSize, weight: FONT_SIZE_DISTRIBUTION['tiny'] },
    ]

    for (const { size, weight } of distribution) {
      cumulative += weight
      if (random <= cumulative) {
        return fontSizes[size]
      }
    }

    return fontSizes['small'] // Default
  }

  /**
   * Assign rotation using weighted distribution
   */
  private assignRotation(): Rotation {
    return Math.random() < ROTATION_DISTRIBUTION.horizontal ? 'horizontal' : 'vertical'
  }

  /**
   * Assign color avoiding identical adjacent colors
   */
  private assignColor(_occupied: Array<{x: number, y: number, width: number, height: number}>, words: Word[]): string {
    // Try to avoid using the same color as recently placed words
    const recentColors = new Set(words.slice(-5).map(w => w.color))
    const availableColors = WORD_COLORS.filter(c => !recentColors.has(c))

    if (availableColors.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableColors.length)
      return availableColors[randomIndex]
    }

    // Fallback to random if all colors used recently
    const randomFallbackIndex = Math.floor(Math.random() * WORD_COLORS.length)
    return WORD_COLORS[randomFallbackIndex]
  }

  /**
   * Find position using extremely aggressive algorithm for maximum desktop viewport utilization
   */
  private findPosition(
    width: number,
    height: number,
    occupied: Array<{x: number, y: number, width: number, height: number}>,
    wordIndex: number
  ): {x: number, y: number} | null {
    const centerX = this.viewportWidth / 2
    const centerY = this.viewportHeight / 2

    // Extremely aggressive spiral parameters
    const angleIncrement = 0.5 // Maximum angular distribution
    const radiusIncrement = LAYOUT_SETTINGS.SPIRAL_SPACING * 2.2 // Extremely aggressive expansion
    let angle = 0
    let radius = 0

    // Start at extremely different angles for maximum distribution
    angle = (wordIndex * 2.5) % (Math.PI * 2) // Maximum angle variety

    // Calculate boundaries with absolute minimal padding
    const padding = LAYOUT_SETTINGS.WORD_PADDING
    const maxValidX = this.viewportWidth - width - padding
    const maxValidY = this.viewportHeight - height - padding
    const minValidX = padding
    const minValidY = padding

    // Try aggressive edge-first placement for maximum utilization
    const edgeAttempts = Math.min(150, Math.floor(this.wordCount * 0.2))
    if (wordIndex < edgeAttempts) {
      // Aggressive edge placement strategy
      const edgeStrategies = [
        // Horizontal edges (top/bottom)
        () => ({ x: minValidX + Math.random() * (maxValidX - minValidX), y: minValidY }),
        () => ({ x: minValidX + Math.random() * (maxValidX - minValidX), y: maxValidY }),
        // Vertical edges (left/right)
        () => ({ x: minValidX, y: minValidY + Math.random() * (maxValidY - minValidY) }),
        () => ({ x: maxValidX, y: minValidY + Math.random() * (maxValidY - minValidY) }),
        // Corner regions for maximum spread
        () => ({ x: minValidX + Math.random() * (maxValidX - minValidX) * 0.3, y: minValidY + Math.random() * (maxValidY - minValidY) * 0.3 }),
        () => ({ x: maxValidX - Math.random() * (maxValidX - minValidX) * 0.3, y: minValidY + Math.random() * (maxValidY - minValidY) * 0.3 }),
        () => ({ x: minValidX + Math.random() * (maxValidX - minValidX) * 0.3, y: maxValidY - Math.random() * (maxValidY - minValidY) * 0.3 }),
        () => ({ x: maxValidX - Math.random() * (maxValidX - minValidX) * 0.3, y: maxValidY - Math.random() * (maxValidY - minValidY) * 0.3 }),
      ]

      for (const strategy of edgeStrategies) {
        const pos = strategy()
        const newRect = {
          x: pos.x - padding,
          y: pos.y - padding,
          width: width + padding * 2,
          height: height + padding * 2,
        }
        if (!this.checkCollision(newRect, occupied)) {
          return pos
        }
      }
    }

    for (let attempt = 0; attempt < LAYOUT_SETTINGS.MAX_COLLISION_ATTEMPTS; attempt++) {
      // Calculate position using extremely aggressive spiral
      const rawX = centerX + radius * Math.cos(angle) - width / 2
      const rawY = centerY + radius * Math.sin(angle) - height / 2

      // Extremely permissive bounds checking
      const x = Math.max(minValidX, Math.min(maxValidX, rawX))
      const y = Math.max(minValidY, Math.min(maxValidY, rawY))

      // Extremely aggressive expansion regardless of position
      radius += radiusIncrement * 0.25
      angle += angleIncrement * 1.5

      // Check collision with existing words
      const newRect = {
        x: x - padding,
        y: y - padding,
        width: width + padding * 2,
        height: height + padding * 2,
      }

      if (!this.checkCollision(newRect, occupied)) {
        return { x, y }
      }
    }

    // Last resort: aggressive random placement across entire viewport
    return this.findRandomPosition(width, height, occupied, minValidX, maxValidX, minValidY, maxValidY, padding)
  }

  /**
   * Last resort: try random placement for remaining words
   */
  private findRandomPosition(
    width: number,
    height: number,
    occupied: Array<{x: number, y: number, width: number, height: number}>,
    minValidX: number,
    maxValidX: number,
    minValidY: number,
    maxValidY: number,
    padding: number
  ): {x: number, y: number} | null {
    // Try random positions for a limited number of attempts
    for (let attempt = 0; attempt < 500; attempt++) {
      const x = minValidX + Math.random() * (maxValidX - minValidX)
      const y = minValidY + Math.random() * (maxValidY - minValidY)

      const newRect = {
        x: x - padding,
        y: y - padding,
        width: width + padding * 2,
        height: height + padding * 2,
      }

      if (!this.checkCollision(newRect, occupied)) {
        return { x, y }
      }
    }

    return null // Final fallback
  }

  /**
   * Check if two rectangles overlap (simplified for efficiency)
   */
  private checkCollision(
    rect: {x: number, y: number, width: number, height: number},
    occupied: Array<{x: number, y: number, width: number, height: number}>
  ): boolean {
    for (const other of occupied) {
      if (
        rect.x < other.x + other.width &&
        rect.x + rect.width > other.x &&
        rect.y < other.y + other.height &&
        rect.y + rect.height > other.y
      ) {
        return true
      }
    }
    return false
  }

  /**
   * Optimize layout to fill viewport with balanced scaling
   */
  private optimizeViewportUsage(words: Word[]): Word[] {
    if (words.length === 0) return words

    // Calculate bounding rectangle
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const word of words) {
      const wordRight = word.position.x + this.getWordWidth(word)
      const wordBottom = word.position.y + this.getWordHeight(word)

      minX = Math.min(minX, word.position.x)
      minY = Math.min(minY, word.position.y)
      maxX = Math.max(maxX, wordRight)
      maxY = Math.max(maxY, wordBottom)
    }

    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    const currentCoverage = (contentWidth * contentHeight) / (this.viewportWidth * this.viewportHeight)

    console.log('[WordCloudLayout] Content bounds:', {minX, minY, maxX, maxY})
    console.log('[WordCloudLayout] Content size:', contentWidth, 'x', contentHeight)
    console.log('[WordCloudLayout] Current coverage:', currentCoverage.toFixed(3))
    console.log('[WordCloudLayout] Words placed:', words.length, 'of', this.wordCount)

    // Calculate content and viewport centers
    const contentCenterX = (minX + maxX) / 2
    const contentCenterY = (minY + maxY) / 2
    const viewportCenterX = this.viewportWidth / 2
    const viewportCenterY = this.viewportHeight / 2

    // If content already fills target coverage or more, just center it
    if (currentCoverage >= LAYOUT_SETTINGS.TARGET_VIEWPORT_COVERAGE) {
      console.log('[WordCloudLayout] Coverage sufficient, only centering')
      // Only center without scaling
      const offsetX = viewportCenterX - contentCenterX
      const offsetY = viewportCenterY - contentCenterY

      return words.map(word => ({
        ...word,
        position: {
          x: word.position.x + offsetX,
          y: word.position.y + offsetY,
        },
      }))
    }

    // Calculate scale to achieve target coverage (extremely aggressive scaling)
    const maxScale = 1.7 // Allow extremely aggressive scaling for maximum viewport utilization
    const targetScale = Math.min(
      maxScale,
      Math.sqrt(
        (LAYOUT_SETTINGS.TARGET_VIEWPORT_COVERAGE * this.viewportWidth * this.viewportHeight) /
        (contentWidth * contentHeight)
      )
    )

    console.log('[WordCloudLayout] Applying scale:', targetScale.toFixed(2))

    // Scale and translate all words
    return words.map(word => ({
      ...word,
      position: {
        x: viewportCenterX + (word.position.x - contentCenterX) * targetScale,
        y: viewportCenterY + (word.position.y - contentCenterY) * targetScale,
      },
    }))
  }

  /**
   * Get word width for calculations
   */
  private getWordWidth(word: Word): number {
    this.ctx.font = `${word.fontSize}px Inter, sans-serif`
    const metrics = this.ctx.measureText(word.original)
    return word.rotation === 0 ? metrics.width : word.fontSize
  }

  /**
   * Get word height for calculations
   */
  private getWordHeight(word: Word): number {
    return word.rotation === 0 ? word.fontSize : this.getWordWidth(word)
  }
}

/**
 * Main function to generate word cloud layout
 */
export function generateWordCloudLayout(
  words: string[],
  viewportWidth: number,
  viewportHeight: number
): Word[] {
  const engine = new WordCloudLayoutEngine(viewportWidth, viewportHeight, words.length)
  return engine.generateLayout(words)
}
