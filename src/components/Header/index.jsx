import './index.scss'
import useUserStore from '../../store/userStore'
import useMoviesStore from '../../store/moviesStore'
import useGameStore from '../../store/gameStore'

const Header = () => {
  const { pseudo, setPseudo } = useUserStore()
  const { setMovies } = useMoviesStore()
  const { guess, totalMovies, setGuess, setTotalMovies } = useGameStore()

  const handleLogout = () => {
    setPseudo('')
    setMovies({})
    setTotalMovies(0)
    setGuess(0)
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
