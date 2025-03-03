import { useState } from 'react'
import PropTypes from 'prop-types'

import leftArrow from '../../../../assets/icons/left-arrow.svg'
import rightArrow from '../../../../assets/icons/right-arrow.svg'
import './Backdrops.scss'

const Backdrops = ({ backdrops }) => {
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
  )
}

Backdrops.propTypes = {
  backdrops: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default Backdrops
