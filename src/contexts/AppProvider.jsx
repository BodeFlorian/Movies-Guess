import PropTypes from 'prop-types'
import { GameProvider } from './GameContext'
import { MoviesProvider } from './MoviesContext'
import { UserProvider } from './UserContext'

export const AppProvider = ({ children }) => {
  return (
    <UserProvider>
      <MoviesProvider>
        <GameProvider>{children}</GameProvider>
      </MoviesProvider>
    </UserProvider>
  )
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
