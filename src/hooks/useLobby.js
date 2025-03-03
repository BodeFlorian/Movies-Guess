import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import lobbyService from '../services/lobbyService'

/**
 * Hook pour gérer l'état et les actions du lobby
 * @param {string} gameId - Identifiant du lobby
 * @param {string} userId - Identifiant de l'utilisateur
 * @returns {Object} État et fonctions pour interagir avec le lobby
 */
export const useLobby = (gameId, userId) => {
  const navigate = useNavigate()
  const [lobby, setLobby] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isHost, setIsHost] = useState(false)
  const [userStatus, setUserStatus] = useState('waiting')
  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * Initialise le lobby en le créant ou en le rejoignant
   */
  const initializeLobby = useCallback(async () => {
    if (!gameId) return

    try {
      setLoading(true)
      setError(null)

      await lobbyService.createOrJoinLobby(gameId, userId)
      setIsInitialized(true)
    } catch (err) {
      console.error('Erreur lors de la récupération/création du lobby:', err)
      setError('Impossible de récupérer ou créer ce salon')
    } finally {
      setLoading(false)
    }
  }, [gameId, userId])

  // Effet pour initialiser le lobby
  useEffect(() => {
    initializeLobby()
  }, [initializeLobby])

  // Effet pour écouter les changements dans le lobby
  useEffect(() => {
    if (!gameId || !isInitialized) return

    const lobbyRef = doc(db, 'lobbies', gameId)
    const unsubscribe = onSnapshot(
      lobbyRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setLobby(data)
          setPlayers(data.players || [])
          setIsHost(data.hostId === userId)
          const currentPlayer = data.players.find((p) => p.id === userId)
          if (currentPlayer) {
            setUserStatus(currentPlayer.status)
          }
          if (data.gameStarted) {
            navigate(`/game/${gameId}`)
          }
          setLoading(false)
        } else {
          if (isInitialized) {
            setError("Ce salon n'existe plus")
            setLoading(false)
          }
        }
      },
      (err) => {
        console.error("Erreur lors de l'écoute du lobby:", err)
        setError('Problème de connexion au salon')
        setLoading(false)
      },
    )
    return () => unsubscribe()
  }, [gameId, userId, navigate, isInitialized])

  /**
   * Change le statut du joueur entre "prêt" et "en attente"
   */
  const togglePlayerStatus = async () => {
    if (!gameId || isHost) return

    const newStatus = userStatus === 'ready' ? 'waiting' : 'ready'
    try {
      await lobbyService.updatePlayerStatus(gameId, players, userId, newStatus)
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err)
      setError('Impossible de changer votre statut')
    }
  }

  /**
   * Quitte le lobby (supprime le lobby si c'est l'hôte)
   */
  const leaveLobby = async () => {
    if (!gameId) return

    try {
      await lobbyService.leaveLobby(gameId, isHost, players, userId)
      navigate('/')
    } catch (err) {
      console.error('Erreur lors de la sortie du salon:', err)
      setError('Impossible de quitter le salon')
    }
  }

  /**
   * Démarre la partie si tous les joueurs sont prêts
   */
  const startGame = async () => {
    if (!isHost || !gameId) return

    if (players.length < 2 || !areAllNonHostPlayersReady()) {
      return
    }

    try {
      await lobbyService.startGame(gameId)
      navigate(`/game/${gameId}`) // Redirection vers la page de jeu
    } catch (err) {
      console.error('Erreur lors du démarrage de la partie:', err)
      setError('Impossible de démarrer la partie')
    }
  }

  /**
   * Vérifie si tous les joueurs non-hôtes sont prêts
   */
  const areAllNonHostPlayersReady = () => {
    if (!players.length || !lobby) return false

    return players
      .filter((player) => player.id !== lobby.hostId)
      .every((player) => player.status === 'ready')
  }

  return {
    lobby,
    players,
    loading,
    error,
    isHost,
    userStatus,
    togglePlayerStatus,
    leaveLobby,
    startGame,
    areAllNonHostPlayersReady,
  }
}
