import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../../contexts/GameContext'

import MovieList from '../../components/Game/MovieList/MovieList'
import Loading from '../../components/Common/Loading/Loading'
import ErrorDisplay from '../../components/Common/ErrorDisplay/ErrorDisplay'
import GameHeader from '../../components/Game/GameHeader/GameHeader'

import useGameMode from '../../hooks/useGameMode'

/**
 * Composant principal du jeu qui gère à la fois les modes solo et multijoueur
 */
const Game = () => {
  const navigate = useNavigate()
  const { gameId } = useParams()
  const { isGameStarted, selectedMovies, loadingGame } = useGame()
  const [isReady, setIsReady] = useState(false)

  // Utilisation de notre hook principal
  const {
    isMultiplayer,
    loading,
    error,
    readyToPlay,
    remainingTime,
    gameData,
    loadMovies,
    handleGuess,
    getLoadingMessage,
    countdownStarted,
  } = useGameMode(gameId)

  // Chargement des films - une seule fois lors du montage du composant
  useEffect(() => {
    const load = async () => {
      await loadMovies()
    }
    load()
  }, [loadMovies])

  // Redirection vers l'accueil si le jeu solo n'est pas correctement initialisé
  useEffect(() => {
    if (!isMultiplayer && !loading && !isGameStarted && !loadingGame) {
      navigate('/')
    }
  }, [isMultiplayer, loading, isGameStarted, navigate, loadingGame])

  // Effet pour afficher le jeu avec un peu de délai après que tout soit prêt
  useEffect(() => {
    if (readyToPlay && !isReady) {
      // Petit délai pour la transition visuelle
      const readyTimeout = setTimeout(() => {
        setIsReady(true)
      }, 1000)

      return () => clearTimeout(readyTimeout)
    }
  }, [readyToPlay, isReady])

  // Gestion des erreurs
  if (error) {
    return <ErrorDisplay message={error} onBack={() => navigate('/')} />
  }

  // Affichage du chargement
  if (
    loading ||
    loadingGame ||
    selectedMovies.length === 0 ||
    !readyToPlay ||
    !isReady
  ) {
    return <Loading message={getLoadingMessage()} />
  }

  // Affichage du jeu
  return (
    <div className="game-container">
      <GameHeader
        remainingTime={remainingTime}
        isMultiplayer={isMultiplayer}
        multiplayerData={gameData}
      />
      <MovieList
        movies={selectedMovies}
        onGuess={handleGuess}
        isMultiplayer={isMultiplayer}
      />
    </div>
  )
}

export default Game
