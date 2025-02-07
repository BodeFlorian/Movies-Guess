import { create } from 'zustand'

const useGameStore = create((set) => ({
  guess: parseInt(localStorage.getItem('guess')) || 0,
  totalMovies: parseInt(localStorage.getItem('totalMovies')) || 0,

  setGuess: (newGuess) => {
    set(() => {
      localStorage.setItem('guess', newGuess)
      return { guess: newGuess }
    })
  },

  setTotalMovies: (newTotalMovies) => {
    set(() => {
      localStorage.setItem('totalMovies', newTotalMovies)
      return { totalMovies: newTotalMovies }
    })
  },
}))

export default useGameStore
