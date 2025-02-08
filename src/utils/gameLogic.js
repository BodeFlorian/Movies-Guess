import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useGameStore from '../store/gameStore'
import useMoviesStore from '../store/moviesStore'
import { getMovies, selectRandomMovies } from './movieService'

const GAME_DURATION = 3 * 60 * 1000 // 3 minutes

export const useGameLogic = () => {
  const { movies, setMovies } = useMoviesStore()
  const {
    isGameStarted,
    guess,
    setGuess,
    setTotalMovies,
    gameEndTime,
    setGameEndTime,
    resetGame,
  } = useGameStore()
  const navigate = useNavigate()
  const [selectedMovies, setSelectedMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isGameStarted) return

    const initGame = async () => {
      const savedGame = JSON.parse(localStorage.getItem('currentGame'))
      if (savedGame && Date.now() < savedGame.endTime) {
        restoreSavedGame(savedGame)
      } else {
        await startNewGame()
      }
      setLoading(false)
    }

    initGame()

    const gameTimer = setInterval(() => {
      if (gameEndTime && Date.now() >= gameEndTime) {
        endGame()
      }
    }, 1000)

    return () => clearInterval(gameTimer)
  }, [isGameStarted, gameEndTime])

  const restoreSavedGame = (savedGame) => {
    setSelectedMovies(savedGame.selectedMovies)
    setTotalMovies(savedGame.selectedMovies.length)
    setGuess(savedGame.guess)
    setGameEndTime(savedGame.endTime)
  }

  const startNewGame = async () => {
    let moviesDict = movies

    if (!moviesDict || Object.keys(moviesDict).length === 0) {
      moviesDict = await getMovies()
      setMovies(moviesDict)
    }

    const randomMovies = selectRandomMovies(moviesDict)

    const shuffled = randomMovies.map(([id, movie]) => {
      if (!movie || !movie.title || !movie.backdrops) {
        console.error('Invalid movie data:', movie)
        return { title: 'Unknown', backdrops: [], guess: false }
      }

      return {
        title: movie.title,
        backdrops: movie.backdrops,
        guess: false,
      }
    })

    const endTime = Date.now() + GAME_DURATION
    setSelectedMovies(shuffled)
    setTotalMovies(shuffled.length)
    setGuess(0)
    setGameEndTime(endTime)
    saveGameState(shuffled, endTime, 0)
  }

  const endGame = () => {
    resetGame()
    navigate('/menu')
  }

  const updateMovieGuessState = (title) => {
    setSelectedMovies((prevMovies) => {
      const updatedMovies = prevMovies.map((movie) =>
        movie.title === title ? { ...movie, guess: true } : movie,
      )
      saveGameState(updatedMovies, gameEndTime, guess + 1)
      return updatedMovies
    })
    setGuess(guess + 1)
  }

  const saveGameState = (movies, endTime, currentGuess) => {
    localStorage.setItem(
      'currentGame',
      JSON.stringify({
        selectedMovies: movies,
        endTime: endTime,
        guess: currentGuess,
      }),
    )
  }

  return {
    loading,
    gameEndTime,
    selectedMovies,
    updateMovieGuessState,
    resetGame,
  }
}

export default useGameLogic
