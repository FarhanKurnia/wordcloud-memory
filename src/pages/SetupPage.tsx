import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GameLayout, GameContent, GameHeader } from '../layouts'
import { Card, CardBody, CardFooter, Button, Input, Textarea } from '../components'
import { useGame } from '../features/hooks/useGame'
import { validateWordList, WordValidationStats } from '../utils/wordUtils'
import { MIN_DURATION, MAX_DURATION, MIN_WORDS } from '../constants/game'

/**
 * Setup Page
 * Allows operator to configure game and import words
 */
export function SetupPage() {
  const { createGame } = useGame()
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(60)
  const [rawWords, setRawWords] = useState('')
  const [validation, setValidation] = useState<WordValidationStats | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate words as user types
  useEffect(() => {
    if (rawWords.trim()) {
      const words = rawWords.split('\n').filter(w => w.trim())
      const stats = validateWordList(words)
      setValidation(stats)
    } else {
      setValidation(null)
    }
  }, [rawWords])

  // Handle file import
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setRawWords(content)
    }
    reader.readAsText(file)
  }, [])

  // Handle start game
  const handleStartGame = useCallback(() => {
    if (!validation || validation.finalWordCount < MIN_WORDS) {
      alert(`Please enter at least ${MIN_WORDS} words`)
      return
    }

    if (!title.trim()) {
      alert('Please enter a game title')
      return
    }

    if (duration < MIN_DURATION || duration > MAX_DURATION) {
      alert(`Duration must be between ${MIN_DURATION} and ${MAX_DURATION} seconds`)
      return
    }

    createGame(
      title.trim(),
      duration,
      validation.normalizedWords
    )
  }, [validation, title, duration, createGame])

  const canStart = validation && validation.finalWordCount >= MIN_WORDS && title.trim() && duration >= MIN_DURATION

  return (
    <GameLayout>
      <GameContent>
        <GameHeader
          title="Memory Word Game"
          subtitle="Setup your game"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <Card variant="elevated">
            <CardBody>
              <div className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Game Title
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter game title..."
                    fullWidth
                  />
                </div>

                {/* Duration Input */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Memorization Duration (seconds)
                  </label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={MIN_DURATION}
                    max={MAX_DURATION}
                    fullWidth
                  />
                  <p className="text-sm text-neutral-500 mt-1">
                    Recommended: 60-120 seconds
                  </p>
                </div>

                {/* Words Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      Words (one per line)
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Import from File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </div>
                  <Textarea
                    value={rawWords}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRawWords(e.target.value)}
                    placeholder={`apple\nbanana\norange\n...`}
                    rows={10}
                    fullWidth
                  />
                  {validation && (
                    <div className="mt-2 text-sm text-neutral-600">
                      <p>Unique words: {validation.finalWordCount}</p>
                      {validation.duplicateCount > 0 && (
                        <p className="text-warning">
                          Duplicates removed: {validation.duplicateCount}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardBody>

            <CardFooter>
              <Button
                size="lg"
                fullWidth
                onClick={handleStartGame}
                disabled={!canStart}
              >
                Start Game ({validation?.finalWordCount || 0} words)
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </GameContent>
    </GameLayout>
  )
}
