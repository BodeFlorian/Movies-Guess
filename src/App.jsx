import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'

import './utils/style/app.scss'

import Header from './components/Header'
import Index from './pages/Index'
import Menu from './pages/Menu'
import Game from './pages/Game'
import GameResult from './pages/GameResult'
import Error from './pages/Error'

const Layout = ({ children }) => {
  const location = useLocation()

  return (
    <>
      {location.pathname !== '/' && location.pathname !== '/menu' && <Header />}
      <main>{children}</main>
    </>
  )
}

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/game" element={<Game />} />
          <Route path="/game/results" element={<GameResult />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
