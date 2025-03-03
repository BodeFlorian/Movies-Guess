import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'
import PropTypes from 'prop-types'
import { selectRandomMovies } from '../services/movieService'
import { GAME_DURATION, TOTAL_FILMS } from '../utils/constants'

const GameContext = createContext()

// Fonctions utilitaires pour la gestion du localStorage
const getStoredItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    )
    return true
  } catch (error) {
    console.error(
      `Erreur lors de l'enregistrement dans localStorage (${key}):`,
      error,
    )
    return false
  }
}

const removeStoredItem = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(
      `Erreur lors de la suppression depuis localStorage (${key}):`,
      error,
    )
    return false
  }
}

export const GameProvider = ({ children }) => {
  const [isGameStarted, setIsGameStarted] = useState(() =>
    getStoredItem('isGameStarted', false),
  )
  const [guess, setGuess] = useState(() =>
    parseInt(localStorage.getItem('guess') || '0'),
  )
  const [currentGame, setCurrentGame] = useState(() =>
    getStoredItem('currentGame', { movies: [], gameEndTime: null }),
  )

  const [loadingGame, setLoadingGame] = useState(true)
  const [selectedMovies, setSelectedMovies] = useState([])

  /**
   * Démarre le jeu
   */
  const startGame = useCallback(() => {
    setStoredItem('isGameStarted', true)
    setIsGameStarted(true)
  }, [])

  /**
   * Termine le jeu
   */
  const endGame = useCallback(() => {
    setStoredItem('isGameStarted', false)
    setCurrentGame({ ...currentGame, gameEndTime: null })
    setIsGameStarted(false)
  }, [currentGame])

  /**
   * Définit le nombre de films trouvés par le joueur
   * @param {number} newGuess - Nouveau nombre de films trouvés
   */
  const setGuessCount = useCallback((newGuess) => {
    localStorage.setItem('guess', newGuess)
    setGuess(newGuess)
  }, [])

  /**
   * Définit la partie actuelle
   * @param {Array} movies - Films de la partie
   * @param {number} gameEndTimeParam - Temps de fin de la partie
   */
  const setCurrentGameValue = useCallback((movies, gameEndTimeParam) => {
    const newGame = { movies, gameEndTime: gameEndTimeParam }
    setStoredItem('currentGame', newGame)
    setCurrentGame(newGame)
  }, [])

  /**
   * Récupère un film spécifique par son titre
   * @param {string} title - Titre du film
   * @returns {Object|null} - Le film trouvé ou null
   */
  const getMovie = useCallback(
    (title) => {
      return currentGame.movies?.find((movie) => movie.title === title) || null
    },
    [currentGame.movies],
  )

  /**
   * Met à jour un film deviné et le score
   * @param {string} title - Titre du film
   * @param {string} guessedBy - Joueur qui a deviné
   */
  const updateGuess = useCallback(
    (title, guessedBy) => {
      const updatedMovies = currentGame.movies.map((movie) =>
        movie.title === title
          ? { ...movie, guess: { isGuess: true, guessBy: guessedBy } }
          : movie,
      )

      const newGuess = guess + 1
      const updatedGame = {
        movies: updatedMovies,
        gameEndTime: currentGame.gameEndTime,
      }

      // Mise à jour de l'état et du localStorage avant d'ajouter du temps bonus
      setCurrentGame(updatedGame)
      setGuess(newGuess)
      setStoredItem('currentGame', updatedGame)
      localStorage.setItem('guess', newGuess)
    },
    [currentGame, guess],
  )

  /**
   * Réinitialise complètement le jeu
   */
  const resetGame = useCallback(() => {
    // Suppression des données du localStorage
    const keysToRemove = ['guess', 'currentGame']
    keysToRemove.forEach((key) => removeStoredItem(key))
    setStoredItem('isGameStarted', false)

    // Réinitialisation des états
    setGuess(0)
    setCurrentGame({ movies: [], gameEndTime: null })
    setIsGameStarted(false)
    setSelectedMovies([])
  }, [])

  /**
   * Initialise une nouvelle partie avec des films aléatoires
   * @param {Array} availableMovies - Films disponibles pour la sélection
   * @returns {Array} - Films sélectionnés pour la partie, ou null en cas d'erreur
   */
  const initializeNewGame = useCallback(
    (availableMovies) => {
      if (!availableMovies || availableMovies.length === 0) {
        console.error('Aucun film disponible pour initialiser le jeu')
        return null
      }

      // Sélection des films aléatoires pour la partie
      const randomMovies = selectRandomMovies(availableMovies, TOTAL_FILMS).map(
        (movie) => ({ ...movie, guess: { isGuess: false, guessBy: null } }),
      )

      // Calcul du temps de fin de partie
      const newEndTime = Date.now() + GAME_DURATION

      // Mise à jour des états
      setSelectedMovies(randomMovies)
      setCurrentGameValue(randomMovies, newEndTime)

      return randomMovies
    },
    [setCurrentGameValue],
  )

  /**
   * Restaure une partie en cours si des données existent
   * @returns {boolean} - true si la partie a été restaurée, false sinon
   */
  const restoreGame = useCallback(() => {
    if (currentGame?.movies?.length > 0) {
      setSelectedMovies(currentGame.movies)
      console.log('Les données du jeu ont été restaurées')
      return true
    }
    return false
  }, [currentGame])

  // Utilisation de useMemo pour éviter la recréation de l'objet de contexte à chaque rendu
  const contextValue = useMemo(
    () => ({
      // États
      isGameStarted,
      guess,
      gameEndTime: currentGame.gameEndTime,
      currentGame,
      loadingGame,
      selectedMovies,

      // Actions principales du jeu
      startGame,
      endGame,
      resetGame,
      updateGuess,

      // Gestion des films
      getMovie,

      // Initialisations
      initializeNewGame,
      restoreGame,

      // Setters
      setGuess: setGuessCount,
      setCurrentGame: setCurrentGameValue,
      setSelectedMovies,
      setLoadingGame,
    }),
    [
      isGameStarted,
      guess,
      currentGame,
      loadingGame,
      selectedMovies,
      startGame,
      endGame,
      resetGame,
      updateGuess,
      getMovie,
      initializeNewGame,
      restoreGame,
      setGuessCount,
      setCurrentGameValue,
    ],
  )

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame doit être utilisé à l'intérieur d'un GameProvider")
  }
  return context
}

GameProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
