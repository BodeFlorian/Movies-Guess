import PropTypes from 'prop-types'
import './GuessForm.scss'

/**
 * Formulaire permettant de soumettre une proposition de titre de film
 * @param {Object} props - Propriétés du composant
 * @param {string} props.value - Valeur actuelle du champ input
 * @param {Function} props.onChange - Fonction appelée lors d'un changement
 * @param {Function} props.onSubmit - Fonction appelée lors de la soumission
 */
const GuessForm = ({ value, onChange, onSubmit }) => {
  return (
    <form className="movieCard__form" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Nom du film"
        value={value}
        onChange={onChange}
        className="movieCard__input"
        autoComplete="off"
      />
      <button name="form-submit" type="submit" className="movieCard__submit">
        Valider
      </button>
    </form>
  )
}

GuessForm.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default GuessForm
