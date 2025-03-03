import PropTypes from 'prop-types'

/**
 * Affiche les boutons d'action disponibles selon le rôle et le statut du joueur
 * @param {Object} props - Les propriétés du composant
 * @param {boolean} props.isHost - Indique si l'utilisateur est l'hôte
 * @param {string} props.userStatus - Statut actuel de l'utilisateur ('ready' ou 'waiting')
 * @param {boolean} props.canStartGame - Indique si la partie peut être démarrée
 * @param {Function} props.onToggleStatus - Fonction pour changer le statut du joueur
 * @param {Function} props.onLeaveLobby - Fonction pour quitter le salon
 * @param {Function} props.onStartGame - Fonction pour démarrer la partie
 */
const LobbyActions = ({
  isHost,
  userStatus,
  canStartGame,
  onToggleStatus,
  onLeaveLobby,
  onStartGame,
}) => {
  return (
    <div className="lobby__actions">
      {isHost ? (
        <button
          onClick={onStartGame}
          className="lobby__button lobby__button--start"
          disabled={!canStartGame}
        >
          Démarrer la partie
        </button>
      ) : (
        userStatus === 'ready' && (
          <p className="lobby__waiting-host">
            En attente que l&apos;hôte démarre la partie
          </p>
        )
      )}

      {!isHost && (
        <button
          onClick={onToggleStatus}
          className={`lobby__button lobby__button--${
            userStatus === 'ready' ? 'waiting' : 'ready'
          }`}
        >
          {userStatus === 'ready' ? 'Annuler' : 'Je suis prêt'}
        </button>
      )}

      {((!isHost && userStatus === 'waiting') || isHost) && (
        <button
          onClick={onLeaveLobby}
          className="lobby__button lobby__button--leave"
        >
          Quitter le salon
        </button>
      )}
    </div>
  )
}

LobbyActions.propTypes = {
  isHost: PropTypes.bool.isRequired,
  userStatus: PropTypes.oneOf(['ready', 'waiting']).isRequired,
  canStartGame: PropTypes.bool.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onLeaveLobby: PropTypes.func.isRequired,
  onStartGame: PropTypes.func.isRequired,
}

export default LobbyActions
