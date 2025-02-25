import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieList from '../../components/MovieList/MovieList'
import { useUser } from '../../contexts/UserContext'
import { useMovies } from '../../contexts/MoviesContext'
import { useGame } from '../../contexts/GameContext'
import { getMovies, selectRandomMovies } from '../../services/movieService'
import { GAME_DURATION, TOTAL_FILMS } from '../../utils/constants'

const Game = () => {
  const navigate = useNavigate()
  const { pseudo } = useUser()
  const { movies, setMovies } = useMovies()
  const {
    isGameStarted,
    gameEndTime,
    setGameEndTime,
    setCurrentGame,
    currentGame,
    endGame,
  } = useGame()

  const [selectedMovies, setSelectedMovies] = useState([])
  const [loading, setLoading] = useState(true)

  /** Redirige l'utilisateur vers la page d'accueil s'il n'a pas de pseudo défini */
  useEffect(() => {
    if (!pseudo) {
      navigate('/')
    }
  }, [pseudo, navigate])

  /** Redirige l'utilisateur selon l'état de la partie */
  useEffect(() => {
    if (!isGameStarted) {
      if (currentGame.movies.length > 0) {
        navigate('/game/results')
      } else {
        navigate('/menu')
      }
    }
  }, [isGameStarted, currentGame.movies, navigate])

  /** Récupère les films depuis l'API si nécessaire */
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

  /** Initialise une nouvelle partie */
  const initGame = useCallback(() => {
    if (movies.length === 0) {
      console.error('Aucun film disponible pour initialiser le jeu')
      return
    }

    const randomMovies = selectRandomMovies(movies, TOTAL_FILMS).map(
      (movie) => ({ ...movie, guess: { isGuess: false, guessBy: null } }),
    )
    setSelectedMovies(randomMovies)

    setGameEndTime(Date.now() + GAME_DURATION)
  }, [movies, setGameEndTime])

  /** Sauvegarde la partie en cours */
  const saveGame = useCallback(() => {
    setCurrentGame(selectedMovies, gameEndTime)
    console.log('Sauvegarde réussie')
  }, [selectedMovies, setCurrentGame, gameEndTime])

  /** Restaure une partie en cours si des données existent */
  const restoreGame = useCallback(() => {
    if (currentGame?.movies?.length > 0) {
      setSelectedMovies(currentGame.movies)
      setGameEndTime(currentGame.gameEndTime)
      console.log('Les données du jeu ont été restaurées')
    }
  }, [currentGame, setGameEndTime])

  /** Gestion du cycle de vie du jeu */
  useEffect(() => {
    const initializeGame = async () => {
      if (currentGame.movies.length > 0 && selectedMovies.length === 0) {
        restoreGame()
        setLoading(false)
        return
      }

      if (movies.length === 0) {
        console.log('Chargement des films...')
        await initMovies()
      }

      if (
        movies.length > 0 &&
        selectedMovies.length === 0 &&
        currentGame.movies.length === 0
      ) {
        initGame()
      }
    }

    initializeGame()
  }, [
    movies.length,
    selectedMovies.length,
    currentGame.movies,
    initMovies,
    initGame,
    restoreGame,
  ])

  /** Appelle saveGame() uniquement quand selectedMovies est mis à jour */
  useEffect(() => {
    if (selectedMovies.length > 0 && currentGame.movies.length === 0) {
      saveGame()
      console.log('Démarrage du jeu...')
      setLoading(false)
    }
  }, [selectedMovies, saveGame, currentGame.movies])

  /** Surveille la fin du jeu et réinitialise la partie si le temps est écoulé */
  useEffect(() => {
    if (!gameEndTime) return

    const gameTimer = setInterval(() => {
      if (Date.now() >= gameEndTime) {
        endGame()
        console.log('Le jeu est terminé')
        navigate('/game/results')
      }
    }, 1000)

    return () => clearInterval(gameTimer)
  }, [gameEndTime, endGame, navigate])

  // Empêche le rendu si l'utilisateur est redirigé
  if (!pseudo) return null

  // Affiche un message de chargement pendant l'initialisation
  if (loading)
    return (
      <p>
        Chargement des films, cela peut prendre du temps lors de la 1ère
        partie...
      </p>
    )

  return (
    <div
      className="game-container"
      style={{ margin: '2rem 0', paddingBottom: '2rem' }}
    >
      <MovieList movies={selectedMovies} />
    </div>
  )
}

export default Game
