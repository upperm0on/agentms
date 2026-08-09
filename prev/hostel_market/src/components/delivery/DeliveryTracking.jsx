import React from 'react'
import { Package, MapPin, Clock, CheckCircle, User, Phone } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import './DeliveryTracking.css'

function DeliveryTracking({ delivery }) {
  if (!delivery) return null
  
  const getStatusStep = () => {
    switch (delivery.status) {
      case 'pending':
        return 1
      case 'accepted':
        return 2
      case 'picked_up':
        return 3
      case 'in_transit':
        return 4
      case 'delivered':
        return 5
      default:
        return 1
    }
  }
  
  const currentStep = getStatusStep()
  
  const steps = [
    { id: 1, label: 'Order Placed', icon: Package },
    { id: 2, label: 'Accepted', icon: CheckCircle },
    { id: 3, label: 'Picked Up', icon: Package },
    { id: 4, label: 'In Transit', icon: MapPin },
    { id: 5, label: 'Delivered', icon: CheckCircle },
  ]
  
  return (
    <Card className="delivery-tracking">
      <CardContent className="delivery-content">
        <div className="delivery-header">
          <h3 className="delivery-title">Delivery Tracking</h3>
          <div className={`delivery-status status-${delivery.status}`}>
            {delivery.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="delivery-progress">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            const isPending = step.id > currentStep
            
            return (
              <React.Fragment key={step.id}>
                <div className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}>
                  <div className="step-icon">
                    <Icon size={20} />
                  </div>
                  <span className="step-label">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`progress-line ${isCompleted ? 'completed' : ''}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
        
        {/* Driver Info */}
        {delivery.driver && (
          <div className="driver-info">
            <h4 className="info-title">Delivery Driver</h4>
            <div className="driver-details">
              <div className="driver-avatar">
                <User size={24} />
              </div>
              <div className="driver-text">
                <p className="driver-name">{delivery.driver.name}</p>
                <p className="driver-vehicle">{delivery.driver.vehicle_type} • {delivery.driver.vehicle_number}</p>
              </div>
              {delivery.driver.phone && (
                <a href={`tel:${delivery.driver.phone}`} className="driver-contact">
                  <Phone size={18} />
                  Call
                </a>
              )}
            </div>
          </div>
        )}
        
        {/* Delivery Details */}
        <div className="delivery-details">
          <div className="detail-item">
            <span className="detail-label">Estimated Delivery:</span>
            <span className="detail-value">
              {delivery.estimated_delivery 
                ? new Date(delivery.estimated_delivery).toLocaleString()
                : 'Calculating...'}
            </span>
          </div>
          
          {delivery.delivery_address && (
            <div className="detail-item">
              <span className="detail-label">Delivery Address:</span>
              <span className="detail-value">
                <MapPin size={16} />
                {delivery.delivery_address}
              </span>
            </div>
          )}
          
          {delivery.delivery_fee > 0 && (
            <div className="detail-item">
              <span className="detail-label">Delivery Fee:</span>
              <span className="detail-value">
                GHS {parseFloat(delivery.delivery_fee).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default DeliveryTracking

