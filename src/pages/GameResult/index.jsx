import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal'
import GameTimer from '../../components/GameTimer'
import MovieList from '../../components/MovieList'
import useUserStore from '../../store/userStore'
import useGameStore from '../../store/gameStore'
import { TOTAL_FILMS } from '../../utils/constants'

import './index.scss'

const GameResult = () => {
  const navigate = useNavigate()
  const { pseudo } = useUserStore()

  const { isGameStarted, guess, gameEndTime, currentGame, resetGame } =
    useGameStore()

  const [isModalOpen, setIsModalOpen] = useState(true)
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
    }
  }, [currentGame])

  useEffect(() => {
    if (currentGame.length > 0 && selectedMovies.length === 0) {
      restoreGame()
      setLoading(false)
      console.log('Affichage des résultats...')
      return
    }
  }, [currentGame, selectedMovies.length, restoreGame])

  // Empêche le rendu si l'utilisateur est redirigé
  if (!pseudo) return null

  // Affiche un message de chargement pendant l'initialisation
  if (loading) return <p>Chargement...</p>

  const handleViewAnswers = () => {
    setIsModalOpen(false)
  }

  const handleBackToMenu = () => {
    resetGame()
    navigate('/menu')
  }

  return (
    <div className="game-container">
      {isModalOpen ? (
        <Modal>
          <div className="results">
            <h2 className="results__title">Vous avez terminé la partie</h2>
            <p className="results__score">
              <span className="results__score-value">{`${guess}/${TOTAL_FILMS}`}</span>
              films trouvés
            </p>
            <menu className="results__menu">
              <li className="results__menu-item">
                <button
                  className="results__button results__button--answers"
                  name="view-answers"
                  onClick={handleViewAnswers}
                >
                  Voir les réponses
                </button>
              </li>
              <li className="results__menu-item">
                <button
                  className="results__button results__button--menu"
                  name="return-menu"
                  onClick={handleBackToMenu}
                >
                  Retour au menu
                </button>
              </li>
            </menu>
          </div>
        </Modal>
      ) : null}
      <GameTimer gameEndTime={gameEndTime} />
      <MovieList movies={selectedMovies} />
      <button onClick={handleBackToMenu}>Retour au menu</button>
    </div>
  )
}

export default GameResult
