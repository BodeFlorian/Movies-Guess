import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './utils/style/app.scss'

import PrivateRoute from './components/Auth/PrivateRoute/PrivateRoute'

import Home from './pages/Home/Home'
import Menu from './pages/Menu/Menu'
import Lobby from './pages/Lobby/Lobby'
import Game from './pages/Game/Game'
import GameResult from './pages/GameResult/GameResult'
import Error from './pages/Error/Error'

import { AppProvider } from './contexts/AppProvider'

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/menu"
            element={
              <PrivateRoute>
                <Menu />
              </PrivateRoute>
            }
          />
          <Route
            path="/lobby/:gameId"
            element={
              <PrivateRoute>
                <Lobby />
              </PrivateRoute>
            }
          />
          <Route
            path="/game"
            element={
              <PrivateRoute>
                <Game />
              </PrivateRoute>
            }
          />
          <Route
            path="/game/:gameId"
            element={
              <PrivateRoute>
                <Game />
              </PrivateRoute>
            }
          />
          <Route
            path="/game/results"
            element={
              <PrivateRoute>
                <GameResult />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Error />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
