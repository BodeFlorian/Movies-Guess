import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useUser } from '../../../contexts/UserContext'

/**
 * Composant qui vérifie si l'utilisateur est authentifié
 * Si non authentifié, redirige vers la page d'accueil
 */
const PrivateRoute = ({ children }) => {
  const { user } = useUser()

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
}

export default PrivateRoute
