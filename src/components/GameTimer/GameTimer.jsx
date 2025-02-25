import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../contexts/GameContext'
import PropTypes from 'prop-types'

const GameTimer = () => {
  const navigate = useNavigate()
  const { isGameStarted, gameEndTime, resetGame, currentGame } = useGame()
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!gameEndTime) return

    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, Math.floor((gameEndTime - Date.now()) / 1000)))
    }, 1000)

    return () => clearInterval(timer)
  }, [gameEndTime])

  const handleBackToMenu = () => {
    resetGame()
    navigate('/menu')
  }

  if (gameEndTime && !isGameStarted && currentGame.gameEndTime) {
    return (
      <button
        className="header__button header__button-menu"
        name="menu-button"
        onClick={handleBackToMenu}
      >
        Retour au menu
      </button>
    )
  }

  if (!gameEndTime && isGameStarted) {
    return <p className="header__timer">Démarrage de la partie</p>
  }

  return <h3 className="header__timer">{timeLeft} secondes</h3>
}

GameTimer.propTypes = {
  gameEndTime: PropTypes.number,
}

export default GameTimer
