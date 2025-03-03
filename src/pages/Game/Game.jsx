import { useEffect } from 'react'
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
  } = useGameMode(gameId)

  // Chargement des films - une seule fois lors du montage du composant
  useEffect(() => {
    const load = async () => {
      await loadMovies()
    }
    load()
  }, []) // Intentionnellement vide pour ne s'exécuter qu'une fois

  // Redirection vers l'accueil si le jeu solo n'est pas correctement initialisé
  useEffect(() => {
    if (!isMultiplayer && !loading && !isGameStarted && !loadingGame) {
      navigate('/')
    }
  }, [isMultiplayer, loading, isGameStarted, navigate, loadingGame])

  // Gestion des erreurs
  if (error) {
    return <ErrorDisplay message={error} onBack={() => navigate('/')} />
  }

  // Affichage du chargement
  if (loading || loadingGame || selectedMovies.length === 0 || !readyToPlay) {
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
