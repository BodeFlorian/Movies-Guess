import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './utils/style/app.scss'

import Page1 from './pages/Page1'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Page1 />} />
      </Routes>
    </Router>
  )
}

export default App
