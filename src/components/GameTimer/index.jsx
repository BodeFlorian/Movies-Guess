import { useState, useEffect } from 'react'
import './index.scss'

const GameTimer = ({ gameEndTime }) => {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, Math.floor((gameEndTime - Date.now()) / 1000)))
    }, 1000)

    return () => clearInterval(timer)
  }, [gameEndTime])

  return <h3 className="timer">{timeLeft} secondes</h3>
}

export default GameTimer
