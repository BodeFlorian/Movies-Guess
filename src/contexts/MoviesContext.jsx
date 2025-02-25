import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'
import PropTypes from 'prop-types'

const MoviesContext = createContext()

export const MoviesProvider = ({ children }) => {
  const [movies, setMovies] = useState(() => {
    try {
      const storedMovies = JSON.parse(localStorage.getItem('movies'))
      return Array.isArray(storedMovies) ? storedMovies : []
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des films depuis localStorage:',
        error,
      )
      return []
    }
  })

  /**
   * Met à jour la liste de films et l'enregistre dans localStorage
   * @param {Array} newMovies - Nouvelle liste de films
   */
  const setMoviesList = useCallback((newMovies) => {
    if (Array.isArray(newMovies)) {
      setMovies(newMovies)
      try {
        localStorage.setItem('movies', JSON.stringify(newMovies))
      } catch (error) {
        console.error(
          "Erreur lors de l'enregistrement des films dans localStorage:",
          error,
        )
      }
    } else {
      console.error('setMovies: les données doivent être un tableau')
    }
  }, [])

  /**
   * Récupère un film par son ID
   * @param {string|number} id - ID du film à récupérer
   * @returns {Object|undefined} - Le film correspondant ou undefined
   */
  const getMovieById = useCallback(
    (id) => {
      return movies.find((movie) => movie.id === id)
    },
    [movies],
  )

  /**
   * Récupère un film par son titre
   * @param {string} title - Titre du film à rechercher
   * @returns {Object|undefined} - Le film correspondant ou undefined
   */
  const getMovieByTitle = useCallback(
    (title) => {
      return movies.find((movie) => movie.title === title)
    },
    [movies],
  )

  // Création mémoïsée de la valeur du contexte
  const value = useMemo(
    () => ({
      movies,
      setMovies: setMoviesList,
      getMovieById,
      getMovieByTitle,
    }),
    [movies, setMoviesList, getMovieById, getMovieByTitle],
  )

  return (
    <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>
  )
}

/**
 * Hook pour utiliser le contexte des films
 * @returns {Object} - Valeurs et fonctions du contexte
 */
export const useMovies = () => {
  const context = useContext(MoviesContext)
  if (context === undefined) {
    throw new Error(
      "useMovies doit être utilisé à l'intérieur d'un MoviesProvider",
    )
  }
  return context
}

MoviesProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
