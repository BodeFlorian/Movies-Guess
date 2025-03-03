import { useState, useEffect, useCallback, useRef } from 'react'
import { useGame } from '../contexts/GameContext'
import { useMovies } from '../contexts/MoviesContext'
import useSoloGame from './useSoloGame'
import useMultiplayerGame from './useMultiplayerGame'
import useTimer from './useTimer'
import { getMovies } from '../services/movieService'

/**
 * Hook qui gère le mode de jeu (solo ou multijoueur)
 * @param {string|null} gameId - Identifiant de la partie (null en mode solo)
 * @returns {Object} - États et fonctions pour le mode de jeu actuel
 */
const useGameMode = (gameId) => {
  const { movies, setMovies } = useMovies()
  const { gameEndTime, isGameStarted } = useGame()

  const [isMultiplayer, setIsMultiplayer] = useState(!!gameId)
  const [remainingTime, setRemainingTime] = useState(0)
  const [moviesLoaded, setMoviesLoaded] = useState(false)
  const [moviesLoading, setMoviesLoading] = useState(true)
  const [gameInitialized, setGameInitialized] = useState(false)

  // Références pour éviter les re-rendus
  const gameEndedRef = useRef(false)
  const gameEndTimeRef = useRef(gameEndTime)
  const isGameStartedRef = useRef(isGameStarted)

  // Mettre à jour les références quand les valeurs changent
  useEffect(() => {
    gameEndTimeRef.current = gameEndTime
    isGameStartedRef.current = isGameStarted

    // Calculer le temps restant initial
    if (gameEndTime) {
      setRemainingTime(Math.max(0, gameEndTime - Date.now()))
      gameEndedRef.current = false
    }
  }, [gameEndTime, isGameStarted])

  // Initialisation des hooks de jeu
  const solo = useSoloGame(movies)
  const multiplayer = useMultiplayerGame(gameId, movies)

  // Sélection du mode en fonction de la présence d'un gameId
  useEffect(() => {
    setIsMultiplayer(!!gameId)
  }, [gameId])

  /**
   * Termine la partie en fonction du mode de jeu
   */
  const endGameAction = useCallback(() => {
    // Vérifier si la partie n'a pas déjà été terminée
    if (gameEndedRef.current) return

    gameEndedRef.current = true

    if (isMultiplayer) {
      multiplayer.endGame()
    } else {
      solo.endGame()
    }
  }, [isMultiplayer, multiplayer, solo])

  /**
   * Fonction appelée à chaque tick du timer
   */
  const onTimerTick = useCallback(
    (now) => {
      if (!gameEndTimeRef.current) return

      // Calculer le temps restant
      const timeLeft = Math.max(0, gameEndTimeRef.current - now)
      setRemainingTime(timeLeft)

      // Vérifier si le temps est écoulé
      if (timeLeft === 0 && isGameStartedRef.current && !gameEndedRef.current) {
        const gameStartTime = isMultiplayer
          ? multiplayer.gameStartTime
          : solo.gameStartTime

        // Vérifier que le jeu a démarré depuis au moins 3 secondes
        const minGameDuration = 3000
        if (gameStartTime && now - gameStartTime > minGameDuration) {
          endGameAction()
        }
      }
    },
    [
      endGameAction,
      isMultiplayer,
      multiplayer.gameStartTime,
      solo.gameStartTime,
    ],
  )

  // Utiliser notre hook de timer
  useTimer(onTimerTick)

  /**
   * Charge les films depuis l'API si nécessaire
   */
  const loadMovies = useCallback(async () => {
    // Éviter de charger les films plusieurs fois
    if (moviesLoaded) return { error: null }

    try {
      setMoviesLoading(true)

      if (movies.length === 0) {
        console.log("Chargement des films depuis l'API...")
        const fetchedMovies = await getMovies()
        setMovies(fetchedMovies)
        console.log(`${fetchedMovies.length} films chargés`)
      } else {
        console.log(`${movies.length} films déjà chargés`)
      }

      setMoviesLoaded(true)
      setMoviesLoading(false)

      // Marquer le joueur comme prêt en mode multijoueur
      if (isMultiplayer) {
        console.log('Marquage du joueur comme prêt après chargement des films')
        await multiplayer.markPlayerReady()
      }

      return { error: null }
    } catch (error) {
      console.error('Erreur lors du chargement des films:', error)
      setMoviesLoading(false)
      return {
        error: 'Impossible de charger les films. Veuillez rafraîchir la page.',
      }
    }
  }, [isMultiplayer, movies.length, multiplayer, setMovies, moviesLoaded])

  /**
   * Initialise le jeu en fonction du mode une fois les films chargés
   */
  useEffect(() => {
    if (!moviesLoaded || gameInitialized) return

    if (isMultiplayer) {
      console.log(
        'Initialisation du jeu multijoueur après chargement des films',
      )
      multiplayer.initializeGame()
      setGameInitialized(true)
    }
    // L'initialisation du mode solo est gérée directement dans useSoloGame
  }, [isMultiplayer, moviesLoaded, multiplayer, gameInitialized])

  /**
   * Gère une proposition de film
   */
  const handleGuess = useCallback(
    (title) => {
      if (isMultiplayer) {
        multiplayer.submitGuess(title)
      } else {
        solo.submitGuess(title)
      }
    },
    [isMultiplayer, multiplayer, solo],
  )

  // Agréger les états et fonctions à retourner
  const loading = isMultiplayer
    ? multiplayer.loading || !moviesLoaded
    : solo.loading || !moviesLoaded

  const error = isMultiplayer ? multiplayer.error : solo.error

  // Message de chargement personnalisé
  const getLoadingMessage = useCallback(() => {
    if (moviesLoading) return 'Chargement des films...'
    return isMultiplayer
      ? multiplayer.getLoadingMessage()
      : 'Initialisation de la partie...'
  }, [isMultiplayer, moviesLoading, multiplayer])

  // Déterminer si on est prêt à afficher le jeu
  const readyToPlay = isMultiplayer
    ? !loading &&
      multiplayer.allPlayersReady &&
      multiplayer.gameData &&
      multiplayer.gameData.isStarted
    : !loading

  return {
    isMultiplayer,
    loading,
    error,
    readyToPlay,
    remainingTime,
    gameData: isMultiplayer ? multiplayer.gameData : null,
    loadMovies,
    handleGuess,
    getLoadingMessage,
  }
}

export default useGameMode
