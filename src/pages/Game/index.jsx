import { useNavigate } from 'react-router-dom'
import useUserStore from '../../store/userStore'
import useGameLogic from '../../utils/gameLogic'
import GameTimer from '../../components/GameTimer'
import MovieList from '../../components/MovieList'

const Game = () => {
  const { pseudo } = useUserStore()
  const navigate = useNavigate()
  const { loading, gameEndTime, selectedMovies } = useGameLogic()

  if (!pseudo) {
    navigate('/')
    return null
  }

  if (loading) {
    return <p>Chargement...</p>
  }

  return (
    <div className="game-container">
      <GameTimer gameEndTime={gameEndTime} />
      <MovieList movies={selectedMovies} />
    </div>
  )
}

export default Game
