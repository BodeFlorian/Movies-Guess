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
    </div>
  )
}

export default Menu
