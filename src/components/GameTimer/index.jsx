import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import './index.scss'

const GameTimer = ({ gameEndTime }) => {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!gameEndTime) return

    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, Math.floor((gameEndTime - Date.now()) / 1000)))
    }, 1000)

    return () => clearInterval(timer)
  }, [gameEndTime])

  if (!gameEndTime) {
    return <h3 className="timer">Partie terminée...</h3>
  }

  return <h3 className="timer">{timeLeft} secondes</h3>
}

GameTimer.propTypes = {
  gameEndTime: PropTypes.number,
}

export default GameTimer
