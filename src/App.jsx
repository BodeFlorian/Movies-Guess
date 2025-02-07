import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './utils/style/app.scss'

import Index from './pages/Index'
import Menu from './pages/Menu'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="*" element={() => <h1>Page not found</h1>} />
      </Routes>
    </Router>
  )
}

export default App
