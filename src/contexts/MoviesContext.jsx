import { createContext, useContext, useState } from 'react'
import PropTypes from 'prop-types'

const MoviesContext = createContext()

export const MoviesProvider = ({ children }) => {
  const [movies, setMovies] = useState(() => {
    try {
      const storedMovies = JSON.parse(localStorage.getItem('movies'))
      return Array.isArray(storedMovies) ? storedMovies : []
    } catch {
      return []
    }
  })

  // Update the list of movies and store it in localStorage
  const setMoviesList = (newMovies) => {
    if (Array.isArray(newMovies)) {
      setMovies(newMovies)
      localStorage.setItem('movies', JSON.stringify(newMovies))
    } else {
      console.error('setMovies: data must be an array')
    }
  }

  const value = {
    movies,
    setMovies: setMoviesList,
  }

  return (
    <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>
  )
}

// Custom hook to use the movies context
export const useMovies = () => {
  const context = useContext(MoviesContext)
  if (context === undefined) {
    throw new Error('useMovies must be used within a MoviesProvider')
  }
  return context
}

MoviesProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
