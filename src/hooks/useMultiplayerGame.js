import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gameService from '../services/gameService'
import { useUser } from '../contexts/UserContext'
import { useGame } from '../contexts/GameContext'
import { GAME_DURATION } from '../utils/constants'

/**
 * Hook pour gérer la logique d'une partie multijoueur
 */
const useMultiplayerGame = (gameId, movies) => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { setCurrentGame, setSelectedMovies, setGuess, startGame } = useGame()

  // États
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gameData, setGameData] = useState(null)
  const [gameInitialized, setGameInitialized] = useState(false)
  const [gameStartTime, setGameStartTime] = useState(null)
  const [playersReady, setPlayersReady] = useState({})
  const [allPlayersReady, setAllPlayersReady] = useState(false)
  const [localGuesses, setLocalGuesses] = useState({})
  const [gameStartProcessed, setGameStartProcessed] = useState(false)

  // Références
  const checkAllPlayersReadyTimeoutRef = useRef(null)
  const lastReadyStateLogRef = useRef(null)
  const checkStartedRef = useRef(false)
  const delayStartTimeout = useRef(null)
  const markPlayerReadyRef = useRef(false)

  /**
   * Vérifie si tous les joueurs sont prêts
   */
  const areAllPlayersReady = useCallback(() => {
    if (!gameData || !gameData.players) return false

    const playerIds = gameData.players.map((player) =>
      typeof player === 'string' ? player : player.id,
    )

    if (playerIds.length === 0) return false

    const allReady =
      playerIds.length > 0 &&
      playerIds.every((playerId) => playersReady[playerId] === true)

    // Log uniquement si l'état a changé significativement
    const readyStatesString = JSON.stringify(playersReady)
    const playerIdsString = JSON.stringify(playerIds)
    const logKey = `${readyStatesString}-${allReady}-${playerIdsString}`

    if (logKey !== lastReadyStateLogRef.current) {
      console.log(`État de préparation des joueurs:`, playersReady)
      console.log(`Tous les joueurs sont prêts: ${allReady ? 'Oui' : 'Non'}`)
      console.log(`Joueurs attendus: [${playerIds.join(', ')}]`)
      lastReadyStateLogRef.current = logKey
    }

    return allReady
  }, [gameData, playersReady])

  /**
   * Démarre la partie avec un délai
   */
  const startGameWithDelay = useCallback(() => {
    if (checkStartedRef.current) return

    checkStartedRef.current = true
    console.log('Démarrage automatique de la partie avec délai (3s)...')

    if (delayStartTimeout.current) {
      clearTimeout(delayStartTimeout.current)
    }

    delayStartTimeout.current = setTimeout(() => {
      gameService.startGame(gameId)
    }, 3000)
  }, [gameId])

  /**
   * Met à jour les films avec une fusion des données locales et serveur
   */
  const updateMovies = useCallback(
    (serverMovies) => {
      if (!serverMovies || !Array.isArray(serverMovies)) return serverMovies

      // Créer une copie pour les modifications
      const updatedMovies = [...serverMovies]

      // Appliquer les guesses locaux en attente
      Object.entries(localGuesses).forEach(([title, guessInfo]) => {
        const movieIndex = updatedMovies.findIndex((m) => m.title === title)
        if (movieIndex !== -1) {
          // N'appliquer que si le guess n'est pas déjà présent du serveur
          if (
            !updatedMovies[movieIndex].guess ||
            !updatedMovies[movieIndex].guess.isGuess
          ) {
            updatedMovies[movieIndex] = {
              ...updatedMovies[movieIndex],
              guess: guessInfo,
            }
          }
        }
      })

      return updatedMovies
    },
    [localGuesses],
  )

  /**
   * Surveille l'état de préparation des joueurs
   */
  useEffect(() => {
    if (gameData && gameData.players) {
      const ready = areAllPlayersReady()
      setAllPlayersReady(ready)

      if (ready && !gameStartTime && !checkStartedRef.current) {
        if (user && (user === gameData.hostId || user.id === gameData.hostId)) {
          if (checkAllPlayersReadyTimeoutRef.current) {
            clearTimeout(checkAllPlayersReadyTimeoutRef.current)
          }

          startGameWithDelay()
        }
      }
    }

    return () => {
      if (delayStartTimeout.current) {
        clearTimeout(delayStartTimeout.current)
      }
    }
  }, [areAllPlayersReady, gameData, gameStartTime, user, startGameWithDelay])

  /**
   * Initialise une partie multijoueur
   */
  const initializeGame = useCallback(async () => {
    if (!gameId || !user || !movies.length || gameInitialized) return

    try {
      setLoading(true)
      const gameExists = await gameService.checkGameExists(gameId)

      if (!gameExists) {
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
   * Informe le serveur que ce joueur est prêt
   */
  const markPlayerReady = useCallback(async () => {
    if (!gameId || !user) return

    // Empêcher les appels multiples trop rapprochés
    if (markPlayerReadyRef.current) return
    markPlayerReadyRef.current = true

    try {
      console.log(`Marquage du joueur ${user.id || user} comme prêt`)
      await gameService.setPlayerReady(gameId, user.id || user, true)
    } catch (error) {
      console.error('Erreur lors du marquage du joueur comme prêt:', error)
    } finally {
      // Ajouter un délai avant d'autoriser un nouvel appel
      setTimeout(() => {
        markPlayerReadyRef.current = false
      }, 2000)
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

      if (data.isStarted) {
        // Première fois qu'on détecte le démarrage
        if (!gameStartProcessed) {
          console.log('La partie a démarré, initialisation des états locaux')
          startGame()
          setGameStartProcessed(true)

          if (data.calculatedEndTime) {
            console.log(
              `Utilisation du temps de fin du serveur: ${new Date(data.calculatedEndTime).toLocaleTimeString()}`,
            )
            setGameStartTime(data.calculatedEndTime - GAME_DURATION)

            // Appliquer les données avec fusion
            const mergedMovies = updateMovies(data.movies)
            setSelectedMovies(mergedMovies)
            setCurrentGame(mergedMovies, data.calculatedEndTime)
          } else {
            const startTimeWithDelay = Date.now() + 3000
            setGameStartTime(startTimeWithDelay)
            const calculatedEndTime = startTimeWithDelay + GAME_DURATION
            console.log(
              `Définition du temps de fin à ${new Date(calculatedEndTime).toLocaleTimeString()}`,
            )

            // Appliquer les données avec fusion
            const mergedMovies = updateMovies(data.movies)
            setSelectedMovies(mergedMovies)
            setCurrentGame(mergedMovies, calculatedEndTime)
          }
        } else if (data.movies && data.movies.length > 0) {
          // Mise à jour normale avec fusion des données locales
          const mergedMovies = updateMovies(data.movies)
          setSelectedMovies(mergedMovies)

          // Maintenir le même temps de fin
          if (data.calculatedEndTime) {
            setCurrentGame(mergedMovies, data.calculatedEndTime)
          }
        }

        setLoading(false)
      } else if (!data.isStarted && gameStartTime) {
        setGameStartTime(null)
      } else if (data.movies && data.movies.length > 0) {
        // Mise à jour avec fusion des données locales
        const mergedMovies = updateMovies(data.movies)
        setSelectedMovies(mergedMovies)

        if (data.calculatedEndTime) {
          setCurrentGame(mergedMovies, data.calculatedEndTime)
        } else if (gameStartTime && data.isStarted) {
          const calculatedEndTime = gameStartTime + GAME_DURATION
          setCurrentGame(mergedMovies, calculatedEndTime)
        }

        setLoading(false)
      }

      // Mettre à jour le score en fonction des films devinés
      // en prenant en compte à la fois les données serveur et locales
      const updatedMovies = updateMovies(data.movies || [])
      const guessedCount = updatedMovies.filter(
        (movie) =>
          movie.guess &&
          movie.guess.isGuess &&
          movie.guess.guessBy === (user.id || user),
      ).length

      setGuess(guessedCount)

      // Nettoyage des guesses locaux dont le serveur a confirmé la prise en compte
      if (data.movies && Object.keys(localGuesses).length > 0) {
        const newLocalGuesses = { ...localGuesses }
        let changed = false

        data.movies.forEach((serverMovie) => {
          if (
            serverMovie.guess &&
            serverMovie.guess.isGuess &&
            newLocalGuesses[serverMovie.title]
          ) {
            delete newLocalGuesses[serverMovie.title]
            changed = true
          }
        })

        if (changed) {
          setLocalGuesses(newLocalGuesses)
        }
      }

      if (data.isEnded) {
        setTimeout(() => {
          navigate(`/game/results?gameId=${gameId}`)
        }, 500)
      }
    },
    [
      gameId,
      navigate,
      setCurrentGame,
      setGuess,
      setSelectedMovies,
      startGame,
      updateMovies,
      user,
      localGuesses,
      gameStartProcessed,
      gameStartTime,
    ],
  )

  /**
   * Met en place l'écoute des changements de jeu
   */
  useEffect(() => {
    if (!gameId || !user || !gameInitialized) return

    const unsubscribe = gameService.subscribeToGameChanges(
      gameId,
      handleGameChanges,
    )

    const unsubscribeReady = gameService.subscribeToPlayersReady(
      gameId,
      (readyStates) => {
        setPlayersReady(readyStates || {})
      },
    )

    return () => {
      unsubscribe()
      unsubscribeReady()

      if (checkAllPlayersReadyTimeoutRef.current) {
        clearTimeout(checkAllPlayersReadyTimeoutRef.current)
      }
      if (delayStartTimeout.current) {
        clearTimeout(delayStartTimeout.current)
      }
    }
  }, [gameId, user, gameInitialized, handleGameChanges])

  /**
   * Soumet une proposition de film (optimistic update)
   */
  const submitGuess = useCallback(
    (title) => {
      if (!gameId || !user) return

      // Application immédiate en local
      const guessInfo = { isGuess: true, guessBy: user.id || user }

      // Stocker dans l'état local pour fusion
      setLocalGuesses((prev) => ({ ...prev, [title]: guessInfo }))

      // Mise à jour locale immédiate des films
      setSelectedMovies((prev) => {
        return prev.map((movie) =>
          movie.title === title ? { ...movie, guess: guessInfo } : movie,
        )
      })

      // Mise à jour du score local
      setGuess((prev) => prev + 1)

      // Envoyer au serveur
      gameService.submitGuess(gameId, title, user.id || user)
    },
    [gameId, user, setSelectedMovies, setGuess],
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
   * Message de chargement personnalisé
   */
  const getLoadingMessage = useCallback(() => {
    if (!gameData) return 'Chargement du jeu multijoueur...'

    const totalPlayers = gameData.players ? gameData.players.length : 0
    const readyPlayers = Object.values(playersReady).filter(
      (ready) => ready === true,
    ).length

    if (gameData.isStarted && !gameStartProcessed) {
      return 'Préparation de la partie...'
    }

    if (allPlayersReady) {
      return 'Tous les joueurs sont prêts, la partie démarre...'
    }

    return `En attente des joueurs : ${readyPlayers}/${totalPlayers} prêts`
  }, [gameData, playersReady, gameStartProcessed, allPlayersReady])

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
