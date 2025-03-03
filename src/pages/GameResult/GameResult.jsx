import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Modal from '../../components/Common/Modal/Modal'
import MovieList from '../../components/Game/MovieList/MovieList'
import Loading from '../../components/Common/Loading/Loading'
import ErrorDisplay from '../../components/Common/ErrorDisplay/ErrorDisplay'
import GameHeader from '../../components/Game/GameHeader/GameHeader'
import { TOTAL_FILMS } from '../../utils/constants'
import useGameResults from '../../hooks/useGameResults'

import './GameResult.scss'

/**
 * Page affichant les résultats du jeu
 */
const GameResult = () => {
  const navigate = useNavigate()
  const { gameId } = useParams()
  const location = useLocation()

  // Extraire l'ID du jeu de l'URL
  const queryParams = new URLSearchParams(location.search)
  const gameIdFromQuery = queryParams.get('gameId')

  // Déterminer l'ID de jeu actif et si nous sommes en mode multijoueur
  const effectiveGameId = gameId || gameIdFromQuery
  const isMultiplayer = Boolean(effectiveGameId)

  const {
    loading,
    error,
    score,
    movies,
    playerCount,
    isModalOpen,
    handleViewAnswers,
    handleBackToMenu,
    authorized,
  } = useGameResults(isMultiplayer, effectiveGameId)

  if (error) {
    return <ErrorDisplay message={error} onBack={() => navigate('/')} />
  }

  if (loading && !authorized) {
    return <Loading message="Vérification de l'accès aux résultats..." />
  }

  if (loading) {
    return <Loading message="Chargement des résultats..." />
  }

  return (
    <div className="game-result-container">
      {isModalOpen && (
        <Modal>
          <div className="results">
            <h2 className="results__title">Vous avez terminé la partie</h2>
            <p className="results__score">
              <span className="results__score-value">{`${score}/${TOTAL_FILMS}`}</span>
              films trouvés
            </p>

            {isMultiplayer && (
              <div className="results__multiplayer-info">
                <p>Partie multijoueur - ID: {effectiveGameId}</p>
                <p>Nombre de joueurs: {playerCount}</p>
              </div>
            )}

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
      )}

      <GameHeader
        remainingTime={0}
        isMultiplayer={isMultiplayer}
        multiplayerData={null}
        score={score}
        showBackButton={true}
        onBackToMenu={handleBackToMenu}
      />
      <MovieList movies={movies} isResults={true} />
    </div>
  )
}

export default GameResult
