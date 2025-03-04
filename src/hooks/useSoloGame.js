import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useUser } from '../contexts/UserContext'

/**
 * Hook pour gérer la logique d'une partie solo
 * @param {Array} movies - Liste des films disponibles
 * @returns {Object} - États et fonctions pour le mode solo
 */
const useSoloGame = (movies) => {
  const navigate = useNavigate()
  const { user } = useUser()
  const {
    restoreGame,
    initializeNewGame,
    updateGuess,
    startGame,
    endGame: contextEndGame,
    setLoadingGame,
  } = useGame()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gameStartTime, setGameStartTime] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const redirectedRef = useRef(false)
  const initializationTimeoutRef = useRef(null)

  // Référence à la liste de films pour éviter de l'inclure dans les dépendances
  const moviesRef = useRef(movies)

  // Mettre à jour la référence quand movies change
  useEffect(() => {
    moviesRef.current = movies
  }, [movies])

  /**
   * Initialise ou restaure le jeu en mode solo
   */
  const initializeGame = useCallback(() => {
    if (moviesRef.current.length === 0 || initialized) return

    try {
      // Tenter de restaurer une partie existante
      const restored = restoreGame()

      // Si aucune partie n'a été restaurée, en initialiser une nouvelle
      if (!restored && moviesRef.current.length > 0) {
        initializeNewGame(moviesRef.current)
        startGame()

        // Définir le temps de démarrage avec un délai pour permettre une transition visuelle
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current)
        }

        initializationTimeoutRef.current = setTimeout(() => {
          console.log('Partie solo: initialisation terminée, démarrage du jeu')
          setGameStartTime(Date.now())
        }, 3000)
      } else if (restored) {
        // Si une partie a été restaurée, définir le moment du démarrage avec un petit délai
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current)
        }

        initializationTimeoutRef.current = setTimeout(() => {
          console.log('Partie solo restaurée: démarrage du jeu')
          setGameStartTime(Date.now())
        }, 1000)
      }

      // Mettre à jour les états de chargement
      setLoadingGame(false)
      setLoading(false)
      setInitialized(true)
    } catch (err) {
      console.error("Erreur lors de l'initialisation du jeu solo:", err)
      setError("Une erreur est survenue lors de l'initialisation du jeu.")
      setLoading(false)
      setInitialized(true)
    }
  }, [restoreGame, initializeNewGame, setLoadingGame, startGame, initialized])

  /**
   * Déclenche l'initialisation du jeu une seule fois
   */
  useEffect(() => {
    if (!initialized && movies.length > 0) {
      initializeGame()
    }

    // Nettoyer le timeout lors du démontage
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current)
      }
    }
  }, [initialized, movies.length, initializeGame])

  /**
   * Soumet une proposition de film
   * @param {string} title - Titre du film deviné
   */
  const submitGuess = useCallback(
    (title) => {
      updateGuess(title, user.id || user)
    },
    [updateGuess, user],
  )

  /**
   * Termine la partie et redirige vers la page des résultats
   */
  const endGame = useCallback(() => {
    // Éviter les redirections multiples
    if (redirectedRef.current) return
    redirectedRef.current = true

    console.log('Fin de partie solo, redirection vers les résultats...')
    contextEndGame()

    // S'assurer que la redirection s'effectue correctement
    try {
      // Utiliser un léger délai pour s'assurer que les états sont mis à jour
      setTimeout(() => {
        navigate('/game/results')
      }, 100)
    } catch (err) {
      console.error('Erreur lors de la redirection vers les résultats:', err)
      // Tentative de redirection forcée en cas d'erreur
      window.location.href = '/game/results'
    }
  }, [contextEndGame, navigate])

  return {
    loading,
    error,
    gameStartTime,
    initializeGame,
    submitGuess,
    endGame,
  }
}

export default useSoloGame
