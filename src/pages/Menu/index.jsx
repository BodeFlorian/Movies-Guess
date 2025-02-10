import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../../store/userStore'
import useGameStore from '../../store/gameStore'

import './index.scss'

const Menu = () => {
  const { pseudo } = useUserStore()
  const { startGame } = useGameStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!pseudo) {
      navigate('/')
    }
  }, [pseudo, navigate])

  if (!pseudo) return null

  const handleStartGame = () => {
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
