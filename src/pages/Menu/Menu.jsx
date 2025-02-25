import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { useGame } from '../../contexts/GameContext'

import './Menu.scss'

const Menu = () => {
  const { pseudo } = useUser()
  const { startGame, resetGame } = useGame()
  const navigate = useNavigate()

  useEffect(() => {
    if (!pseudo) {
      navigate('/')
    }
  }, [pseudo, navigate])

  if (!pseudo) return null

  const handleStartGame = () => {
    resetGame()
    startGame()
    navigate('/game')
  }

  return (
    <div className="menu">
      <p className="menu__welcome">
        Bienvenue, <span className="menu__welcome-pseudo">{pseudo}</span> !
      </p>
      <div className="menu__actions">
        <button className="menu__button" onClick={handleStartGame}>
          Lancer une partie
        </button>
      </div>
    </div>
  )
}

export default Menu
