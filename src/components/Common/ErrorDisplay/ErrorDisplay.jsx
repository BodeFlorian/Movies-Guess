import { memo } from 'react'
import PropTypes from 'prop-types'
import './ErrorDisplay.scss'

/**
 * Affiche un message d'erreur avec options pour réessayer ou revenir en arrière
 * @param {Object} props - Propriétés du composant
 * @param {string} props.message - Message d'erreur principal
 * @param {string} props.details - Détails techniques de l'erreur (optionnel)
 * @param {Function} props.onBack - Fonction appelée lors du clic sur le bouton de retour
 * @param {Function} props.onRetry - Fonction appelée lors du clic sur le bouton Réessayer
 * @param {string} props.backLabel - Texte du bouton de retour
 * @param {string} props.retryLabel - Texte du bouton Réessayer
 * @param {string} props.className - Classes CSS additionnelles
 */
const ErrorDisplay = ({
  message,
  details,
  onBack,
  onRetry,
  backLabel = "Retour à l'accueil",
  retryLabel = 'Réessayer',
  className = '',
}) => {
  // Construction de la classe CSS
  const containerClass = `error-container ${className}`.trim()

  return (
    <div className={containerClass}>
      <div className="error-content">
        <h2 className="error-title">Erreur</h2>
        <p className="error-message">{message}</p>

        {details && (
          <details className="error-details">
            <summary>Détails techniques</summary>
            <pre>{details}</pre>
          </details>
        )}

        <div className="error-actions">
          {onBack && (
            <button
              onClick={onBack}
              className="error-button error-button--back"
            >
              {backLabel}
            </button>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="error-button error-button--retry"
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

ErrorDisplay.propTypes = {
  message: PropTypes.string.isRequired,
  details: PropTypes.string,
  onBack: PropTypes.func,
  onRetry: PropTypes.func,
  backLabel: PropTypes.string,
  retryLabel: PropTypes.string,
  className: PropTypes.string,
}

// Utilisation de memo pour éviter les re-rendus inutiles
export default memo(ErrorDisplay)
