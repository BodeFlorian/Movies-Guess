import { useState, memo } from 'react'
import PropTypes from 'prop-types'
import stringSimilarity from 'string-similarity'

import { useGame } from '../../../contexts/GameContext'
import Backdrops from './Backdrops/Backdrops'
import GuessForm from './GuessForm/GuessForm'
import MovieInfo from './MovieInfo/MovieInfo'

import './MovieCard.scss'

/**
 * Composant représentant une carte de film à deviner
 * @param {Object} props - Propriétés du composant
 * @param {string} props.title - Titre du film
 * @param {Array} props.backdrops - Images d'arrière-plan du film
 * @param {Function} props.onGuess - Fonction appelée lors d'une devinette correcte
 * @param {boolean} props.isResults - Indique si on est en mode résultats (fin de partie)
 */
const MovieCard = ({ title, backdrops, onGuess, isResults = false }) => {
  const { isGameStarted, getMovie } = useGame()
  const [input, setInput] = useState('')

  // Récupération des données du film et de son état
  const movieData = getMovie(title)
  const guessState = movieData?.guess?.isGuess || false
  const guessedBy = movieData?.guess?.guessBy || ''

  /**
   * Gère la soumission d'une proposition
   */
  const handleGuessSubmit = (e) => {
    e.preventDefault()

    // Vérification de la similarité du titre proposé avec le titre réel
    const similarityScore = stringSimilarity.compareTwoStrings(
      input.toLowerCase(),
      title.toLowerCase(),
    )

    // Si la proposition est suffisamment proche, on la considère comme correcte
    if (similarityScore > 0.65) {
      onGuess(title)
      setInput('')
    }
  }

  /**
   * Détermine si le titre doit être affiché
   */
  const shouldShowTitle = isResults || guessState

  return (
    <li className="movieCard">
      <Backdrops backdrops={backdrops} />

      {/* Formulaire (si le film n'a pas été deviné et que la partie est en cours) */}
      {!guessState && isGameStarted && !isResults ? (
        <GuessForm
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSubmit={handleGuessSubmit}
        />
      ) : (
        <MovieInfo
          title={shouldShowTitle ? title : '?????'}
          guessState={guessState}
          guessedBy={guessedBy}
          isResults={isResults}
        />
      )}
    </li>
  )
}

MovieCard.propTypes = {
  title: PropTypes.string.isRequired,
  backdrops: PropTypes.arrayOf(PropTypes.string).isRequired,
  onGuess: PropTypes.func,
  isResults: PropTypes.bool,
}

// Utilisation de memo pour éviter les re-rendus inutiles
export default memo(MovieCard)
