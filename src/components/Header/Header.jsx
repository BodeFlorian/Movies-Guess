import GameTimer from '../GameTimer/GameTimer'
import { useGame } from '../../contexts/GameContext'
import { TOTAL_FILMS } from '../../utils/constants'

import './Header.scss'

const Header = () => {
  const { guess } = useGame()

  return (
    <header className="header">
      <p>
        Score: {guess}/{TOTAL_FILMS}
      </p>

      <GameTimer />
    </header>
  )
}

export default Header
