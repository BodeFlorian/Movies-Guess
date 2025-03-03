import PropTypes from 'prop-types'

/**
 * Affiche la liste des joueurs présents dans le lobby
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.players - Liste des joueurs
 * @param {string} props.hostId - ID de l'hôte du salon
 * @param {string} props.currentUserId - ID de l'utilisateur actuel
 */
const PlayersList = ({ players, hostId, currentUserId }) => {
  return (
    <div className="lobby__players">
      <p className="lobby__players-title">
        Joueurs (<span className="lobby__players-number">{players.length}</span>
        )
      </p>
      <ul className="lobby__players-list">
        {players.map((player) => (
          <li key={player.id} className="lobby__player">
            <span
              className={`lobby__player-name ${
                player.id === hostId ? 'lobby__player-host' : ''
              }`}
            >
              {player.name} {player.id === currentUserId ? '(Vous)' : ''}
            </span>
            <span
              className={`lobby__player-status lobby__player-status--${player.status}`}
            >
              {player.status === 'ready' ? 'Prêt' : 'En attente'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

PlayersList.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['ready', 'waiting']).isRequired,
    }),
  ).isRequired,
  hostId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
}

export default PlayersList
