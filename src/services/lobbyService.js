import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../config/firebaseConfig'

/**
 * Service pour gérer les interactions avec Firestore pour le lobby
 */
const lobbyService = {
  /**
   * Crée un nouveau lobby ou rejoint un lobby existant
   * @param {string} gameId - Identifiant du lobby
   * @param {string} userId - Identifiant de l'utilisateur
   * @returns {Promise<Object>} Les informations du lobby
   */
  async createOrJoinLobby(gameId, userId) {
    const lobbyRef = doc(db, 'lobbies', gameId)
    const lobbySnap = await getDoc(lobbyRef)

    if (lobbySnap.exists()) {
      // Le lobby existe, on le rejoint
      const existingLobby = lobbySnap.data()

      // Vérifier si l'utilisateur est déjà dans le lobby
      const isPlayerInLobby = existingLobby.players.some((p) => p.id === userId)

      if (!isPlayerInLobby) {
        // Ajouter l'utilisateur au lobby existant avec statut "waiting"
        await updateDoc(lobbyRef, {
          players: arrayUnion({
            id: userId,
            name: userId,
            status: 'waiting',
          }),
        })
      }

      return lobbySnap.data()
    } else {
      // Le lobby n'existe pas, on le crée avec l'hôte déjà prêt
      const newLobby = {
        hostId: userId,
        createdAt: serverTimestamp(),
        players: [
          {
            id: userId,
            name: userId,
            status: 'ready', // L'hôte est automatiquement prêt
          },
        ],
        gameStarted: false,
        active: true,
      }

      // Créer le document dans Firestore
      await setDoc(lobbyRef, newLobby)
      return newLobby
    }
  },

  /**
   * Change le statut d'un joueur dans le lobby
   * @param {string} gameId - Identifiant du lobby
   * @param {Array} players - Liste actuelle des joueurs
   * @param {string} userId - Identifiant de l'utilisateur
   * @param {string} newStatus - Nouveau statut ('ready' ou 'waiting')
   */
  async updatePlayerStatus(gameId, players, userId, newStatus) {
    const lobbyRef = doc(db, 'lobbies', gameId)
    const updatedPlayers = players.map((player) =>
      player.id === userId ? { ...player, status: newStatus } : player,
    )

    await updateDoc(lobbyRef, {
      players: updatedPlayers,
    })
  },

  /**
   * Quitte le lobby (supprime le lobby si c'est l'hôte)
   * @param {string} gameId - Identifiant du lobby
   * @param {boolean} isHost - Indique si l'utilisateur est l'hôte
   * @param {Array} players - Liste des joueurs
   * @param {string} userId - Identifiant de l'utilisateur
   */
  async leaveLobby(gameId, isHost, players, userId) {
    const lobbyRef = doc(db, 'lobbies', gameId)

    if (isHost) {
      // Si l'hôte quitte, on supprime le lobby
      await deleteDoc(lobbyRef)
    } else {
      // Si c'est un joueur normal qui quitte
      await updateDoc(lobbyRef, {
        players: arrayRemove(players.find((p) => p.id === userId)),
      })
    }
  },

  /**
   * Démarre la partie
   * @param {string} gameId - Identifiant du lobby
   */
  async startGame(gameId) {
    const lobbyRef = doc(db, 'lobbies', gameId)
    await updateDoc(lobbyRef, {
      gameStarted: true,
    })
  },
}

export default lobbyService
