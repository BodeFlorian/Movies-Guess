import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import GameTimer from '../../components/GameTimer'
import MovieList from '../../components/MovieList'
import useUserStore from '../../store/userStore'
import useGameStore from '../../store/gameStore'

const GameResult = () => {
  const navigate = useNavigate()
  const { pseudo } = useUserStore()

  const { isGameStarted, gameEndTime, currentGame, resetGame } = useGameStore()

  const [selectedMovies, setSelectedMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pseudo) {
      navigate('/')
    }
  }, [pseudo, navigate])

  useEffect(() => {
    if (isGameStarted) {
      navigate('/game')
    }
  }, [isGameStarted, navigate])

  const restoreGame = useCallback(() => {
    if (currentGame.length > 0) {
      setSelectedMovies(currentGame)
      console.log('Les données du jeu ont été restaurées')
    }
  }, [currentGame])

  useEffect(() => {
    if (currentGame.length > 0 && selectedMovies.length === 0) {
      restoreGame()
      setLoading(false)
      return
    }
  }, [currentGame, selectedMovies.length, restoreGame])

  // Empêche le rendu si l'utilisateur est redirigé
  if (!pseudo) return null

  // Affiche un message de chargement pendant l'initialisation
  if (loading) return <p>Chargement...</p>

  const handleBackToMenu = () => {
    resetGame()
    navigate('/menu')
  }

  return (
    <div className="game-container">
      <GameTimer gameEndTime={gameEndTime} />
      <MovieList movies={selectedMovies} />
      <button onClick={handleBackToMenu}>Retour au menu</button>
    </div>
  )
}

export default GameResult
