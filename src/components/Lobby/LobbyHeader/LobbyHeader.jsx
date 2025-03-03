import PropTypes from 'prop-types'

/**
 * Affiche l'en-tête du lobby avec le titre et le code du salon
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.gameId - L'identifiant unique du salon
 */
const LobbyHeader = ({ gameId }) => {
  return (
    <>
      <h1 className="lobby-title">Salon de jeu</h1>
      <p className="lobby-id">
        Code : <span>{gameId}</span>
      </p>
    </>
  )
}

LobbyHeader.propTypes = {
  gameId: PropTypes.string.isRequired,
}

export default LobbyHeader
