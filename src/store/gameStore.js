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
      return (
        JSON.parse(localStorage.getItem('currentGame')) || {
          movies: [],
          gameEndTime: null,
        }
      )
    } catch {
      return { movies: [], gameEndTime: null }
    }
  })(),

  // Démarrage du jeu
  startGame: () => {
    localStorage.setItem('isGameStarted', JSON.stringify(true))
    set({ isGameStarted: true })
  },

  // Fin du jeu
  endGame: () => {
    localStorage.setItem('isGameStarted', JSON.stringify(false))
    localStorage.removeItem('gameEndTime')
    set({ gameEndTime: null, isGameStarted: false })
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
  setCurrentGame: (movies, gameEndTime) => {
    const newGame = { movies, gameEndTime }
    localStorage.setItem('currentGame', JSON.stringify(newGame))
    set({ currentGame: newGame })
  },

  // Récupère un film spécifique par son titre
  getMovie: (title) => {
    return (
      get().currentGame.movies?.find((movie) => movie.title === title) || null
    )
  },

  // Mise à jour d'un film deviné et du score
  updateGuess: (title, guessedBy) => {
    set((state) => {
      const updatedMovies = state.currentGame.movies.map((movie) =>
        movie.title === title
          ? { ...movie, guess: { isGuess: true, guessBy: guessedBy } }
          : movie,
      )

      const newGuess = state.guess + 1
      const updatedGame = {
        movies: updatedMovies,
        gameEndTime: state.currentGame.gameEndTime,
      }

      // Sauvegarde dans localStorage
      localStorage.setItem('currentGame', JSON.stringify(updatedGame))
      localStorage.setItem('guess', newGuess)

      return { currentGame: updatedGame, guess: newGuess }
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
      currentGame: { movies: [], gameEndTime: null },
      isGameStarted: false,
    })
  },
}))

export default useGameStore
