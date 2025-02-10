import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './utils/style/app.scss'

import Header from './components/Header'
import Index from './pages/Index'
import Menu from './pages/Menu'
import Game from './pages/Game'
import GameResult from './pages/GameResult'
import Error from './pages/Error'

const App = () => {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/game" element={<Game />} />
          <Route path="/game/results" element={<GameResult />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
