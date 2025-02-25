import { createContext, useContext, useState } from 'react'
import PropTypes from 'prop-types'

const GameContext = createContext()

export const GameProvider = ({ children }) => {
  const [isGameStarted, setIsGameStarted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('isGameStarted')) || false
    } catch {
      return false
    }
  })

  const [guess, setGuess] = useState(
    () => parseInt(localStorage.getItem('guess')) || 0,
  )
  const [gameEndTime, setGameEndTime] = useState(
    () => parseInt(localStorage.getItem('gameEndTime')) || null,
  )

  const [currentGame, setCurrentGame] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('currentGame')) || {
          movies: [],
          gameEndTime: null,
        }
      )
    } catch {
      return { movies: [], gameEndTime: null }
    }
  })

  // Start the game
  const startGame = () => {
    localStorage.setItem('isGameStarted', JSON.stringify(true))
    setIsGameStarted(true)
  }

  // End the game
  const endGame = () => {
    localStorage.setItem('isGameStarted', JSON.stringify(false))
    localStorage.removeItem('gameEndTime')
    setGameEndTime(null)
    setIsGameStarted(false)
  }

  // Set the number of movies found by the player
  const setGuessCount = (newGuess) => {
    localStorage.setItem('guess', newGuess)
    setGuess(newGuess)
  }

  // Set the end time of the game
  const setGameEndTimeValue = (newTime) => {
    localStorage.setItem('gameEndTime', newTime)
    setGameEndTime(newTime)
  }

  // Add bonus time
  const addBonusTime = () => {
    const newGameEndTime = (gameEndTime || Date.now()) + 2000
    localStorage.setItem('gameEndTime', newGameEndTime)
    setGameEndTime(newGameEndTime)
  }

  // Set the current game
  const setCurrentGameValue = (movies, gameEndTimeParam) => {
    const newGame = { movies, gameEndTime: gameEndTimeParam }
    localStorage.setItem('currentGame', JSON.stringify(newGame))
    setCurrentGame(newGame)
  }

  // Get a specific movie by its title
  const getMovie = (title) => {
    return currentGame.movies?.find((movie) => movie.title === title) || null
  }

  // Update a guessed movie and the score
  const updateGuess = (title, guessedBy) => {
    const updatedMovies = currentGame.movies.map((movie) =>
      movie.title === title
        ? { ...movie, guess: { isGuess: true, guessBy: guessedBy } }
        : movie,
    )

    const newGuess = guess + 1
    const updatedGame = {
      movies: updatedMovies,
      gameEndTime: currentGame.gameEndTime,
    }

    // Update state before adding bonus time
    setCurrentGame(updatedGame)
    setGuess(newGuess)

    // Add bonus time
    addBonusTime()

    // Save to localStorage
    localStorage.setItem('currentGame', JSON.stringify(updatedGame))
    localStorage.setItem('guess', newGuess)
  }

  // Reset the game
  const resetGame = () => {
    localStorage.removeItem('guess')
    localStorage.removeItem('gameEndTime')
    localStorage.removeItem('currentGame')
    localStorage.setItem('isGameStarted', JSON.stringify(false))

    setGuess(0)
    setGameEndTime(null)
    setCurrentGame({ movies: [], gameEndTime: null })
    setIsGameStarted(false)
  }

  const value = {
    isGameStarted,
    guess,
    gameEndTime,
    currentGame,
    startGame,
    endGame,
    setGuess: setGuessCount,
    setGameEndTime: setGameEndTimeValue,
    addBonusTime,
    setCurrentGame: setCurrentGameValue,
    getMovie,
    updateGuess,
    resetGame,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

GameProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
