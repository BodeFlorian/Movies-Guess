import './index.scss'
import useUserStore from '../../store/userStore'
import useMoviesStore from '../../store/moviesStore'
import useGameStore from '../../store/gameStore'
import useGameLogic from '../../utils/gameLogic'

const Header = () => {
  const { pseudo, setPseudo } = useUserStore()
  const { setMovies } = useMoviesStore()
  const { guess, totalMovies } = useGameStore()
  const { resetGame } = useGameLogic()

  const handleLogout = () => {
    setPseudo('')
    setMovies({})
    localStorage.removeItem('currentGame')
    resetGame()
  }

  return (
    <header className="header">
      <p>MovieBattle</p>
      {totalMovies > 0 && (
        <p>
          Score: {guess}/{totalMovies}
        </p>
      )}
      {pseudo && <button onClick={handleLogout}>Se déconnecter</button>}
    </header>
  )
}

export default Header
