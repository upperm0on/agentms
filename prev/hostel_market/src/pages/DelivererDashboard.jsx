import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Truck, Package, CheckCircle, Clock, DollarSign, TrendingUp, ArrowLeft, ArrowRight } from 'lucide-react'
import { 
  fetchDeliveryRequests, 
  fetchMyDeliveries, 
  fetchCompletedDeliveries,
  acceptDeliveryRequest,
  confirmDelivery
} from '../store/slices/delivererSlice'
import { useToast } from '../contexts/ToastContext'
import DeliveryRequestCard from '../components/deliverer/DeliveryRequestCard'
import ActiveDeliveryCard from '../components/deliverer/ActiveDeliveryCard'
import DeliveryAnalytics from '../components/deliverer/DeliveryAnalytics'
import './DelivererDashboard.css'

function DelivererDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, deliverer } = useSelector(state => state.auth)
  const { 
    isDeliverer, 
    availableRequests, 
    myDeliveries, 
    completedDeliveries,
    hasActiveDelivery,
    totalEarnings,
    loading 
  } = useSelector(state => state.deliverer)
  const { success, error: showError } = useToast()
  const [activeTab, setActiveTab] = useState('requests') // 'requests', 'active', 'completed', 'analytics'

  // Redirect if not authenticated or not deliverer
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/deliverer-dashboard' } })
      return
    }
    if (!isDeliverer && !deliverer) {
      navigate('/become-deliverer')
      return
    }
  }, [isAuthenticated, isDeliverer, deliverer, navigate])

  // Fetch data on mount
  useEffect(() => {
    if (isAuthenticated && (isDeliverer || deliverer)) {
      // If has active delivery, show active tab and fetch my deliveries
      if (hasActiveDelivery) {
        setActiveTab('active')
        dispatch(fetchMyDeliveries())
      } else {
        // Otherwise show requests
        setActiveTab('requests')
        dispatch(fetchDeliveryRequests())
      }
      // Always fetch completed deliveries for analytics
      dispatch(fetchCompletedDeliveries())
    }
  }, [isAuthenticated, isDeliverer, deliverer, hasActiveDelivery, dispatch])

  const handleAcceptRequest = async (transactionId) => {
    try {
      await dispatch(acceptDeliveryRequest({ transactionId })).unwrap()
      success('Delivery request accepted! You can now proceed with the delivery.')
      // Switch to active tab and fetch my deliveries
      setActiveTab('active')
      dispatch(fetchMyDeliveries())
      dispatch(fetchDeliveryRequests()) // Refresh requests
    } catch (err) {
      showError(err?.message || 'Failed to accept delivery request')
    }
  }

  const handleConfirmDelivery = async (transactionId) => {
    try {
      await dispatch(confirmDelivery({ transactionId })).unwrap()
      success('Delivery confirmed! Waiting for buyer and seller confirmation.')
      dispatch(fetchMyDeliveries())
    } catch (err) {
      showError(err?.message || 'Failed to confirm delivery')
    }
  }

  if (!isAuthenticated || (!isDeliverer && !deliverer)) {
    return null
  }

  return (
    <div className="deliverer-dashboard">
      <div className="container">
        <div className="deliverer-dashboard-header">
          <div className="deliverer-dashboard-title">
            <Truck size={32} />
            <div>
              <h1>Deliverer Dashboard</h1>
              <p className="deliverer-location">
                {deliverer?.location || 'Location not set'}
              </p>
            </div>
          </div>
        </div>

        <div className="deliverer-dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('requests')
              if (!hasActiveDelivery) {
                dispatch(fetchDeliveryRequests())
              }
            }}
            disabled={hasActiveDelivery}
            aria-label="Available Requests"
            title="Available Requests"
          >
            <Package size={20} />
            <span className="tab-text">Requests</span>
            {availableRequests.length > 0 && (
              <span className="badge">{availableRequests.length}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('active')
              dispatch(fetchMyDeliveries())
            }}
            aria-label="Active Deliveries"
            title="Active Deliveries"
          >
            <Clock size={20} />
            <span className="tab-text">Active</span>
            {myDeliveries.length > 0 && (
              <span className="badge">{myDeliveries.length}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('completed')
              dispatch(fetchCompletedDeliveries())
            }}
            aria-label="Completed Deliveries"
            title="Completed Deliveries"
          >
            <CheckCircle size={20} />
            <span className="tab-text">Completed</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('analytics')
              dispatch(fetchCompletedDeliveries())
            }}
            aria-label="Analytics"
            title="Analytics"
          >
            <TrendingUp size={20} />
            <span className="tab-text">Analytics</span>
          </button>
        </div>

        <div className="deliverer-dashboard-content">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          )}

          {!loading && activeTab === 'requests' && (
            <div className="requests-section">
              {hasActiveDelivery ? (
                <div className="info-message">
                  <Clock size={24} />
                  <h3>You have an active delivery</h3>
                  <p>Complete your current delivery before accepting new requests.</p>
                  <Button onClick={() => setActiveTab('active')} aria-label="View Active Delivery" title="View Active Delivery">
                    <Clock size={18} />
                    <span className="button-text">View Active</span>
                  </Button>
                </div>
              ) : availableRequests.length === 0 ? (
                <div className="empty-state">
                  <Package size={48} />
                  <h3>No delivery requests available</h3>
                  <p>Check back later for new delivery requests.</p>
                </div>
              ) : (
                <div className="requests-grid">
                  {availableRequests.map(request => (
                    <DeliveryRequestCard
                      key={request.id}
                      request={request}
                      onAccept={() => handleAcceptRequest(request.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'active' && (
            <div className="active-deliveries-section">
              {myDeliveries.length === 0 ? (
                <div className="empty-state">
                  <Clock size={48} />
                  <h3>No active deliveries</h3>
                  <p>Accept a delivery request to get started.</p>
                  <Button onClick={() => setActiveTab('requests')} aria-label="View Available Requests" title="View Available Requests">
                    <Package size={18} />
                    <span className="button-text">View Requests</span>
                  </Button>
                </div>
              ) : (
                <div className="active-deliveries-list">
                  {myDeliveries.map(delivery => (
                    <ActiveDeliveryCard
                      key={delivery.id}
                      delivery={delivery}
                      onConfirm={() => handleConfirmDelivery(delivery.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'completed' && (
            <div className="completed-deliveries-section">
              {completedDeliveries.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={48} />
                  <h3>No completed deliveries yet</h3>
                  <p>Your completed deliveries will appear here.</p>
                </div>
              ) : (
                <div className="completed-deliveries-list">
                  {completedDeliveries.map(delivery => (
                    <ActiveDeliveryCard
                      key={delivery.id}
                      delivery={delivery}
                      isCompleted={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'analytics' && (
            <DeliveryAnalytics
              deliveries={completedDeliveries}
              totalEarnings={totalEarnings}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default DelivererDashboard

