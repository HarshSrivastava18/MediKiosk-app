import { createContext, useContext, useState, useEffect } from 'react'
import { AUTH_USERS } from '../data/authUsers'

const AuthContext = createContext(null)

const STORAGE_KEY = 'medikiosk_auth_user'
const REGISTERED_USERS_KEY = 'medikiosk_registered_users'

export function getRegisteredUsers() {
  try {
    const saved = localStorage.getItem(REGISTERED_USERS_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function saveRegisteredUser(newUser) {
  try {
    const current = getRegisteredUsers()
    const filtered = current.filter((u) => u.id !== newUser.id && u.username !== newUser.username && u.identifier !== newUser.identifier)
    const updated = [newUser, ...filtered]
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Error saving registered user', e)
  }
}

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

  const getAllUsers = () => {
    const registered = getRegisteredUsers()
    return [...registered, ...AUTH_USERS]
  }

  const login = (role, identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase()
    const cleanPass = (password || '').trim()

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter both your identifier/email and password.' }
    }

    const allUsers = getAllUsers()

    const matchedUser = allUsers.find((u) => {
      const matchRole = role ? u.role.toLowerCase() === role.toLowerCase() : true
      const matchId =
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.identifier && u.identifier.toLowerCase() === cleanId) ||
        (u.id && u.id.toLowerCase() === cleanId) ||
        (u.phone && u.phone === cleanId)
      const matchPass = u.password === cleanPass

      return matchRole && matchId && matchPass
    })

    if (!matchedUser) {
      // Check if user exists but wrong password
      const userExists = allUsers.find((u) => {
        const matchRole = role ? u.role.toLowerCase() === role.toLowerCase() : true
        return (
          matchRole &&
          ((u.username && u.username.toLowerCase() === cleanId) ||
            (u.identifier && u.identifier.toLowerCase() === cleanId) ||
            (u.id && u.id.toLowerCase() === cleanId) ||
            (u.phone && u.phone === cleanId))
        )
      })

      if (userExists) {
        return { success: false, error: 'Incorrect password. Please check your credentials.' }
      }

      return {
        success: false,
        error: `Invalid credentials for ${role ? role.toUpperCase() : 'this'} portal. Please check your ID/email and password.`
      }
    }

    const authPayload = {
      ...matchedUser,
      token: `mk_jwt_${matchedUser.id}_${Date.now()}`,
      loggedInAt: new Date().toISOString()
    }

    setUser(authPayload)
    return { success: true, user: authPayload }
  }

  const registerPatientSession = (newPatientData) => {
    const userPayload = {
      id: newPatientData.id,
      username: newPatientData.email || newPatientData.phone,
      identifier: newPatientData.email || newPatientData.phone,
      password: newPatientData.password || 'patient123',
      role: 'patient',
      name: newPatientData.name,
      portalPath: '/patient',
      title: 'Patient',
      org: 'National Health Registry',
      phone: newPatientData.phone,
      details: {
        dob: newPatientData.dob,
        bloodGroup: newPatientData.bloodGroup,
        gender: newPatientData.gender,
        address: newPatientData.address
      }
    }

    saveRegisteredUser(userPayload)
    return userPayload
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
    registerPatientSession,
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
