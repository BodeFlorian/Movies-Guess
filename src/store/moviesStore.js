import { create } from 'zustand'

const useMoviesStore = create((set) => ({
  // Liste des films disponibles récupérés depuis l'API
  movies: (() => {
    try {
      const storedMovies = JSON.parse(localStorage.getItem('movies'))
      return Array.isArray(storedMovies) ? storedMovies : []
    } catch {
      return []
    }
  })(),

  // Met à jour la liste des films et la stocke dans localStorage
  setMovies: (newMovies) => {
    if (Array.isArray(newMovies)) {
      set({ movies: newMovies })
      localStorage.setItem('movies', JSON.stringify(newMovies))
    } else {
      console.error('setMovies: les données doivent être un tableau')
    }
  },
}))

export default useMoviesStore
