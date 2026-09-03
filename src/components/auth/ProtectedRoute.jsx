import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname, role: requiredRole }}
        replace
      />
    )
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          role: requiredRole,
          error: `You are currently logged in as a ${user.role}. Please log in with valid ${requiredRole} credentials to access this portal.`
        }}
        replace
      />
    )
  }

  return children
}
