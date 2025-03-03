import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  Timestamp,
  serverTimestamp,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { GAME_DURATION, TOTAL_FILMS } from '../utils/constants'
import { selectRandomMovies } from './movieService'

/**
 * Service pour gérer les opérations liées aux parties de jeu
 */
const gameService = {
  /**
   * Vérifie si une partie existe
   * @param {string} gameId - Identifiant de la partie
   * @returns {Promise<boolean>} - True si la partie existe
   */
  async checkGameExists(gameId) {
    try {
      const gameRef = doc(db, 'games', gameId)
      const gameSnap = await getDoc(gameRef)
      return gameSnap.exists()
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'existence du jeu:",
        error,
      )
      return false
    }
  },

  /**
   * Récupère les données d'un lobby
   * @param {string} lobbyId - Identifiant du lobby
   * @returns {Promise<Object|null>} - Données du lobby ou null
   */
  async getLobbyData(lobbyId) {
    try {
      const lobbyRef = doc(db, 'lobbies', lobbyId)
      const lobbySnap = await getDoc(lobbyRef)

      if (!lobbySnap.exists()) {
        throw new Error("Le lobby n'existe pas")
      }

      return lobbySnap.data()
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des données du lobby:',
        error,
      )
      return null
    }
  },

  /**
   * Initialise une nouvelle partie multijoueur
   * @param {string} gameId - Identifiant de la partie
   * @param {Array} availableMovies - Liste des films disponibles
   * @param {string} hostId - Identifiant de l'hôte
   */
  async initializeMultiplayerGame(gameId, availableMovies, hostId) {
    try {
      const gameRef = doc(db, 'games', gameId)

      // Vérifier si une partie existe déjà pour ce gameId
      const gameSnap = await getDoc(gameRef)
      if (gameSnap.exists()) {
        console.log(
          'Une partie existe déjà pour ce gameId, utilisation des données existantes',
        )
        return gameSnap.data()
      }

      // Récupérer les informations du lobby
      const lobbyData = await this.getLobbyData(gameId)
      if (!lobbyData) {
        throw new Error('Impossible de récupérer les données du lobby')
      }

      // Créer les données de jeu
      const gameData = this.createGameData(availableMovies, lobbyData, hostId)

      // Enregistrer la partie dans Firestore
      await setDoc(gameRef, gameData)

      return gameData
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation de la partie multijoueur:",
        error,
      )
      throw error
    }
  },

  /**
   * Crée les données d'une nouvelle partie
   * @param {Array} availableMovies - Films disponibles
   * @param {Object} lobbyData - Données du lobby
   * @param {string} hostId - ID du créateur de la partie
   * @returns {Object} - Données de jeu formatées
   */
  createGameData(availableMovies, lobbyData, hostId) {
    // Sélectionner des films aléatoires
    const randomMovies = selectRandomMovies(availableMovies, TOTAL_FILMS).map(
      (movie) => ({ ...movie, guess: { isGuess: false, guessBy: null } }),
    )

    // Calculer le temps de fin (maintenant + durée de jeu)
    const endTime = Date.now() + GAME_DURATION

    // Créer l'objet de jeu
    return {
      movies: randomMovies,
      players: lobbyData.players || [],
      hostId,
      startTime: serverTimestamp(),
      endTime,
      isEnded: false,
      isStarted: false,
      guesses: [],
      createdAt: serverTimestamp(),
    }
  },

  /**
   * S'abonne aux changements d'une partie
   * @param {string} gameId - Identifiant de la partie
   * @param {Function} callback - Fonction à appeler lors des changements
   * @returns {Function} - Fonction pour se désabonner
   */
  subscribeToGameChanges(gameId, callback) {
    const gameRef = doc(db, 'games', gameId)

    return onSnapshot(
      gameRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data())
        } else {
          console.error("La partie n'existe pas ou a été supprimée")
          callback(null)
        }
      },
      (error) => {
        console.error('Erreur lors du suivi de la partie:', error)
        callback(null)
      },
    )
  },

  /**
   * Soumet une proposition de film
   * @param {string} gameId - Identifiant de la partie
   * @param {string} movieTitle - Titre du film proposé
   * @param {string} userId - Identifiant de l'utilisateur
   */
  async submitGuess(gameId, movieTitle, userId) {
    try {
      const gameRef = doc(db, 'games', gameId)
      const gameSnap = await getDoc(gameRef)

      if (!gameSnap.exists()) {
        console.error("La partie n'existe pas")
        return false
      }

      const gameData = gameSnap.data()

      // Vérifier si le film a déjà été deviné
      const movieIndex = gameData.movies.findIndex(
        (movie) => movie.title === movieTitle,
      )

      if (
        movieIndex === -1 ||
        this.isMovieAlreadyGuessed(gameData, movieIndex)
      ) {
        return false
      }

      const updates = this.prepareGuessUpdate(gameData, movieIndex, userId)
      await updateDoc(gameRef, updates)

      return true
    } catch (error) {
      console.error("Erreur lors de la soumission d'une proposition:", error)
      return false
    }
  },

  /**
   * Vérifie si un film a déjà été deviné
   * @param {Object} gameData - Données du jeu
   * @param {number} movieIndex - Index du film
   * @returns {boolean} - True si déjà deviné
   */
  isMovieAlreadyGuessed(gameData, movieIndex) {
    if (movieIndex === -1) {
      console.error("Le film n'existe pas dans la liste")
      return true
    }

    if (
      gameData.movies[movieIndex].guess &&
      gameData.movies[movieIndex].guess.isGuess
    ) {
      console.log('Ce film a déjà été deviné')
      return true
    }

    return false
  },

  /**
   * Prépare les données pour la mise à jour de la devinette
   * @param {Object} gameData - Données du jeu
   * @param {number} movieIndex - Index du film
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} - Données à mettre à jour
   */
  prepareGuessUpdate(gameData, movieIndex, userId) {
    // Mettre à jour les films
    const updatedMovies = [...gameData.movies]
    updatedMovies[movieIndex] = {
      ...updatedMovies[movieIndex],
      guess: { isGuess: true, guessBy: userId },
    }

    // Ajouter du temps bonus (2 secondes)
    const bonusTime = 2000
    const newEndTime = gameData.endTime + bonusTime

    return {
      movies: updatedMovies,
      endTime: newEndTime,
      guesses: arrayUnion({
        movieTitle: updatedMovies[movieIndex].title,
        userId,
        timestamp: Timestamp.now(),
      }),
    }
  },

  /**
   * Termine une partie multijoueur
   * @param {string} gameId - Identifiant de la partie
   */
  async endGame(gameId) {
    try {
      const gameRef = doc(db, 'games', gameId)
      const gameSnap = await getDoc(gameRef)

      if (!gameSnap.exists()) {
        console.error("La partie n'existe pas")
        return false
      }

      await updateDoc(gameRef, {
        isEnded: true,
        endedAt: serverTimestamp(),
      })

      return true
    } catch (error) {
      console.error('Erreur lors de la fin de la partie:', error)
      return false
    }
  },

  /**
   * Nettoie les ressources de la partie et du lobby après la fin d'une partie
   * @param {string} gameId - Identifiant de la partie/lobby
   * @returns {Promise<boolean>} - True si le nettoyage a réussi
   */
  async cleanupGameResources(gameId) {
    try {
      console.log(`Nettoyage des ressources pour la partie ${gameId}...`)

      // 1. Supprimer la sous-collection playersReady
      const playersReadyRef = collection(db, 'games', gameId, 'playersReady')
      const playersReadySnapshot = await getDocs(playersReadyRef)

      const deletePromises = []
      playersReadySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref))
      })

      await Promise.all(deletePromises)
      console.log(`Sous-collection playersReady supprimée`)

      // 2. Supprimer le document de la partie
      const gameRef = doc(db, 'games', gameId)
      await deleteDoc(gameRef)
      console.log(`Document de partie supprimé`)

      // 3. Supprimer le lobby associé
      const lobbyRef = doc(db, 'lobbies', gameId)
      await deleteDoc(lobbyRef)
      console.log(`Lobby supprimé`)

      return true
    } catch (error) {
      console.error('Erreur lors du nettoyage des ressources:', error)
      return false
    }
  },

  /**
   * Définit l'état de préparation d'un joueur
   * @param {string} gameId - Identifiant de la partie
   * @param {string} playerId - Identifiant du joueur
   * @param {boolean} isReady - État de préparation
   */
  async setPlayerReady(gameId, playerId, isReady) {
    try {
      console.log(
        `Tentative de marquer ${playerId} comme ${isReady ? 'prêt' : 'pas prêt'}`,
      )
      const playerReadyRef = doc(db, 'games', gameId, 'playersReady', playerId)
      await setDoc(playerReadyRef, {
        ready: isReady,
        timestamp: serverTimestamp(),
      })

      console.log(
        `Joueur ${playerId} est maintenant ${isReady ? 'prêt' : 'pas prêt'}`,
      )

      // Vérifier si tous les joueurs sont prêts après cette mise à jour
      const allReady = await this.checkAllPlayersReady(gameId)

      console.log(
        `Après la mise à jour, tous les joueurs sont prêts: ${allReady}`,
      )

      return true
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de l'état de préparation:",
        error,
      )
      return false
    }
  },

  /**
   * Vérifie si tous les joueurs sont prêts et met à jour l'état du jeu si nécessaire
   * @param {string} gameId - Identifiant de la partie
   */
  async checkAllPlayersReady(gameId) {
    try {
      // Récupérer les données du jeu
      const gameRef = doc(db, 'games', gameId)
      const gameSnap = await getDoc(gameRef)

      if (!gameSnap.exists()) {
        console.error("La partie n'existe pas")
        return false
      }

      const gameData = gameSnap.data()

      // Récupérer tous les états de préparation des joueurs
      const playersReadyRef = collection(db, 'games', gameId, 'playersReady')
      const playersReadySnap = await getDocs(playersReadyRef)

      const readyStates = {}
      playersReadySnap.forEach((doc) => {
        readyStates[doc.id] = doc.data().ready
      })

      // Récupérer la liste des joueurs
      const players = gameData.players || []
      const playerIds = players.map((player) =>
        typeof player === 'string' ? player : player.id,
      )

      // Vérifier si tous les joueurs sont prêts
      const allReady =
        playerIds.length > 0 &&
        playerIds.every((playerId) => readyStates[playerId] === true)

      console.log(
        `Vérification: tous les joueurs sont prêts? ${allReady ? 'Oui' : 'Non'}`,
      )
      console.log(`Joueurs: ${playerIds.join(', ')}`)
      console.log(`États de préparation: ${JSON.stringify(readyStates)}`)

      return allReady
    } catch (error) {
      console.error('Erreur lors de la vérification des joueurs prêts:', error)
      return false
    }
  },

  /**
   * S'abonne aux changements de l'état de préparation des joueurs
   * @param {string} gameId - Identifiant de la partie
   * @param {Function} callback - Fonction à appeler lors des changements
   * @returns {Function} - Fonction pour se désabonner
   */
  subscribeToPlayersReady(gameId, callback) {
    const playersReadyRef = collection(db, 'games', gameId, 'playersReady')

    return onSnapshot(
      playersReadyRef,
      (snapshot) => {
        const readyStates = {}
        snapshot.forEach((doc) => {
          readyStates[doc.id] = doc.data().ready
        })
        console.log(
          `Mise à jour des états de préparation: ${JSON.stringify(readyStates)}`,
        )
        callback(readyStates)
      },
      (error) => {
        console.error(
          "Erreur lors du suivi de l'état de préparation des joueurs:",
          error,
        )
        callback({})
      },
    )
  },

  /**
   * Démarre une partie
   * @param {string} gameId - Identifiant de la partie
   * @returns {Promise<boolean>} - True si le démarrage a réussi
   */
  async startGame(gameId) {
    try {
      const gameRef = doc(db, 'games', gameId)

      // Vérifier d'abord si tous les joueurs sont prêts
      const allPlayersReady = await this.checkAllPlayersReady(gameId)

      if (!allPlayersReady) {
        console.log(
          'Impossible de démarrer le jeu - tous les joueurs ne sont pas prêts',
        )
        return false
      }

      console.log('Démarrage de la partie...')
      await updateDoc(gameRef, {
        isStarted: true,
        startTime: serverTimestamp(),
      })

      console.log('Le jeu a été démarré avec succès')
      return true
    } catch (error) {
      console.error('Erreur lors du démarrage du jeu:', error)
      return false
    }
  },

  /**
   * Récupère les résultats d'une partie terminée
   * @param {string} gameId - Identifiant de la partie
   * @returns {Promise<Object|null>} - Données de la partie ou null
   */
  async getGameResults(gameId) {
    try {
      const gameRef = doc(db, 'games', gameId)
      const gameSnap = await getDoc(gameRef)

      if (!gameSnap.exists()) {
        return null
      }

      return gameSnap.data()
    } catch (error) {
      console.error('Erreur lors de la récupération des résultats:', error)
      return null
    }
  },

  /**
   * Trouve les parties actives d'un joueur
   * @param {string} playerId - Identifiant du joueur
   * @returns {Promise<Array>} - Liste des parties actives
   */
  async findActiveGamesForPlayer(playerId) {
    try {
      const gamesRef = collection(db, 'games')
      const activeGames = []

      // Get all games (this isn't optimal, but without specific indices it's the simplest approach)
      const gamesSnapshot = await getDocs(gamesRef)

      gamesSnapshot.forEach((gameDoc) => {
        const gameData = gameDoc.data()

        // Check if game is active (started but not ended)
        if (gameData.isStarted && !gameData.isEnded) {
          // Check if player is in this game
          const isPlayerInGame = gameData.players.some(
            (player) =>
              (typeof player === 'string' && player === playerId) ||
              (player.id && player.id === playerId),
          )

          if (isPlayerInGame) {
            activeGames.push({
              id: gameDoc.id,
              ...gameData,
            })
          }
        }
      })

      return activeGames
    } catch (error) {
      console.error('Erreur lors de la recherche des parties actives:', error)
      return []
    }
  },
}

export default gameService
