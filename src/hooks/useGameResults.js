import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useUser } from '../contexts/UserContext'
import gameService from '../services/gameService'

/**
 * Hook pour gérer les résultats de jeu
 * @param {boolean} isMultiplayer - Indique si on est en mode multijoueur
 * @param {string|null} gameId - Identifiant de la partie (null en mode solo)
 * @returns {Object} - États et fonctions pour la page de résultats
 */
const useGameResults = (isMultiplayer, gameId) => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { guess, currentGame, resetGame, isGameStarted } = useGame()

  // États locaux - IMPORTANT: L'ordre des hooks doit être le même à chaque rendu
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [multiplayerData, setMultiplayerData] = useState(null)
  const [score, setScore] = useState(0)
  const [authorized, setAuthorized] = useState(false)

  // Références pour le suivi d'état - IMPORTANT: Déclarer tous les useRef avant les useCallback
  const cleanupDoneRef = useRef(false)
  const accessCheckedRef = useRef(false)
  const redirectedRef = useRef(false)

  /**
   * Vérifie si l'utilisateur a des parties multijoueur actives
   * Si c'est le cas, le redirige vers cette partie
   */
  const checkActiveMultiplayerGames = useCallback(async () => {
    if (!user || redirectedRef.current) return false

    try {
      // Trouver les parties actives pour ce joueur
      const activeGames = await gameService.findActiveGamesForPlayer(user)

      // S'il y a des parties actives, rediriger vers la première
      if (activeGames.length > 0) {
        const activeGameId = activeGames[0].id
        console.log(
          `Redirection vers partie multijoueur active: ${activeGameId}`,
        )
        redirectedRef.current = true
        navigate(`/game/${activeGameId}`)
        return true
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de parties actives:', error)
    }

    return false
  }, [user, navigate])

  /**
   * Ferme la modale pour afficher les réponses
   */
  const handleViewAnswers = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  /**
   * Réinitialise le jeu et navigue vers le menu principal
   * Nettoie également les ressources Firebase en mode multijoueur
   */
  const handleBackToMenu = useCallback(() => {
    // Nettoyer les ressources Firebase en mode multijoueur avant de quitter
    if (isMultiplayer && gameId && !cleanupDoneRef.current && authorized) {
      console.log(
        'Nettoyage des ressources Firebase avant de retourner au menu',
      )
      gameService.cleanupGameResources(gameId)
      cleanupDoneRef.current = true
    }

    resetGame()
    navigate('/menu')
  }, [navigate, resetGame, isMultiplayer, gameId, authorized])

  /**
   * Vérifie si l'utilisateur est autorisé à voir les résultats
   */
  useEffect(() => {
    const checkAccess = async () => {
      if (accessCheckedRef.current) return
      accessCheckedRef.current = true

      try {
        // Mode multijoueur
        if (isMultiplayer && gameId) {
          const gameData = await gameService.getGameResults(gameId)

          // La partie n'existe pas
          if (!gameData) {
            setError("Cette partie n'existe pas ou a été supprimée")
            setLoading(false)
            return
          }

          // Vérifier si la partie est terminée
          if (!gameData.isEnded) {
            console.log(
              "Tentative d'accès aux résultats d'une partie multijoueur en cours.",
            )

            // Vérifier si l'utilisateur est un participant de la partie
            const isParticipant = gameData.players.some(
              (player) =>
                (typeof player === 'string' && player === user) ||
                (player.id && player.id === user),
            )

            if (!isParticipant) {
              setError("Vous n'êtes pas autorisé à accéder à cette partie.")
              setLoading(false)
              return
            }

            // Rediriger vers la partie en cours en préservant le gameId
            console.log(
              `Redirection vers la partie multijoueur en cours: /game/${gameId}`,
            )
            redirectedRef.current = true
            navigate(`/game/${gameId}`)
            return
          }

          // La partie est terminée, l'accès est autorisé
          setAuthorized(true)
        }
        // Mode solo ou URL sans gameId
        else {
          // Tentative de détecter une partie multijoueur active pour le joueur
          const redirected = await checkActiveMultiplayerGames()

          // Si redirigé vers une partie multijoueur, ne pas continuer
          if (redirected) {
            return
          }

          // Sinon, vérifier si c'est une partie solo en cours
          if (isGameStarted) {
            console.log(
              "Tentative d'accès aux résultats d'une partie solo en cours.",
            )
            redirectedRef.current = true
            navigate('/game')
            return
          }

          // Vérifier s'il y a des données de partie à afficher
          if (
            !currentGame ||
            !currentGame.movies ||
            currentGame.movies.length === 0
          ) {
            console.log('Pas de données de partie à afficher.')
            redirectedRef.current = true
            navigate('/')
            return
          }

          setAuthorized(true)
        }
      } catch (err) {
        console.error("Erreur lors de la vérification d'accès:", err)
        setError("Une erreur est survenue lors de la vérification d'accès.")
        setLoading(false)
      }
    }

    checkAccess()
  }, [
    gameId,
    isMultiplayer,
    navigate,
    currentGame,
    isGameStarted,
    user,
    checkActiveMultiplayerGames,
  ])

  /**
   * Charge les données des résultats en fonction du mode de jeu
   */
  useEffect(() => {
    // Ne charger les résultats que si l'accès est autorisé
    if (!authorized) return

    const loadResults = async () => {
      try {
        setLoading(true)

        if (isMultiplayer && gameId) {
          // Charger les résultats multijoueur depuis Firebase
          const gameData = await gameService.getGameResults(gameId)

          if (!gameData) {
            setError("Cette partie n'existe pas ou a été supprimée")
            setLoading(false)
            return
          }

          setMultiplayerData(gameData)
          setMovies(gameData.movies)

          // Calculer le score (films devinés)
          const gameScore = gameData.movies.filter(
            (movie) => movie.guess && movie.guess.isGuess,
          ).length
          setScore(gameScore)
        } else {
          // Mode solo - récupérer les données du contexte
          if (currentGame.movies && currentGame.movies.length > 0) {
            setMovies(currentGame.movies)
            setScore(guess)
          } else {
            // Rediriger vers l'accueil si pas de données de partie
            redirectedRef.current = true
            navigate('/')
            return
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Erreur lors de la récupération des résultats:', err)
        setError('Impossible de charger les résultats de la partie.')
        setLoading(false)
      }
    }

    loadResults()

    // Nettoyage des ressources quand le composant est démonté
    return () => {
      // Nettoyer les ressources Firebase en mode multijoueur
      if (isMultiplayer && gameId && !cleanupDoneRef.current && authorized) {
        console.log(
          'Nettoyage des ressources Firebase au démontage du composant GameResult',
        )
        gameService.cleanupGameResources(gameId)
        cleanupDoneRef.current = true
      }
    }
  }, [currentGame, gameId, guess, isMultiplayer, navigate, authorized])

  // Nombre de joueurs en mode multijoueur
  const playerCount = multiplayerData?.players
    ? typeof multiplayerData.players === 'object'
      ? Object.keys(multiplayerData.players).length
      : multiplayerData.players.length
    : 1

  return {
    loading,
    error,
    score,
    movies,
    playerCount,
    isModalOpen,
    setIsModalOpen,
    handleViewAnswers,
    handleBackToMenu,
    authorized,
  }
}

export default useGameResults
