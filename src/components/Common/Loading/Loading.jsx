import { memo } from 'react'
import PropTypes from 'prop-types'
import './Loading.scss'

/**
 * Composant d'affichage d'un état de chargement
 * @param {Object} props - Propriétés du composant
 * @param {string} props.message - Message à afficher pendant le chargement
 * @param {string} props.className - Classes CSS additionnelles
 */
const Loading = ({ message = 'Chargement...', className = '' }) => {
  const containerClass = `loading ${className}`.trim()
  const loaderClass = `loading__spinner`

  return (
    <div className={containerClass}>
      <div className={loaderClass}></div>
      {message && <p className="loading__message">{message}</p>}
    </div>
  )
}

Loading.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
}

// Utilisation de memo pour éviter les re-rendus inutiles
export default memo(Loading)
