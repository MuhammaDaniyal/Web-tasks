import  useGameStore  from './stores/gameStore'
import Menu from './components/Menu'
import Game from './components/Game'

export default function App() {

  const gameStarted = useGameStore((state) => state.gameStarted)

  return (
    <div>
      {!gameStarted ? <Menu /> : <Game />}
    </div>
  )
}