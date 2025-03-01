import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'

import './Home.scss'

const Home = () => {
  const [error, setError] = useState('')
  const [inputValue, setInputValue] = useState('')
  const { user, login } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/menu')
    }
  }, [user, navigate])

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim().length < 2) {
      setError('Le pseudo doit contenir au moins 2 caractères.')
    } else {
      login(inputValue)
      setInputValue('')
    }
  }

  return (
    <div className="home">
      <div className="home__presentation">
        <h1 className="home__title">Movies Guess</h1>
        <p className="home__subtitle">
          Testez vos connaissances cinématographiques
        </p>
      </div>

      <form className="home__form" onSubmit={handleSubmit}>
        <input
          className="home__input"
          type="text"
          placeholder="Choisissez votre pseudo"
          value={inputValue}
          onChange={handleInputChange}
          aria-label="Votre prénom"
        />
        {error && <p className="home__error">{error}</p>}
        <button
          className="home__button"
          type="submit"
          disabled={inputValue.length < 2 ? true : false}
        >
          Jouer
        </button>
      </form>
    </div>
  )
}

export default Home
