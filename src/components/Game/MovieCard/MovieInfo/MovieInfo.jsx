import PropTypes from 'prop-types'
import './MovieInfo.scss'

/**
 * Affiche les informations d'un film (titre et qui l'a deviné)
 * @param {Object} props - Propriétés du composant
 * @param {string} props.title - Titre du film (ou ????? si non deviné)
 * @param {boolean} props.guessState - Indique si le film a été deviné
 * @param {string} props.guessedBy - Identifiant du joueur qui a deviné le film
 * @param {boolean} props.isResults - Indique si on est en mode résultats
 */
const MovieInfo = ({ title, guessState, guessedBy, isResults = false }) => {
  // Déterminer la classe à appliquer en fonction de l'état
  const className = `movieCard__guess ${
    isResults && !guessState
      ? 'movieCard__guess--false'
      : 'movieCard__guess--true'
  }`

  return (
    <div className={className}>
      {/* Afficher qui a deviné le film, si applicable */}
      {guessState && (
        <p className="movieCard__user">
          Trouvé par <span>{guessedBy}</span>
        </p>
      )}
      <span className="movieCard__title">{title}</span>
    </div>
  )
}

MovieInfo.propTypes = {
  title: PropTypes.string.isRequired,
  guessState: PropTypes.bool.isRequired,
  guessedBy: PropTypes.string,
  isResults: PropTypes.bool,
}

export default MovieInfo
