import { useState } from 'react'
import PropTypes from 'prop-types'
import stringSimilarity from 'string-similarity'
import useUserStore from '../../store/userStore.js'
import useGameStore from '../../store/gameStore.js'

import './index.scss'

const MovieCard = ({ title, backdrops }) => {
  const { pseudo } = useUserStore()
  const { isGameStarted, getMovie, updateGuess } = useGameStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState('')

  const movieData = getMovie(title)
  const guessState = movieData?.guess?.isGuess || false
  const guessedBy = movieData?.guess?.guessBy || ''

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? backdrops.length - 1 : prevIndex - 1,
    )
  }

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === backdrops.length - 1 ? 0 : prevIndex + 1,
    )
  }

  const handleGuessChange = (e) => {
    setInput(e.target.value.toLowerCase())
  }

  const handleGuessSubmit = (e) => {
    e.preventDefault()

    const similarityScore = stringSimilarity.compareTwoStrings(
      input,
      title.toLowerCase(),
    )

    if (similarityScore > 0.65) {
      updateGuess(title, pseudo)
    }
  }

  return (
    <li className="movieCard">
      <div className="movieCard__pagination">
        <button
          className="movieCard__button movieCard__button--left"
          onClick={handlePrevClick}
          alt="Image précédente"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="48"
              d="M328 112 184 256l144 144"
            ></path>
          </svg>
        </button>
        <div className="movieCard__backdrops">
          {backdrops.map((backdrop, index) => (
            <img
              className={`movieCard__backdrop ${index === currentIndex ? 'movieCard__backdrop--current' : ''}`}
              key={index}
              src={`https://image.tmdb.org/t/p/w1280${backdrop}`}
              alt={`${index + 1} image backdrop`}
              loading="lazy"
            />
          ))}
        </div>
        <button
          className="movieCard__button movieCard__button--right"
          onClick={handleNextClick}
          alt="Image suivante"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="48"
              d="m184 112 144 144-144 144"
            ></path>
          </svg>
        </button>
      </div>

      {!guessState && isGameStarted ? (
        <form className="movieCard__form" onSubmit={handleGuessSubmit}>
          <input
            type="text"
            placeholder="Nom du film"
            value={input}
            onChange={handleGuessChange}
            className="movieCard__input"
          />
          <button type="submit">Submit</button>
        </form>
      ) : (
        <div
          className={`movieCard__guess ${!guessState && !isGameStarted ? 'movieCard__guess--false' : 'movieCard__guess--true'}`}
        >
          {isGameStarted || (!isGameStarted && guessState) ? (
            <p className="movieCard__user">
              Trouvé par <span>{guessedBy}</span>
            </p>
          ) : null}

          <span className="movieCard__title">{title}</span>
        </div>
      )}
    </li>
  )
}

MovieCard.propTypes = {
  title: PropTypes.string.isRequired,
  backdrops: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default MovieCard
