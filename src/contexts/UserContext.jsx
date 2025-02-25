import { createContext, useContext, useState } from 'react'
import PropTypes from 'prop-types'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem('user') || '')

  const login = (pseudo) => {
    setUser(pseudo)
    localStorage.setItem('user', pseudo)
  }

  const logout = () => {
    setUser('')
    localStorage.removeItem('user')
  }

  const value = {
    user,
    login,
    logout,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
