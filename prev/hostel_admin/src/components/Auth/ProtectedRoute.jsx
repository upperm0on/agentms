import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuthStatus } from '../../store/slices/authSlice'

function ProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth)

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('adminToken')
    if (token) {
      dispatch(checkAuthStatus())
    }
  }, [dispatch])

  // Show loading only if we're checking auth status
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
