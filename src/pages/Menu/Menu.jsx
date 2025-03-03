import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { useGame } from '../../contexts/GameContext'

import './Menu.scss'

const Menu = () => {
  const { user } = useUser()
  const { startGame, resetGame } = useGame()
  const navigate = useNavigate()
  const [gameId, setGameId] = useState('')

  const handleStartGame = () => {
    resetGame()
    startGame()
    navigate('/game')
  }

  const handleJoinGame = (e) => {
    e.preventDefault()
    if (gameId.trim().length < 3) return
    navigate(`/lobby/${gameId.toUpperCase()}`)
  }

  return (
    <div className="menu">
      <p className="menu__welcome">
        Bienvenue, <span className="menu__welcome-pseudo">{user}</span> !
      </p>
      <div className="menu__actions">
        <div className="menu__solo menu__mode">
          <p className="menu__mode-title">Mode solo</p>

          <button className="menu__button" onClick={handleStartGame}>
            Lancer une partie
          </button>
        </div>
        <div className="menu__multi menu__mode">
          <p className="menu__mode-title">Mode multijoueur</p>
          <form className="menu__multi-form" onSubmit={handleJoinGame}>
            <input
              type="text"
              className="menu__multi-input"
              placeholder="ID de la partie"
              value={gameId}
              onChange={(e) => {
                setGameId(e.target.value)
              }}
            />
            <button
              className="menu__button"
              disabled={gameId.trim().length < 3 ? true : false}
            >
              Créer / Rejoindre une partie
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Menu
