import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../../store/userStore.js'

import './index.scss'

const Index = () => {
  const [error, setError] = useState('')
  const [inputValue, setInputValue] = useState('')
  const { pseudo, setPseudo } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (pseudo) {
      navigate('/menu')
    }
  }, [pseudo, navigate])

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim().length < 2) {
      setError('Le pseudo doit contenir au moins 2 caractères.')
    } else {
      setPseudo(inputValue)
      setInputValue('')
    }
  }

  return (
    <div className="home">
      <div className="home__presentation">
        <h1 className="home__title">Movie Guess</h1>
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
        <button className="home__button" type="submit">
          Jouer
        </button>
      </form>
    </div>
  )
}

export default Index
