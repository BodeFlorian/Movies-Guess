import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal/Modal'
import MovieList from '../../components/MovieList/MovieList'
import { useGame } from '../../contexts/GameContext'
import { TOTAL_FILMS } from '../../utils/constants'

import './GameResult.scss'

const GameResult = () => {
  const navigate = useNavigate()

  const { isGameStarted, guess, currentGame, resetGame, setGameEndTime } =
    useGame()

  const [isModalOpen, setIsModalOpen] = useState(true)
  const [selectedMovies, setSelectedMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isGameStarted) {
      navigate('/game')
    }
  }, [isGameStarted, navigate])

  const restoreGame = useCallback(() => {
    if (currentGame.movies.length > 0) {
      setSelectedMovies(currentGame.movies)
      setGameEndTime(currentGame.gameEndTime)
      console.log('Les données du jeu ont été restaurées')
    }
  }, [currentGame, setGameEndTime])

  useEffect(() => {
    if (currentGame.movies.length > 0 && selectedMovies.length === 0) {
      restoreGame()
      setLoading(false)
      console.log('Affichage des résultats...')
      return
    }
  }, [currentGame.movies.length, selectedMovies.length, restoreGame])

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
    <div
      className="game-container"
      style={{ margin: '2rem 0', paddingBottom: '2rem' }}
    >
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
      <MovieList movies={selectedMovies} />
    </div>
  )
}

export default GameResult
