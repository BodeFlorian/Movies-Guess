import { useParams } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { useLobby } from '../../hooks/useLobby'

import LobbyHeader from '../../components/Lobby/LobbyHeader/LobbyHeader'
import PlayersList from '../../components/Lobby/PlayersList/PlayersList'
import LobbyActions from '../../components/Lobby/LobbyActions/LobbyActions'
import Loading from '../../components/Common/Loading/Loading'
import ErrorDisplay from '../../components/Common/ErrorDisplay/ErrorDisplay'

import './Lobby.scss'

const Lobby = () => {
  const { gameId } = useParams()
  const { user } = useUser()

  const {
    lobby,
    players,
    loading,
    error,
    isHost,
    userStatus,
    togglePlayerStatus,
    leaveLobby,
    startGame,
    areAllNonHostPlayersReady,
  } = useLobby(gameId, user)

  if (loading) return <Loading message="Chargement du salon..." />
  if (error) return <ErrorDisplay message={error} />
  if (!lobby) return <Loading message="Chargement du salon..." />

  // Vérifier si la partie peut être démarrée
  const canStartGame = areAllNonHostPlayersReady() && players.length >= 2

  return (
    <div className="lobby">
      <LobbyHeader gameId={gameId} />
      <PlayersList
        players={players}
        hostId={lobby.hostId}
        currentUserId={user}
      />
      <LobbyActions
        isHost={isHost}
        userStatus={userStatus}
        canStartGame={canStartGame}
        onToggleStatus={togglePlayerStatus}
        onLeaveLobby={leaveLobby}
        onStartGame={startGame}
      />
    </div>
  )
}

export default Lobby
