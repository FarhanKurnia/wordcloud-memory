import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GameLayout, GameContent } from '../layouts'
import { Card, CardBody, CardFooter, Button, Input, Textarea } from '../components'
import { useGame } from '../features/hooks/useGame'
import { useFullscreen } from '../hooks/useFullscreen'
import { validateWordList, WordValidationStats } from '../utils/wordUtils'
import { MIN_DURATION, MAX_DURATION, MIN_WORDS } from '../constants/game'
import { GamePhase } from '../types/game'

/**
 * Setup Page
 * Allows operator to configure game and import words
 */
export function SetupPage() {
  const { storePendingConfig, setPhase } = useGame()
  const { toggleFullscreen } = useFullscreen()
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
    console.log('[SetupPage] Start game clicked')
    console.log('[SetupPage] Title:', title)
    console.log('[SetupPage] Duration:', duration)
    console.log('[SetupPage] Validation:', validation)

    if (!validation || validation.finalWordCount < MIN_WORDS) {
      alert(`Masukkan minimal ${MIN_WORDS} kata`)
      return
    }

    if (!title.trim()) {
      alert('Masukkan judul permainan')
      return
    }

    if (duration < MIN_DURATION || duration > MAX_DURATION) {
      alert(`Durasi harus antara ${MIN_DURATION} dan ${MAX_DURATION} detik`)
      return
    }

    console.log('[SetupPage] All validations passed')
    console.log('[SetupPage] Calling storePendingConfig with:', {
      title: title.trim(),
      duration,
      words: validation.normalizedWords
    })

    // Store pending configuration and transition to rules page
    storePendingConfig(
      title.trim(),
      duration,
      validation.normalizedWords
    )

    console.log('[SetupPage] Pending config stored, now transitioning to RULES phase')
    setPhase(GamePhase.RULES)
    console.log('[SetupPage] Phase transition completed')
  }, [validation, title, duration, storePendingConfig, setPhase])

  const canStart = validation && validation.finalWordCount >= MIN_WORDS && title.trim() && duration >= MIN_DURATION

  return (
    <GameLayout onToggleFullscreen={toggleFullscreen}>
      <GameContent>
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
                    Judul Permainan
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masukkan judul permainan..."
                    fullWidth
                  />
                </div>

                {/* Duration Input */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Waktu Menghafal (detik)
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
                    Direkomendasikan: 60-120 detik
                  </p>
                </div>

                {/* Words Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      Kata-kata (satu per baris)
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Import dari File
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
                    placeholder={`apel\nbanana\njeruk\n...`}
                    rows={10}
                    fullWidth
                  />
                  {validation && (
                    <div className="mt-2 text-sm text-neutral-600">
                      <p>Kata unik: {validation.finalWordCount}</p>
                      {validation.duplicateCount > 0 && (
                        <p className="text-warning">
                          Duplikat dihapus: {validation.duplicateCount}
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
                Lanjut ke Aturan ({validation?.finalWordCount || 0} kata)
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </GameContent>
    </GameLayout>
  )
}
