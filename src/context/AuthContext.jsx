import { createContext, useContext, useState, useEffect } from 'react'
import { AUTH_USERS } from '../data/authUsers'

const AuthContext = createContext(null)

const STORAGE_KEY = 'medikiosk_auth_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (e) {
      console.error('Error persisting auth state', e)
    }
  }, [user])

  const login = (role, identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase()
    const cleanPass = (password || '').trim()

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter both your identifier/email and password.' }
    }

    const matchedUser = AUTH_USERS.find((u) => {
      const matchRole = role ? u.role.toLowerCase() === role.toLowerCase() : true
      const matchId =
        u.username.toLowerCase() === cleanId ||
        u.id.toLowerCase() === cleanId ||
        (u.phone && u.phone === cleanId)
      const matchPass = u.password === cleanPass

      return matchRole && matchId && matchPass
    })

    if (!matchedUser) {
      // Check if user exists but wrong password
      const userExists = AUTH_USERS.find((u) => {
        const matchRole = role ? u.role.toLowerCase() === role.toLowerCase() : true
        return (
          matchRole &&
          (u.username.toLowerCase() === cleanId ||
            u.id.toLowerCase() === cleanId ||
            (u.phone && u.phone === cleanId))
        )
      })

      if (userExists) {
        return { success: false, error: 'Incorrect password. Please verify your credentials.' }
      }

      return {
        success: false,
        error: `Invalid credentials for ${role ? role.toUpperCase() : 'this'} portal. Please check your ID/email and password.`
      }
    }

    // Clone user without sensitive fields if needed, or include token
    const authPayload = {
      ...matchedUser,
      token: `mk_jwt_${matchedUser.id}_${Date.now()}`,
      loggedInAt: new Date().toISOString()
    }

    setUser(authPayload)
    return { success: true, user: authPayload }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const switchRole = (newUser) => {
    setUser(newUser)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
