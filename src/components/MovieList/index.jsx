import MovieCard from '../MovieCard'
import './index.scss'

const MovieList = ({ movies }) => {
  if (movies.length === 0) {
    return <p>Aucun film trouvé.</p>
  }

  return (
    <ul className="movies">
      {movies.map((movie, index) => (
        <MovieCard
          key={index}
          title={movie.title}
          backdrops={movie.backdrops}
        />
      ))}
    </ul>
  )
}

export default MovieList
