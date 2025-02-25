import { createContext, useContext, useState } from 'react'
import PropTypes from 'prop-types'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [pseudo, setPseudo] = useState(localStorage.getItem('pseudo') || '')

  const setPseudoValue = (newPseudo) => {
    setPseudo(newPseudo)
    localStorage.setItem('pseudo', newPseudo)
  }

  const value = {
    pseudo,
    setPseudo: setPseudoValue,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
