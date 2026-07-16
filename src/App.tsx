import { GameProvider, useGame } from './features/hooks/useGame'
import { SetupPage, RulesPage, GamePage } from './pages'
import { GamePhase } from './types/game'

function AppContent() {
  const { state } = useGame()

  // Route based on game phase
  const renderPage = () => {
    console.log('[AppContent] Current phase:', state.phase)
    console.log('[AppContent] Rendering page for phase:', state.phase)

    switch (state.phase) {
      case GamePhase.IDLE:
      case GamePhase.SETUP:
        console.log('[AppContent] Rendering SetupPage')
        return <SetupPage />
      case GamePhase.RULES:
        console.log('[AppContent] Rendering RulesPage')
        return <RulesPage />
      case GamePhase.GENERATING_LAYOUT:
      case GamePhase.MEMORIZATION:
      case GamePhase.TRANSITION:
      case GamePhase.GUESSING:
      case GamePhase.COMPLETED:
        console.log('[AppContent] Rendering GamePage')
        return <GamePage />
      default:
        console.log('[AppContent] Rendering default SetupPage')
        return <SetupPage />
    }
  }

  return <>{renderPage()}</>
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

export default App
