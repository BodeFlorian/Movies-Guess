import React, { useState } from 'react'
import PropTypes from 'prop-types'

import './index.scss'

const MovieCard = ({ title, backdrops }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

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

  return (
    <li className="movieCard">
      <div className="movieCard__pagination">
        <button
          className="movieCard__button movieCard__button--left"
          onClick={handlePrevClick}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            className="w-8 h-8 text-white opacity-75 group-hover:opacity-100 transition-opacity"
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
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            className="w-8 h-8 text-white opacity-75 group-hover:opacity-100 transition-opacity"
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

      <input
        className="movieCard__input"
        type="text"
        placeholder="Nom du film"
      />
    </li>
  )
}

MovieCard.propTypes = {
  title: PropTypes.string.isRequired,
  backdrops: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default MovieCard
