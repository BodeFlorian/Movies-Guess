import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import GameTimer from '../../components/GameTimer'
import MovieList from '../../components/MovieList'
import useUserStore from '../../store/userStore'
import useMoviesStore from '../../store/moviesStore'
import useGameStore from '../../store/gameStore'
import { getMovies, selectRandomMovies } from '../../services/movieService'
import { GAME_DURATION, TOTAL_FILMS } from '../../utils/constants'

const Game = () => {
  const navigate = useNavigate()
  const { pseudo } = useUserStore()
  const { movies, setMovies } = useMoviesStore()
  const {
    isGameStarted,
    gameEndTime,
    setGameEndTime,
    resetGame,
    setCurrentGame,
    currentGame,
  } = useGameStore()

  const [selectedMovies, setSelectedMovies] = useState([])
  const [loading, setLoading] = useState(true)

  /**
   * Redirige l'utilisateur vers la page d'accueil s'il n'a pas de pseudo défini.
   */
  useEffect(() => {
    if (!pseudo) {
      navigate('/')
    }
  }, [pseudo, navigate])

  /**
   * Récupère la liste des films depuis l'API et les stocke dans le store.
   * Cette fonction est appelée uniquement si la liste des films est vide.
   */
  const initMovies = useCallback(async () => {
    if (movies.length === 0) {
      try {
        const newMovies = await getMovies()
        setMovies(newMovies)
      } catch (error) {
        console.error('Erreur lors de la récupération des films:', error)
      }
    }
  }, [movies.length, setMovies])

  /**
   * Initialise une nouvelle partie en sélectionnant un ensemble aléatoire de films.
   * Définit également l'heure de fin du jeu en fonction de la durée définie.
   */
  const initGame = useCallback(() => {
    if (movies.length === 0) {
      console.error('Aucun film disponible pour initialiser le jeu')
      return
    }

    // Sélectionne aléatoirement un ensemble de films et initialise leur état
    const randomMovies = selectRandomMovies(movies, TOTAL_FILMS).map(
      (movie) => ({ ...movie, isGuess: false, guessBy: '' }),
    )
    setSelectedMovies(randomMovies)

    // Définit l'heure de fin du jeu
    const newGameEndTime = Date.now() + GAME_DURATION
    setGameEndTime(newGameEndTime)
  }, [movies, setGameEndTime])

  /**
   * Sauvegarde la partie en cours dans le store.
   */
  const saveGame = useCallback(() => {
    setCurrentGame(selectedMovies)
    console.log('Sauvegarde réussie')
  }, [selectedMovies, setCurrentGame])

  /**
   * Restaure une partie en cours si des données existent dans le store.
   */
  const restoreGame = useCallback(() => {
    if (currentGame.length > 0) {
      setSelectedMovies(currentGame)
      console.log('Les données du jeu ont été restaurées')
    }
  }, [currentGame])

  /**
   * Gère le cycle de vie du jeu :
   * - Restaure une partie en cours si nécessaire.
   * - Charge les films si aucun n'est disponible.
   * - Initialise un nouveau jeu si aucune partie n'est en cours.
   * - Sauvegarde le jeu après l'initialisation.
   */
  useEffect(() => {
    if (!isGameStarted) return

    if (currentGame.length > 0 && selectedMovies.length === 0) {
      restoreGame()
      setLoading(false)
      return
    }

    if (movies.length === 0) {
      console.log('Chargement des films...')
      initMovies()
    }

    if (
      movies.length > 0 &&
      selectedMovies.length === 0 &&
      currentGame.length === 0
    ) {
      console.log('Chargement des films...')
      initGame()
    }

    if (
      movies.length > 0 &&
      selectedMovies.length > 0 &&
      currentGame.length === 0
    ) {
      saveGame()
      console.log('Démarrage du jeu...')
      setLoading(false)
    }
  }, [
    isGameStarted,
    movies.length,
    selectedMovies.length,
    currentGame.length,
    initMovies,
    initGame,
    saveGame,
    restoreGame,
  ])

  /**
   * Surveille la fin du jeu et réinitialise la partie si le temps est écoulé.
   */
  useEffect(() => {
    if (!gameEndTime) return

    const gameTimer = setInterval(() => {
      if (Date.now() >= gameEndTime) {
        resetGame()
        setSelectedMovies([])
        console.log('Le jeu est terminé')
        navigate('/menu')
      }
    }, 1000)

    return () => clearInterval(gameTimer)
  }, [gameEndTime, resetGame, navigate])

  // Empêche le rendu si l'utilisateur est redirigé
  if (!pseudo) return null

  // Affiche un message de chargement pendant l'initialisation
  if (loading) return <p>Chargement...</p>

  return (
    <div className="game-container">
      <GameTimer gameEndTime={gameEndTime} />
      <MovieList movies={selectedMovies} />
    </div>
  )
}

export default Game
