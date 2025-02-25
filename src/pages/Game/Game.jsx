import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../contexts/GameContext'
import { useMovies } from '../../contexts/MoviesContext'
import MovieList from '../../components/MovieList/MovieList'
import { getMovies } from '../../services/movieService'

const Game = () => {
  const navigate = useNavigate()
  const { movies, setMovies } = useMovies()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    isGameStarted,
    currentGame,
    gameEndTime,
    selectedMovies,
    loadingGame,
    setLoadingGame,
    initializeNewGame,
    restoreGame,
    endGame,
  } = useGame()

  /**
   * Redirige l'utilisateur selon l'état de la partie
   */
  useEffect(() => {
    if (!isGameStarted) {
      if (currentGame.movies.length > 0) {
        navigate('/game/results')
      } else {
        navigate('/menu')
      }
    }
  }, [isGameStarted, currentGame.movies, navigate])

  /**
   * Récupère les films depuis l'API si nécessaire
   * @returns {Promise<Array>} - Liste des films récupérés ou depuis le cache
   */
  const initMovies = useCallback(async () => {
    // Si nous avons déjà des films en cache, les utiliser
    if (movies.length > 0) {
      return movies
    }

    try {
      console.log('Chargement des films...')
      setIsLoading(true)

      // Récupération des films depuis l'API
      const newMovies = await getMovies()

      // Mise à jour du contexte et du localStorage
      setMovies(newMovies)
      return newMovies
    } catch (error) {
      console.error('Erreur lors de la récupération des films:', error)
      setError('Impossible de charger les films. Veuillez réessayer.')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [movies, setMovies])

  /**
   * Initialise le jeu (nouvelle partie ou restaure une partie existante)
   */
  const initializeGame = useCallback(async () => {
    setLoadingGame(true)

    try {
      // Tente de restaurer une partie en cours si elle existe
      if (currentGame.movies.length > 0) {
        const restored = restoreGame()
        if (restored) {
          setIsLoading(false)
          setLoadingGame(false)
          return
        }
      }

      // Chargement des films et initialisation d'une nouvelle partie
      const availableMovies = await initMovies()
      if (availableMovies.length > 0) {
        initializeNewGame(availableMovies)
      } else {
        setError('Aucun film disponible pour commencer une partie.')
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du jeu:", error)
      setError("Une erreur est survenue lors de l'initialisation du jeu.")
    } finally {
      setLoadingGame(false)
    }
  }, [initMovies, initializeNewGame, restoreGame, currentGame, setLoadingGame])

  /**
   * Initialise le jeu au chargement du composant
   */
  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  /**
   * Surveille la fin du jeu et réinitialise la partie si le temps est écoulé
   */
  useEffect(() => {
    if (!gameEndTime) return

    // Calcul du temps restant pour optimiser les intervalles
    const timeRemaining = gameEndTime - Date.now()

    // Si le temps est déjà écoulé, terminer immédiatement
    if (timeRemaining <= 0) {
      endGame()
      navigate('/game/results')
      return
    }

    // Création d'un intervalle pour vérifier régulièrement le temps restant
    const gameTimer = setInterval(() => {
      if (Date.now() >= gameEndTime) {
        endGame()
        console.log('Le jeu est terminé')
        navigate('/game/results')
        clearInterval(gameTimer) // Nettoyage explicite
      }
    }, 1000) // Vérification toutes les secondes

    // Nettoyage de l'intervalle lors du démontage du composant
    return () => clearInterval(gameTimer)
  }, [gameEndTime, endGame, navigate])

  if (loadingGame || isLoading) {
    return (
      <div className="loading-container">
        <p>
          Chargement des films, cela peut prendre du temps lors de la 1ère
          partie...
        </p>
      </div>
    )
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button
          onClick={() => {
            setError(null)
            initializeGame()
          }}
          className="retry-button"
        >
          Réessayer
        </button>
      </div>
    )
  }

  // Affichage principal du jeu
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
