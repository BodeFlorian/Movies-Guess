import { useNavigate } from 'react-router-dom'
import useUserStore from '../../store/userStore'
import useGameStore from '../../store/gameStore'

const Menu = () => {
  const { pseudo } = useUserStore()
  const { startGame } = useGameStore()
  const navigate = useNavigate()

  if (!pseudo) {
    navigate('/')
    return null
  }

  const handleStartGame = () => {
    startGame()
    navigate('/game')
  }

  return (
    <div>
      <p>Bienvenue {pseudo}</p>
      <div>
        <button onClick={handleStartGame}>Lancer une partie</button>
      </div>
    </div>
  )
}

export default Menu
