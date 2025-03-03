import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import gameService from '../services/gameService'
import { useUser } from '../contexts/UserContext'
import { useGame } from '../contexts/GameContext'

/**
 * Hook pour gérer la logique d'une partie multijoueur
 * @param {string} gameId - Identifiant de la partie
 * @param {Array} movies - Liste des films disponibles
 * @returns {Object} - États et fonctions pour le mode multijoueur
 */
const useMultiplayerGame = (gameId, movies) => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { setCurrentGame, setSelectedMovies, setGuess, startGame } = useGame()

  // États locaux pour la gestion du jeu multijoueur
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gameData, setGameData] = useState(null)
  const [gameInitialized, setGameInitialized] = useState(false)
  const [gameStartTime, setGameStartTime] = useState(null)
  const [playersReady, setPlayersReady] = useState({})
  const [allPlayersReady, setAllPlayersReady] = useState(false)

  /**
   * Vérifie si tous les joueurs ont chargé les films et sont prêts
   */
  const areAllPlayersReady = useCallback(() => {
    if (!gameData || !gameData.players) return false

    // Récupérer la liste des joueurs depuis les données multijoueur
    const playerIds = gameData.players.map((player) =>
      typeof player === 'string' ? player : player.id,
    )

    if (playerIds.length === 0) return false

    // Vérifier que chaque joueur est marqué comme prêt
    const allReady = playerIds.every(
      (playerId) => playersReady[playerId] === true,
    )

    // Log pour déboguer l'état des joueurs
    console.log(`État de préparation des joueurs:`, playersReady)
    console.log(`Tous les joueurs sont prêts: ${allReady}`)
    console.log(`Joueurs attendus: [${playerIds.join(', ')}]`)

    return allReady
  }, [gameData, playersReady])

  /**
   * Surveille l'état de préparation de tous les joueurs
   */
  useEffect(() => {
    if (gameData && gameData.players) {
      const ready = areAllPlayersReady()
      setAllPlayersReady(ready)

      // Si tous les joueurs sont prêts et que l'utilisateur est l'hôte,
      // démarrer automatiquement la partie
      if (ready && !gameStartTime && !gameData.isStarted) {
        if (user && (user === gameData.hostId || user.id === gameData.hostId)) {
          console.log(
            'Démarrage automatique de la partie car tous les joueurs sont prêts',
          )
          gameService.startGame(gameId)
        }
      }
    }
  }, [areAllPlayersReady, gameData, gameId, gameStartTime, user])

  /**
   * Initialise une partie multijoueur
   */
  const initializeGame = useCallback(async () => {
    if (!gameId || !user || !movies.length || gameInitialized) return

    try {
      setLoading(true)
      // Vérifier si la partie existe déjà
      const gameExists = await gameService.checkGameExists(gameId)

      if (!gameExists) {
        // Initialiser une nouvelle partie si elle n'existe pas
        await gameService.initializeMultiplayerGame(
          gameId,
          movies,
          user.id || user,
        )
      }

      setGameInitialized(true)
    } catch (err) {
      console.error("Erreur lors de l'initialisation du jeu multijoueur:", err)
      setError(
        "Une erreur est survenue lors de l'initialisation du jeu en mode multijoueur.",
      )
      setLoading(false)
    }
  }, [gameId, user, movies, gameInitialized])

  /**
   * Informe le serveur que ce joueur a chargé les films
   */
  const markPlayerReady = useCallback(async () => {
    if (!gameId || !user) return

    try {
      console.log(`Marquage du joueur ${user.id || user} comme prêt`)
      await gameService.setPlayerReady(gameId, user.id || user, true)
    } catch (error) {
      console.error('Erreur lors du marquage du joueur comme prêt:', error)
    }
  }, [gameId, user])

  /**
   * Gestionnaire des changements de jeu reçus de Firebase
   */
  const handleGameChanges = useCallback(
    (data) => {
      if (!data) {
        setError("Cette partie n'existe pas ou a été terminée")
        setLoading(false)
        return
      }

      setGameData(data)

      // Si la partie est déjà démarrée et que nous n'avons pas encore notre gameStartTime
      if (data.isStarted && !gameStartTime) {
        console.log('La partie a démarré, initialisation des états locaux')
        startGame()
        setGameStartTime(Date.now())
      }

      // Mettre à jour les films et le temps
      if (data.movies && data.movies.length > 0) {
        setSelectedMovies(data.movies)
        setCurrentGame(data.movies, data.endTime)
        setLoading(false)
      }

      // Mettre à jour le score
      const guessedCount = data.movies
        ? data.movies.filter((movie) => movie.guess && movie.guess.isGuess)
            .length
        : 0
      setGuess(guessedCount)

      // Vérifier si la partie est terminée
      if (data.isEnded) {
        setTimeout(() => {
          navigate(`/game/results?gameId=${gameId}`)
        }, 500)
      }
    },
    [
      gameId,
      gameStartTime,
      navigate,
      setCurrentGame,
      setGuess,
      setSelectedMovies,
      startGame,
    ],
  )

  /**
   * Met en place l'écoute des changements de jeu
   */
  useEffect(() => {
    if (!gameId || !user || !gameInitialized) return

    // S'abonner aux changements de la partie
    const unsubscribe = gameService.subscribeToGameChanges(
      gameId,
      handleGameChanges,
    )

    // S'abonner aux changements de l'état de préparation des joueurs
    const unsubscribeReady = gameService.subscribeToPlayersReady(
      gameId,
      (readyStates) => {
        setPlayersReady(readyStates || {})
      },
    )

    return () => {
      unsubscribe()
      unsubscribeReady()
    }
  }, [gameId, user, gameInitialized, handleGameChanges])

  /**
   * Soumet une proposition de film
   * @param {string} title - Titre du film deviné
   */
  const submitGuess = useCallback(
    (title) => {
      if (gameId && user) {
        gameService.submitGuess(gameId, title, user.id || user)
      }
    },
    [gameId, user],
  )

  /**
   * Termine la partie
   */
  const endGame = useCallback(() => {
    if (gameId) {
      gameService.endGame(gameId)
    }
  }, [gameId])

  /**
   * Calcule un message de chargement personnalisé
   */
  const getLoadingMessage = useCallback(() => {
    if (!gameData) return 'Chargement du jeu multijoueur...'

    const totalPlayers = gameData.players ? gameData.players.length : 0
    const readyPlayers = Object.values(playersReady).filter(
      (ready) => ready === true,
    ).length

    return `En attente des joueurs : ${readyPlayers}/${totalPlayers} prêts`
  }, [gameData, playersReady])

  return {
    loading,
    error,
    gameData,
    allPlayersReady,
    gameStartTime,
    initializeGame,
    markPlayerReady,
    submitGuess,
    endGame,
    getLoadingMessage,
  }
}

export default useMultiplayerGame
