import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GameLayout, GameContent } from '../layouts'
import { Card, CardBody, CardFooter, Button } from '../components'
import { useGame } from '../features/hooks/useGame'
import { useFullscreen } from '../hooks/useFullscreen'

/**
 * Rules Page
 * Displays game rules and instructions before starting the game
 */
export function RulesPage() {
  const { state, createGame } = useGame()
  const { toggleFullscreen } = useFullscreen()
  const [isStarting, setIsStarting] = useState(false)

  // Debug: log when RulesPage mounts or updates
  useEffect(() => {
    console.log('[RulesPage] Component mounted/updated')
    console.log('[RulesPage] Current phase:', state.phase)
    console.log('[RulesPage] Pending config available:', !!state.pendingConfig)
    if (state.pendingConfig) {
      console.log('[RulesPage] Pending config details:', {
        title: state.pendingConfig.title,
        duration: state.pendingConfig.duration,
        wordCount: state.pendingConfig.words.length
      })
    }
  }, [state.phase, state.pendingConfig])

  // Handle start game
  const handleStartGame = useCallback(() => {
    console.log('[RulesPage] Start game clicked')
    console.log('[RulesPage] Pending config:', state.pendingConfig)
    setIsStarting(true)

    // Create game with stored configuration
    if (state.pendingConfig) {
      console.log('[RulesPage] Creating game with config:', {
        title: state.pendingConfig.title,
        duration: state.pendingConfig.duration,
        wordCount: state.pendingConfig.words.length
      })
      createGame(
        state.pendingConfig.title,
        state.pendingConfig.duration,
        state.pendingConfig.words
      )
    } else {
      console.error('[RulesPage] No pending config available!')
      alert('Error: No game configuration found. Please go back and setup the game again.')
    }
  }, [state.pendingConfig, createGame])

  const totalWords = state.pendingConfig?.words.length || 0
  const duration = state.pendingConfig?.duration || 60

  return (
    <GameLayout onToggleFullscreen={toggleFullscreen}>
      <GameContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <Card variant="elevated">
            <CardBody>
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Rules */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      🎯 Cara Bermain
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      Kata-kata muncul di layar yang harus diingat, kemudian peserta dipanggil secara acak untuk menyebutkan kata.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      📋 Aturan
                    </h3>
                    <ul className="space-y-1 text-sm text-neutral-600">
                      <li>• 1 orang = 1 kata</li>
                      <li>• Kata tidak boleh sama</li>
                      <li>• Nomor dipanggil acak (1-130)</li>
                      <li>• Peserta menyebutkan kata saat dipanggil</li>
                      <li>• Arah ditentukan pemateri</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      📝 Tips Sukses
                    </h3>
                    <ul className="space-y-1 text-sm text-neutral-600">
                      <li>• Fokus pada kata yang menarik</li>
                      <li>• Buat asosiasi mental</li>
                      <li>• Pilih kata yang mudah diingat</li>
                      <li>• Tenang saat dipanggil</li>
                    </ul>
                  </div>
                </div>

                {/* Right Column - Flow & Config */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      ⏱️ Alur Permainan
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-xs">
                          1
                        </span>
                        <div>
                          <p className="font-medium text-neutral-900">Menghafal</p>
                          <p className="text-neutral-600">{duration} detik</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-xs">
                          2
                        </span>
                        <div>
                          <p className="font-medium text-neutral-900">Transisi</p>
                          <p className="text-neutral-600">Kata disembunyikan</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-xs">
                          3
                        </span>
                        <div>
                          <p className="font-medium text-neutral-900">Interaktif</p>
                          <p className="text-neutral-600">Peserta dipanggil acak</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <h3 className="text-md font-semibold text-neutral-900 mb-3">
                      🎮 Konfigurasi
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Jumlah kata:</span>
                        <span className="font-semibold text-primary-700 text-lg">{totalWords}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Waktu menghafal:</span>
                        <span className="font-semibold text-primary-700 text-lg">{duration}s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Nomor peserta:</span>
                        <span className="font-semibold text-primary-700 text-lg">1-130</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>

            <CardFooter>
              <Button
                size="lg"
                fullWidth
                onClick={handleStartGame}
                disabled={isStarting}
              >
                {isStarting ? 'Memulai Permainan...' : '🚀 Mulai Permainan'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </GameContent>
    </GameLayout>
  )
}
