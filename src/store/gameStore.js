import { create } from 'zustand'

const useGameStore = create((set, get) => ({
  isGameStarted: (() => {
    try {
      return JSON.parse(localStorage.getItem('isGameStarted')) || false
    } catch {
      return false
    }
  })(),

  guess: parseInt(localStorage.getItem('guess')) || 0,
  gameEndTime: parseInt(localStorage.getItem('gameEndTime')) || null,

  currentGame: (() => {
    try {
      return JSON.parse(localStorage.getItem('currentGame')) || []
    } catch {
      return []
    }
  })(),

  // Démarrage du jeu
  startGame: () => {
    localStorage.setItem('isGameStarted', JSON.stringify(true))
    set({ isGameStarted: true })
  },

  // Nombre de films trouvés par le joueur
  setGuess: (newGuess) => {
    localStorage.setItem('guess', newGuess)
    set({ guess: newGuess })
  },

  // Définition de la date et heure de fin du jeu
  setGameEndTime: (newTime) => {
    localStorage.setItem('gameEndTime', newTime)
    set({ gameEndTime: newTime })
  },

  // Définition du jeu en cours
  setCurrentGame: (newGame) => {
    if (Array.isArray(newGame)) {
      localStorage.setItem('currentGame', JSON.stringify(newGame))
      set({ currentGame: newGame })
    } else {
      console.error(
        'setCurrentGame: les données doivent être un tableau valide',
      )
    }
  },

  // Récupère un film spécifique par son titre
  getMovie: (title) => {
    return get().currentGame.find((movie) => movie.title === title) || null
  },

  // Mise à jour d'un film deviné et du score
  updateGuess: (title) => {
    set((state) => {
      const updatedMovies = state.currentGame.map((movie) =>
        movie.title === title ? { ...movie, isGuess: true } : movie,
      )

      const newGuess = state.guess + 1

      // Sauvegarde dans localStorage
      localStorage.setItem('currentGame', JSON.stringify(updatedMovies))
      localStorage.setItem('guess', newGuess)

      return { currentGame: updatedMovies, guess: newGuess }
    })
  },

  // Réinitialisation du jeu
  resetGame: () => {
    localStorage.removeItem('guess')
    localStorage.removeItem('gameEndTime')
    localStorage.removeItem('currentGame')
    localStorage.setItem('isGameStarted', JSON.stringify(false))

    set({
      guess: 0,
      gameEndTime: null,
      currentGame: [],
      isGameStarted: false,
    })
  },
}))

export default useGameStore
