import { GameState } from '../types/game'
import { STORAGE_KEYS } from '../constants/game'

/**
 * LocalStorage Abstraction Layer
 * Provides centralized storage with versioning support
 */
class GameStorageService {
  private readonly VERSION = 1
  private readonly storageKey: string

  constructor(key: string) {
    this.storageKey = key
  }

  /**
   * Save game state to localStorage
   */
  save(state: GameState): void {
    try {
      const data = {
        version: this.VERSION,
        timestamp: Date.now(),
        state,
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save game state:', error)
    }
  }

  /**
   * Load game state from localStorage
   */
  load(): GameState | null {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) {
        return null
      }

      const data = JSON.parse(stored)

      // Version check
      if (data.version !== this.VERSION) {
        console.warn('Storage version mismatch, clearing storage')
        this.clear()
        return null
      }

      return data.state as GameState
    } catch (error) {
      console.error('Failed to load game state:', error)
      return null
    }
  }

  /**
   * Clear stored game state
   */
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.error('Failed to clear game state:', error)
    }
  }

  /**
   * Check if saved game exists
   */
  hasSavedGame(): boolean {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored !== null
    } catch {
      return false
    }
  }
}

/**
 * Settings storage service
 */
class SettingsStorageService {
  private readonly storageKey: string

  constructor(key: string) {
    this.storageKey = key
  }

  /**
   * Save settings
   */
  save(settings: Record<string, unknown>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  /**
   * Load settings
   */
  load(): Record<string, unknown> | null {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Failed to load settings:', error)
      return null
    }
  }

  /**
   * Clear settings
   */
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.error('Failed to clear settings:', error)
    }
  }
}

// Export singleton instances
export const GameStorage = new GameStorageService(STORAGE_KEYS.GAME_STATE)
export const SettingsStorage = new SettingsStorageService(STORAGE_KEYS.SETTINGS)
