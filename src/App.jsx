import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './utils/style/app.scss'

import Index from './pages/Index'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
    </Router>
  )
}

export default App
