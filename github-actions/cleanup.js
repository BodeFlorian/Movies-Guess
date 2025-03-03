/* eslint-env node */
/* global process */

// Script pour nettoyer les parties et lobbys terminés ou inactifs
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialisation de Firebase Admin avec les identifiants du compte de service
async function initializeFirebase() {
  // Les identifiants seront chargés à partir de GitHub Secrets
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

  initializeApp({
    credential: cert(serviceAccount),
  })

  return getFirestore()
}

/**
 * Nettoie toutes les ressources associées à une partie
 */
async function cleanupGameResources(db, gameId) {
  try {
    console.log(`Nettoyage des ressources pour la partie ${gameId}...`)

    // 1. Supprimer la sous-collection playersReady
    const playersReadyRef = db.collection(`games/${gameId}/playersReady`)
    const playersReadySnapshot = await playersReadyRef.get()

    const deletePromises = []
    playersReadySnapshot.forEach((doc) => {
      deletePromises.push(doc.ref.delete())
    })

    await Promise.all(deletePromises)
    console.log(`Sous-collection playersReady pour ${gameId} supprimée`)

    // 2. Supprimer le document de la partie
    await db.collection('games').doc(gameId).delete()
    console.log(`Partie ${gameId} supprimée`)

    // 3. Supprimer le lobby associé s'il existe
    const lobbyRef = db.collection('lobbies').doc(gameId)
    const lobbySnap = await lobbyRef.get()

    if (lobbySnap.exists) {
      await lobbyRef.delete()
      console.log(`Lobby ${gameId} supprimé`)
    }

    return true
  } catch (error) {
    console.error(
      `Erreur lors du nettoyage des ressources pour la partie ${gameId}:`,
      error,
    )
    return false
  }
}

/**
 * Fonction principale qui nettoie les parties terminées et lobbys abandonnés
 */
async function cleanupAbandonedGames() {
  try {
    console.log('Démarrage du nettoyage...')
    const db = await initializeFirebase()
    const now = Date.now()
    const MAX_IDLE_TIME = 2 * 60 * 60 * 1000 // 2 heures en millisecondes

    // Compteurs pour le reporting
    let endedGamesCount = 0
    let inactiveGamesCount = 0
    let inactiveLobbiesCount = 0

    // 1. Nettoyage des parties terminées ou inactives
    const gamesSnapshot = await db.collection('games').get()
    console.log(`Vérification de ${gamesSnapshot.size} parties...`)

    const gameCleanupPromises = []

    gamesSnapshot.forEach((doc) => {
      const gameData = doc.data()
      const gameId = doc.id

      // Cas 1: Partie explicitement terminée (isEnded == true)
      if (gameData.isEnded) {
        console.log(`Partie terminée trouvée: ${gameId}`)
        gameCleanupPromises.push(cleanupGameResources(db, gameId))
        endedGamesCount++
      }
      // Cas 2: Partie inactive depuis trop longtemps
      else if (gameData.createdAt) {
        const lastUpdateTime = gameData.updatedAt
          ? gameData.updatedAt.toMillis()
          : gameData.createdAt.toMillis
            ? gameData.createdAt.toMillis()
            : gameData.createdAt

        if (now - lastUpdateTime > MAX_IDLE_TIME) {
          console.log(
            `Partie inactive trouvée: ${gameId} (inactive depuis ${Math.floor((now - lastUpdateTime) / (60 * 1000))} minutes)`,
          )
          gameCleanupPromises.push(cleanupGameResources(db, gameId))
          inactiveGamesCount++
        }
      }
    })

    // 2. Nettoyage des lobbys sans parties associées ou inactifs
    const lobbiesSnapshot = await db.collection('lobbies').get()
    console.log(`Vérification de ${lobbiesSnapshot.size} lobbys...`)

    const lobbyCleanupPromises = []

    for (const doc of lobbiesSnapshot.docs) {
      const lobbyData = doc.data()
      const lobbyId = doc.id

      // Vérifier si le lobby a une partie associée
      const gameDoc = await db.collection('games').doc(lobbyId).get()

      // Si la partie n'existe pas ou si le lobby est inactif depuis trop longtemps
      if (
        !gameDoc.exists ||
        (lobbyData.createdAt &&
          now -
            (lobbyData.createdAt.toMillis
              ? lobbyData.createdAt.toMillis()
              : lobbyData.createdAt) >
            MAX_IDLE_TIME)
      ) {
        console.log(`Lobby à nettoyer: ${lobbyId}`)
        lobbyCleanupPromises.push(
          db.collection('lobbies').doc(lobbyId).delete(),
        )
        inactiveLobbiesCount++
      }
    }

    // Attendre que toutes les opérations de nettoyage soient terminées
    await Promise.all([...gameCleanupPromises, ...lobbyCleanupPromises])

    // Résumé du nettoyage
    console.log('=== RÉSUMÉ DU NETTOYAGE ===')
    console.log(`Parties terminées supprimées: ${endedGamesCount}`)
    console.log(`Parties inactives supprimées: ${inactiveGamesCount}`)
    console.log(`Lobbys inactifs supprimés: ${inactiveLobbiesCount}`)
    console.log('Nettoyage terminé avec succès!')
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error)
    process.exit(1)
  }
}

// Exécuter la fonction principale
cleanupAbandonedGames()
  .then(() => {
    console.log('Script terminé avec succès')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erreur dans le script principal:', error)
    process.exit(1)
  })
