import { create } from 'zustand'

const useMoviesStore = create((set) => ({
  movies: JSON.parse(localStorage.getItem('movies')) || {},

  setMovies: (newMovies) => {
    set({ movies: newMovies })
    localStorage.setItem('movies', JSON.stringify(newMovies))
  },
}))

export default useMoviesStore
