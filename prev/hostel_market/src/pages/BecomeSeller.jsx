import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Store, ArrowLeft, Loader2, Mail, User } from 'lucide-react'
import { setEntrepreneur, setRole } from '../store/slices/authSlice'
import { becomeEntrepreneur } from '../services/authService'
import { useToast } from '../contexts/ToastContext'
import './BecomeSeller.css'

function BecomeSeller() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, isAuthenticated, user, role, entrepreneur } = useSelector(state => state.auth)
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/become-seller' } })
    }
  }, [isAuthenticated, navigate])

  // Redirect if already seller
  React.useEffect(() => {
    if (role === 'seller' || entrepreneur) {
      navigate('/my-store')
    }
  }, [role, entrepreneur, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      showError('Please login first to become a seller')
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      // Create entrepreneur record
      const entrepreneurData = await becomeEntrepreneur(token)
      
      // Update auth state
      dispatch(setEntrepreneur(entrepreneurData))
      dispatch(setRole('seller'))
      
      success('Congratulations! You are now a seller. Start creating your store!')
      
      // Navigate to store creation page
      navigate('/my-store')
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.error || 'Failed to become a seller. Please try again.'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || role === 'seller') {
    return null
  }

  return (
    <div className="become-seller-page">
      <div className="container">
        <div className="become-seller-content">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="become-seller-header">
            <div className="become-seller-icon">
              <Store size={48} />
            </div>
            <h1 className="become-seller-title">Become a Seller</h1>
            <p className="become-seller-subtitle">
              Start selling products and services to students in your hostel community.
            </p>
          </div>

          <form className="become-seller-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2 className="form-section-title">Getting Started</h2>
              <p className="form-section-description">
                As a seller on sitysns Marketplace, you can:
              </p>
              <ul className="benefits-list">
                <li>Create and manage your store</li>
                <li>List products and services</li>
                <li>Reach students in your hostel community</li>
                <li>Track orders and manage inventory</li>
                <li>Get paid securely through our platform</li>
              </ul>
            </div>

            <div className="form-section">
              <h2 className="form-section-title">Your Account</h2>
              <div className="account-info">
                <div className="info-item">
                  <Mail size={20} />
                  <div>
                    <label>Email</label>
                    <span>{user?.email || 'Not available'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <User size={20} />
                  <div>
                    <label>Username</label>
                    <span>{user?.username || 'Not available'}</span>
                  </div>
                </div>
              </div>
              <p className="form-note">
                Your seller account will be created with your current account details.
                Location will be automatically set based on your hostel (if you're a consumer).
              </p>
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={loading}
                className="submit-button"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <Store size={18} />
                    <span>Become a Seller</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BecomeSeller

