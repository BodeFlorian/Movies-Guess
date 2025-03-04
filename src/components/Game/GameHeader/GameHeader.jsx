import PropTypes from 'prop-types'
import { useUser } from '../../../contexts/UserContext'
import { formatTime } from '../../../utils/formatTime'
import { useGame } from '../../../contexts/GameContext'

import './GameHeader.scss'

const GameHeader = ({
  remainingTime,
  isMultiplayer,
  multiplayerData,
  score,
  showBackButton = false,
  onBackToMenu = null,
}) => {
  const { user } = useUser()
  const { guess } = useGame()

  // Si un score est fourni directement (comme dans la page de résultats), l'utiliser
  // Sinon, calculer le score basé sur les données multijoueur ou le contexte du jeu
  let currentUserScore = score !== undefined ? score : 0

  if (score === undefined) {
    if (isMultiplayer && multiplayerData && multiplayerData.movies) {
      // En mode multijoueur, compter les films devinés par le joueur courant
      currentUserScore = multiplayerData.movies.filter(
        (movie) =>
          movie.guess &&
          movie.guess.isGuess &&
          movie.guess.guessBy === (user.id || user),
      ).length
    } else {
      // En mode solo, utiliser le score du contexte de jeu
      currentUserScore = guess
    }
  }

  return (
    <div className="game-header">
      {/* Toujours afficher le temps, même s'il est à 0 */}
      <div className="game-time">{formatTime(remainingTime)}</div>
      <div className="player-score">Score : {currentUserScore}</div>
      {showBackButton && onBackToMenu && (
        <button className="game-header__button" onClick={onBackToMenu}>
          Retour au menu
        </button>
      )}
    </div>
  )
}

GameHeader.propTypes = {
  remainingTime: PropTypes.number.isRequired,
  isMultiplayer: PropTypes.bool.isRequired,
  multiplayerData: PropTypes.object,
  score: PropTypes.number,
  showBackButton: PropTypes.bool,
  onBackToMenu: PropTypes.func,
}

export default GameHeader
