import { useState } from 'react'
import PropTypes from 'prop-types'
import stringSimilarity from 'string-similarity'
import { useUser } from '../../contexts/UserContext'
import { useGame } from '../../contexts/GameContext'

import leftArrow from '../../assets/icons/left-arrow.svg'
import rightArrow from '../../assets/icons/right-arrow.svg'
import './MovieCard.scss'

const MovieCard = ({ title, backdrops }) => {
  const { pseudo } = useUser()
  const { isGameStarted, getMovie, updateGuess } = useGame()
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
          name="prev-image"
        >
          <img src={leftArrow} alt="Left arrow" />
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
          name="next-image"
        >
          <img src={rightArrow} alt="Right arrow" />
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
          <button name="form-submit" type="submit">
            Submit
          </button>
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
