import GameTimer from '../GameTimer'
import useGameStore from '../../store/gameStore'
import { TOTAL_FILMS } from '../../utils/constants'

import './index.scss'

const Header = () => {
  const { guess } = useGameStore()

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
