import React, { useState } from 'react'
import useUserStore from '../../store/userStore.js'

const Index = () => {
  const [error, setError] = useState('')
  const [inputValue, setInputValue] = useState('')
  const { pseudo, setPseudo } = useUserStore()

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
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Entrez votre prénom"
          value={inputValue}
          onChange={handleInputChange}
          aria-label="Votre prénom"
        />
        <button type="submit">Valider</button>
      </form>
      {pseudo ? <p>Pseudo actuel: {pseudo}</p> : <p>Aucun pseudo sauvegardé</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default Index
