import { GameProvider, useGame } from './features/hooks/useGame'
import { SetupPage, GamePage } from './pages'
import { GamePhase } from './types/game'

function AppContent() {
  const { state } = useGame()

  // Route based on game phase
  const renderPage = () => {
    switch (state.phase) {
      case GamePhase.IDLE:
      case GamePhase.SETUP:
        return <SetupPage />
      case GamePhase.GENERATING_LAYOUT:
      case GamePhase.MEMORIZATION:
      case GamePhase.TRANSITION:
      case GamePhase.GUESSING:
      case GamePhase.COMPLETED:
        return <GamePage />
      default:
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
