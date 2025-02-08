import { create } from 'zustand'

const useGameStore = create((set) => ({
  isGameStarted: JSON.parse(localStorage.getItem('isGameStarted')) || false,
  guess: parseInt(localStorage.getItem('guess')) || 0,
  totalMovies: parseInt(localStorage.getItem('totalMovies')) || 0,
  gameEndTime: parseInt(localStorage.getItem('gameEndTime')) || null,

  startGame: () => {
    localStorage.setItem('isGameStarted', true)
    set({ isGameStarted: true })
  },

  setGuess: (newGuess) => {
    localStorage.setItem('guess', newGuess)
    set({ guess: newGuess })
  },

  setTotalMovies: (newTotalMovies) => {
    localStorage.setItem('totalMovies', newTotalMovies)
    set({ totalMovies: newTotalMovies })
  },

  setGameEndTime: (newTime) => {
    localStorage.setItem('gameEndTime', newTime)
    set({ gameEndTime: newTime })
  },

  resetGame: () => {
    localStorage.removeItem('guess')
    localStorage.removeItem('totalMovies')
    localStorage.removeItem('gameEndTime')
    localStorage.setItem('isGameStarted', false)
    set({ guess: 0, totalMovies: 0, gameEndTime: null, isGameStarted: false })
  },
}))

export default useGameStore
