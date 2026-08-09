import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Truck, ArrowLeft, Loader2, MapPin, Phone } from 'lucide-react'
import { setDeliverer } from '../store/slices/authSlice'
import { registerDeliverer, fetchDelivererStatus } from '../store/slices/delivererSlice'
import { apiClient } from '../utils/apiClient'
import { useToast } from '../contexts/ToastContext'
import { useVerificationError } from '../hooks/useVerificationError'
import './BecomeDeliverer.css'

function BecomeDeliverer() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, isAuthenticated, user, deliverer } = useSelector(state => state.auth)
  const { isDeliverer } = useSelector(state => state.deliverer)
  const { success, error: showError } = useToast()
  const { handleVerificationError } = useVerificationError()
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [checkingHostel, setCheckingHostel] = useState(true)
  const [hasHostel, setHasHostel] = useState(false)
  const [checkingDeliverer, setCheckingDeliverer] = useState(true)

  // Check deliverer status on mount
  React.useEffect(() => {
    const checkDelivererStatus = async () => {
      if (!isAuthenticated || !token) {
        setCheckingDeliverer(false)
        return
      }
      
      setCheckingDeliverer(true)
      try {
        const result = await dispatch(fetchDelivererStatus()).unwrap()
        
        if (result.is_deliverer && result.deliverer) {
          // User is already a deliverer, redirect to dashboard
          dispatch(setDeliverer(result.deliverer))
          navigate('/deliverer-dashboard')
          return
        }
      } catch (err) {
        // User is not a deliverer, that's fine
        console.log('User is not a deliverer:', err)
      } finally {
        setCheckingDeliverer(false)
      }
    }
    
    if (isAuthenticated && token) {
      checkDelivererStatus()
    } else {
      setCheckingDeliverer(false)
    }
  }, [isAuthenticated, token, dispatch, navigate])

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/become-deliverer' } })
    }
  }, [isAuthenticated, navigate])

  // Check if user has a hostel on mount
  React.useEffect(() => {
    const checkHostel = async () => {
      if (!isAuthenticated || !token) return
      
      setCheckingHostel(true)
      try {
        const response = await apiClient.get('/user/hostel/')
        const data = response.data
        
        if (data.has_hostel && data.location) {
          setHasHostel(true)
          setLocation(data.location)
        } else {
          setHasHostel(false)
        }
      } catch (err) {
        console.error('Error checking hostel:', err)
        setHasHostel(false)
      } finally {
        setCheckingHostel(false)
      }
    }
    
    if (isAuthenticated && token) {
      checkHostel()
    }
  }, [isAuthenticated, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      showError('Please login first to become a deliverer')
      navigate('/login')
      return
    }

    if (!location.trim()) {
      showError('Please provide your hostel/campus location')
      return
    }

    setLoading(true)
    try {
      const result = await dispatch(registerDeliverer({ 
        location: location.trim(), 
        phoneNumber: phoneNumber.trim() 
      })).unwrap()
      
      // Update auth state
      dispatch(setDeliverer(result.deliverer))
      
      success('Congratulations! You are now a deliverer. Start accepting delivery requests!')
      
      // Navigate to deliverer dashboard
      navigate('/deliverer-dashboard')
    } catch (err) {
      const isVerificationError = handleVerificationError(err)
      if (!isVerificationError) {
        const errorMessage = err?.message || err?.error || 'Failed to become a deliverer. Please try again.'
        showError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || checkingDeliverer) {
    return (
      <div className="become-deliverer-page">
        <div className="container">
          <div className="become-deliverer-content" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Loader2 size={48} className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p>Checking deliverer status...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isDeliverer || deliverer) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="become-deliverer-page">
      <div className="container">
        <div className="become-deliverer-content">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="become-deliverer-header">
            <div className="become-deliverer-icon">
              <Truck size={48} />
            </div>
            <h1>Become a Deliverer</h1>
            <p className="become-deliverer-description">
              Start earning by delivering products between sellers and buyers. 
              Accept delivery requests and get paid for each successful delivery.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="become-deliverer-form">
            <div className="form-group">
              <label htmlFor="location">
                <MapPin size={16} />
                Hostel/Campus Location *
              </label>
              {checkingHostel ? (
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                  Checking your hostel information...
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Mensah Sarbah Hall, Legon Campus"
                    required
                    disabled={loading || hasHostel}
                    style={hasHostel ? { background: '#f0fdf4', borderColor: '#10b981' } : {}}
                  />
                  {hasHostel ? (
                    <small style={{ color: '#10b981' }}>
                      ✓ Using your hostel location: {location}
                    </small>
                  ) : (
                    <small>Your location helps match you with nearby delivery requests</small>
                  )}
                </>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                <Phone size={16} />
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., +233 XX XXX XXXX"
                disabled={loading}
              />
              <small>For buyers and sellers to contact you about deliveries</small>
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={loading || !location.trim() || checkingHostel}
                className="submit-button"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Truck size={20} />
                    Become a Deliverer
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="become-deliverer-info">
            <h3>How it works:</h3>
            <ul>
              <li>Browse available delivery requests from buyers</li>
              <li>Accept requests that match your location</li>
              <li>Pick up from seller and deliver to buyer</li>
              <li>Earn 8.5% of the product price per delivery</li>
              <li>Get paid after successful delivery confirmation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BecomeDeliverer

