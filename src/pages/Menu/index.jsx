import React from 'react'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../../store/userStore'

const Menu = () => {
  const { pseudo } = useUserStore()
  const navigate = useNavigate()

  if (!pseudo) {
    navigate('/')
    return null
  }

  return (
    <div>
      <p>Bienvenue {pseudo}</p>
      <div>
        <button onClick={() => navigate('/game')}>Lancer une partie</button>
      </div>
    </div>
  )
}

export default Menu
