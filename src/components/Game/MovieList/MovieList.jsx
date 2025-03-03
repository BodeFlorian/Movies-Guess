import { memo } from 'react'
import PropTypes from 'prop-types'
import MovieCard from '../MovieCard/MovieCard'
import './MovieList.scss'

/**
 * Affiche une liste de films sous forme de cartes
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.movies - Tableau d'objets films à afficher
 * @param {Function} props.onGuess - Fonction appelée lorsqu'un utilisateur devine un film
 * @param {boolean} props.isResults - Indique si on affiche les résultats (tous les titres visibles)
 * @param {boolean} props.isMultiplayer - Indique si on est en mode multijoueur
 */
const MovieList = ({
  movies,
  onGuess,
  isResults = false,
  isMultiplayer = false,
}) => {
  if (!movies || movies.length === 0) {
    return <div className="movies-empty">Aucun film trouvé.</div>
  }

  return (
    <ul className="movies">
      {movies.map((movie, index) => (
        <MovieCard
          key={`movie-${movie.id || index}`}
          title={movie.title}
          backdrops={movie.backdrops}
          onGuess={onGuess}
          isResults={isResults}
        />
      ))}
    </ul>
  )
}

MovieList.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      title: PropTypes.string.isRequired,
      backdrops: PropTypes.array.isRequired,
    }),
  ).isRequired,
  onGuess: PropTypes.func,
  isResults: PropTypes.bool,
  isMultiplayer: PropTypes.bool,
}

// Utilisation de memo pour éviter les re-rendus inutiles
export default memo(MovieList)
