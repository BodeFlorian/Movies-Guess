import './index.scss'
import { TOTAL_FILMS } from '../../utils/constants'
import useUserStore from '../../store/userStore'
import useMoviesStore from '../../store/moviesStore'
import useGameStore from '../../store/gameStore'

const Header = () => {
  const { pseudo, setPseudo } = useUserStore()
  const { setMovies } = useMoviesStore()
  const { isGameStarted, guess } = useGameStore()
  const { resetGame } = useGameStore()

  const handleLogout = () => {
    setPseudo('')
    setMovies([])
    resetGame()
  }

  return (
    <header className="header">
      <p>MovieBattle</p>
      {isGameStarted && (
        <p>
          Score: {guess}/{TOTAL_FILMS}
        </p>
      )}
      {pseudo && <button onClick={handleLogout}>Se déconnecter</button>}
    </header>
  )
}

export default Header
