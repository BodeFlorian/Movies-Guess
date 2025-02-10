import useUserStore from '../../store/userStore'
import useMoviesStore from '../../store/moviesStore'
import useGameStore from '../../store/gameStore'
import { TOTAL_FILMS } from '../../utils/constants'

import logout from '../../assets/icons/logout.svg'
import './index.scss'

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
      <h1>MovieBattle</h1>
      {isGameStarted && (
        <p>
          Score: {guess}/{TOTAL_FILMS}
        </p>
      )}
      {pseudo && (
        <button className="header__button" name="logout" onClick={handleLogout}>
          <img src={logout} alt="Logout" />
        </button>
      )}
    </header>
  )
}

export default Header
