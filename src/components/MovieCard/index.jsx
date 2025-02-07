import React from 'react'
import PropTypes from 'prop-types'

const MovieCard = ({ title, backdrops }) => {
  return (
    <div>
      {backdrops.map((backdrop, index) => (
        <img
          key={index}
          src={`https://image.tmdb.org/t/p/w500${backdrop}`}
          alt={title}
        />
      ))}
    </div>
  )
}

MovieCard.propTypes = {
  title: PropTypes.string.isRequired,
  backdrops: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default MovieCard
