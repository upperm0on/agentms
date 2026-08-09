import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Store, ArrowLeft, Loader2, Mail, User, Plus, X } from 'lucide-react'
import { setAuth, setEntrepreneur } from '../store/slices/authSlice'
import { createStore, checkEntrepreneurWithToken } from '../services/authService'
import { useToast } from '../contexts/ToastContext'
import './OpenStore.css'

function OpenStore({ onBack }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, isAuthenticated, user, role, entrepreneur } = useSelector(state => state.auth)
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Store form state
  const [storeName, setStoreName] = useState('')
  const [storeDescription, setStoreDescription] = useState('')
  const [storeLocation, setStoreLocation] = useState('')
  
  // Commodities state
  const [commodities, setCommodities] = useState([
    { name: '', description: '', type: 'product', price: '' }
  ])

  // Redirect if not authenticated (only when on separate route, not when embedded)
  React.useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== '/my-store') {
      navigate('/login', { state: { from: '/open-store' } })
    }
  }, [isAuthenticated, navigate])

  // Redirect if already has a store (only when on separate route, not when embedded)
  React.useEffect(() => {
    if (entrepreneur?.store && window.location.pathname !== '/my-store') {
      navigate('/my-store')
    }
  }, [entrepreneur, navigate])

  const addCommodity = () => {
    setCommodities([...commodities, { name: '', description: '', type: 'product', price: '' }])
  }

  const removeCommodity = (index) => {
    if (commodities.length > 1) {
      setCommodities(commodities.filter((_, i) => i !== index))
    }
  }

  const updateCommodity = (index, field, value) => {
    const updated = [...commodities]
    updated[index] = { ...updated[index], [field]: value }
    setCommodities(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('=== OpenStore form submit triggered ===')
    
    // Get token from Redux state or localStorage as fallback
    const authToken = token || localStorage.getItem('token')
    
    console.log('Token available:', !!authToken, 'Token length:', authToken?.length)
    
    if (!authToken) {
      console.error('No token found')
      showError('Please login first to open your store')
      navigate('/login')
      return
    }

    // Validate store name
    if (!storeName.trim()) {
      console.error('Store name validation failed')
      showError('Store name is required')
      return
    }

    // Validate at least one commodity with name
    const validCommodities = commodities.filter(c => c.name.trim())
    console.log('Valid commodities count:', validCommodities.length)
    
    if (validCommodities.length === 0) {
      console.error('No valid commodities found')
      showError('Please add at least one product or service')
      return
    }

    console.log('All validations passed, setting loading to true')
    setLoading(true)
    
    try {
      // Prepare commodities data
      const commoditiesData = validCommodities.map(c => ({
        name: c.name.trim(),
        description: c.description.trim() || '',
        type: c.type,
        price: c.price ? parseFloat(c.price) : null
      }))

      const storePayload = {
        name: storeName.trim(),
        description: storeDescription.trim(),
        location: storeLocation.trim(),
        commodities: commoditiesData
      }

      console.log('=== Calling createStore with payload ===', storePayload)
      console.log('Token being used:', authToken.substring(0, 10) + '...')

      // Create store with entrepreneur and commodities
      const response = await createStore(authToken, storePayload)
      
      console.log('=== Store creation response received ===', response)
      
      // Verify response structure
      if (!response.entrepreneur) {
        throw new Error('Store created but entrepreneur data not returned')
      }
      
      // The entrepreneur object should include nested store object
      // Backend returns: { store: {...}, entrepreneur: { store: {...}, ... } }
      const entrepreneurData = response.entrepreneur
      
      // Verify store is nested in entrepreneur object
      if (!entrepreneurData.store && !entrepreneurData.store_id) {
        console.warn('Warning: Entrepreneur data does not include store. Response:', response)
      }
      
      // Update auth state with entrepreneur data
      // Use authToken (from localStorage fallback) to ensure token is always available
      const currentToken = authToken || token || localStorage.getItem('token')
      const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null')
      
      // Update auth state with entrepreneur data
      dispatch(setAuth({
        token: currentToken,
        user: currentUser,
        role: 'seller',
        entrepreneur: entrepreneurData,
        account_verified: true
      }))
      
      // Also explicitly set entrepreneur to ensure state is updated
      // This ensures the NavBar and other components see the update immediately
      dispatch(setEntrepreneur(entrepreneurData))
      
      console.log('=== Redux state updated with entrepreneur data ===', {
        hasStore: !!(entrepreneurData.store || entrepreneurData.store_id),
        store: entrepreneurData.store,
        store_id: entrepreneurData.store_id
      })
      
      // Refresh entrepreneur status from backend to ensure we have the latest data
      try {
        const refreshedStatus = await checkEntrepreneurWithToken(authToken)
        if (refreshedStatus.is_entrepreneur && refreshedStatus.entrepreneur) {
          console.log('=== Refreshed entrepreneur status from backend ===', refreshedStatus)
          dispatch(setEntrepreneur(refreshedStatus.entrepreneur))
        }
      } catch (refreshErr) {
        console.warn('Could not refresh entrepreneur status:', refreshErr)
        // Not critical - we already have the data from store creation
      }
      
      success('Congratulations! Your store has been opened successfully!')
      
      // Only navigate if we're on a separate route, not if embedded as component
      // When embedded, the parent component will update based on Redux state
      if (window.location.pathname !== '/my-store') {
        navigate('/my-store')
      }
    } catch (err) {
      console.error('Store creation error:', err)
      const errorMessage = err.message || err.response?.data?.error || err.response?.data?.message || 'Failed to open store. Please try again.'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null
  }
  
  // If user already has a store, don't show the form
  // When embedded in MyStore, the parent will handle state updates
  if (entrepreneur?.store) {
    return null
  }

  return (
    <div className="open-store-page">
      <div className="container">
        <div className="open-store-content">
          <button 
            className="back-button"
            onClick={() => {
              // If onBack callback is provided (when embedded), use it
              if (onBack) {
                onBack()
              } else if (window.location.pathname === '/my-store') {
                window.history.back()
              } else {
                navigate(-1)
              }
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="open-store-header">
            <div className="open-store-icon">
              <Store size={48} />
            </div>
            <h1 className="open-store-title">Open Your Store</h1>
            <p className="open-store-subtitle">
              Create your store and start selling products and services to students in your community.
            </p>
          </div>

          <form className="open-store-form" onSubmit={handleSubmit}>
            {/* Store Information */}
            <div className="form-section">
              <h2 className="form-section-title">Store Information</h2>
              
              <div className="form-group">
                <label htmlFor="storeName" className="form-label">
                  Store Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="storeName"
                  className="form-input"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Enter your store/business name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="storeDescription" className="form-label">
                  Store Description
                </label>
                <textarea
                  id="storeDescription"
                  className="form-textarea"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Describe your store..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="storeLocation" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  id="storeLocation"
                  className="form-input"
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  placeholder="Store location (auto-filled if you're a consumer)"
                  disabled={loading}
                />
                <p className="form-hint">
                  If you're a consumer, your hostel location will be automatically used.
                </p>
              </div>
            </div>

            {/* Commodities Section */}
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title">Products & Services</h2>
                <p className="form-section-description">
                  Add at least one product or service you'll be offering
                </p>
              </div>

              {commodities.map((commodity, index) => (
                <div key={index} className="commodity-item">
                  <div className="commodity-header">
                    <h3 className="commodity-title">Item {index + 1}</h3>
                    {commodities.length > 1 && (
                      <button
                        type="button"
                        className="remove-commodity-btn"
                        onClick={() => removeCommodity(index)}
                        disabled={loading}
                        aria-label="Remove item"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <div className="commodity-fields">
                    <div className="form-group">
                      <label className="form-label">
                        Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={commodity.name}
                        onChange={(e) => updateCommodity(index, 'name', e.target.value)}
                        placeholder="Product/Service name"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        value={commodity.type}
                        onChange={(e) => updateCommodity(index, 'type', e.target.value)}
                        disabled={loading}
                      >
                        <option value="product">Product</option>
                        <option value="service">Service</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-textarea"
                        value={commodity.description}
                        onChange={(e) => updateCommodity(index, 'description', e.target.value)}
                        placeholder="Describe this item..."
                        rows={3}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Price (optional)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={commodity.price}
                        onChange={(e) => updateCommodity(index, 'price', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="add-commodity-btn"
                onClick={addCommodity}
                disabled={loading}
              >
                <Plus size={18} />
                <span>Add Another Item</span>
              </button>
            </div>

            {/* Account Info */}
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
                    <span>Opening Store...</span>
                  </>
                ) : (
                  <>
                    <Store size={18} />
                    <span>Open Store</span>
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

export default OpenStore

