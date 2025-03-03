import PropTypes from 'prop-types'
import { useUser } from '../../../contexts/UserContext'
import { formatTime } from '../../../utils/formatTime'
import { useGame } from '../../../contexts/GameContext'

import './GameHeader.scss'

const GameHeader = ({ remainingTime, isMultiplayer, multiplayerData }) => {
  const { user } = useUser()
  const { guess } = useGame()

  let currentUserScore = 0

  if (isMultiplayer && multiplayerData && multiplayerData.movies) {
    // En mode multijoueur, compter les films devinés par le joueur courant
    currentUserScore = multiplayerData.movies.filter(
      (movie) => movie.guess && movie.guess.guessBy === (user.id || user),
    ).length
  } else {
    // En mode solo, utiliser le score du contexte de jeu
    currentUserScore = guess
  }

  return (
    <div className="game-header">
      <div className="game-time">{formatTime(remainingTime)}</div>
      <div className="player-score">Score : {currentUserScore}</div>
    </div>
  )
}

GameHeader.propTypes = {
  remainingTime: PropTypes.number.isRequired,
  isMultiplayer: PropTypes.bool.isRequired,
  multiplayerData: PropTypes.object,
}

export default GameHeader
