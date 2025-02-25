import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { useGame } from '../../contexts/GameContext'

import './Menu.scss'

const Menu = () => {
  const { user } = useUser()
  const { startGame, resetGame } = useGame()
  const navigate = useNavigate()

  const handleStartGame = () => {
    resetGame()
    startGame()
    navigate('/game')
  }

  return (
    <div className="menu">
      <p className="menu__welcome">
        Bienvenue, <span className="menu__welcome-pseudo">{user}</span> !
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
