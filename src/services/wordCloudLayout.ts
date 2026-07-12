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

    // Process words in random order
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

      // Find position using spiral algorithm
      const position = this.findPosition(
        width,
        height,
        occupiedRectangles,
        words.length
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
          x: position.x,
          y: position.y,
          width,
          height,
        })
      } else {
        console.log(`[WordCloudLayout] Failed to place "${word}" - no position found`)
      }
    }

    console.log('[WordCloudLayout] Layout complete. Total words placed:', words.length)

    // Optimize layout to fill viewport
    return this.optimizeViewportUsage(words)
  }

  /**
   * Calculate responsive font sizes based on word count
   */
  private calculateResponsiveFontSizes(): Record<FontSize, number> {
    const baseSizes: Record<FontSize, number> = {
      'extra-large': 56,
      'large': 42,
      'medium': 32,
      'small': 24,
      'tiny': 18,
    }

    // Scale down for many words
    let scaleFactor = 1
    if (this.wordCount > 100) {
      scaleFactor = 0.8
    } else if (this.wordCount > 50) {
      scaleFactor = 0.9
    }

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
   * Find position using spiral placement algorithm
   */
  private findPosition(
    width: number,
    height: number,
    occupied: Array<{x: number, y: number, width: number, height: number}>,
    _wordIndex: number
  ): {x: number, y: number} | null {
    const centerX = this.viewportWidth / 2
    const centerY = this.viewportHeight / 2

    // Spiral parameters
    const angleIncrement = 0.5
    const radiusIncrement = LAYOUT_SETTINGS.SPIRAL_SPACING
    let angle = 0
    let radius = 0

    for (let attempt = 0; attempt < LAYOUT_SETTINGS.MAX_COLLISION_ATTEMPTS; attempt++) {
      // Calculate position using spiral
      const x = centerX + radius * Math.cos(angle) - width / 2
      const y = centerY + radius * Math.sin(angle) - height / 2

      // Check bounds with padding
      const padding = LAYOUT_SETTINGS.WORD_PADDING
      if (
        x < padding ||
        y < padding ||
        x + width + padding > this.viewportWidth ||
        y + height + padding > this.viewportHeight
      ) {
        // Continue spiral
        angle += angleIncrement
        radius += radiusIncrement * 0.1
        continue
      }

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

      // Continue spiral
      angle += angleIncrement
      radius += radiusIncrement * 0.1
    }

    // If no position found, return null (shouldn't happen with reasonable word counts)
    return null
  }

  /**
   * Check if two rectangles overlap
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
   * Optimize layout to fill approximately 85% of viewport
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

    // If content already fills 85% or more, no scaling needed
    if (currentCoverage >= LAYOUT_SETTINGS.TARGET_VIEWPORT_COVERAGE) {
      return words
    }

    // Calculate scale to achieve target coverage
    const targetScale = Math.sqrt(
      (LAYOUT_SETTINGS.TARGET_VIEWPORT_COVERAGE * this.viewportWidth * this.viewportHeight) /
      (contentWidth * contentHeight)
    )

    // Calculate center offset
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    const viewportCenterX = this.viewportWidth / 2
    const viewportCenterY = this.viewportHeight / 2

    // Scale and translate all words
    return words.map(word => ({
      ...word,
      position: {
        x: viewportCenterX + (word.position.x - centerX) * targetScale,
        y: viewportCenterY + (word.position.y - centerY) * targetScale,
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
