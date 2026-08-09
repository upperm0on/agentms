import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Package, MapPin, DollarSign, User, Store, CheckCircle, Clock, Truck } from 'lucide-react'
import './ActiveDeliveryCard.css'

function ActiveDeliveryCard({ delivery, onConfirm, isCompleted = false }) {
  const product = delivery.product || {}
  const store = delivery.store || {}
  const consumer = delivery.consumer || {}

  const getStatusInfo = () => {
    if (isCompleted) {
      return { icon: CheckCircle, text: 'Completed', color: '#10b981' }
    }
    if (delivery.delivery_status === 'delivered' && delivery.deliverer_confirmed) {
      return { icon: Clock, text: 'Waiting for buyer/seller confirmation', color: '#f59e0b' }
    }
    if (delivery.delivery_status === 'assigned') {
      return { icon: Truck, text: 'In Progress', color: '#3b82f6' }
    }
    return { icon: Clock, text: 'Pending', color: '#64748b' }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Card className={`active-delivery-card ${isCompleted ? 'completed' : ''}`}>
      <CardContent>
        <div className="active-delivery-header">
          <div className="active-delivery-icon">
            <Package size={24} />
          </div>
          <div className="active-delivery-title">
            <h3>{product.name || 'Product'}</h3>
            <p className="active-delivery-id">Delivery #{delivery.id}</p>
          </div>
          <div className="active-delivery-status" style={{ color: statusInfo.color }}>
            <StatusIcon size={18} />
            <span>{statusInfo.text}</span>
          </div>
        </div>

        <div className="active-delivery-details">
          <div className="detail-row">
            <Store size={16} />
            <div>
              <span className="detail-label">Seller:</span>
              <span className="detail-value">{store.name || 'N/A'}</span>
            </div>
          </div>

          <div className="detail-row">
            <User size={16} />
            <div>
              <span className="detail-label">Buyer:</span>
              <span className="detail-value">{consumer.username || consumer.email || 'N/A'}</span>
            </div>
          </div>

          <div className="detail-row">
            <MapPin size={16} />
            <div>
              <span className="detail-label">Pickup Location:</span>
              <span className="detail-value">{delivery.seller_location || 'Not specified'}</span>
            </div>
          </div>

          <div className="detail-row">
            <MapPin size={16} />
            <div>
              <span className="detail-label">Delivery Location:</span>
              <span className="detail-value">{delivery.buyer_location || 'Not specified'}</span>
            </div>
          </div>

          <div className="detail-row">
            <DollarSign size={16} />
            <div>
              <span className="detail-label">Delivery Fee:</span>
              <span className="detail-value delivery-fee">
                GHS {Number(delivery.delivery_fee || 0).toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
          </div>
        </div>

        {!isCompleted && (
          <div className="active-delivery-actions">
            {delivery.delivery_status === 'assigned' && (
              <Button
                variant="default"
                size="lg"
                onClick={onConfirm}
                className="confirm-button"
              >
                <CheckCircle size={18} />
                Confirm Delivery
              </Button>
            )}
            {delivery.delivery_status === 'delivered' && delivery.deliverer_confirmed && (
              <div className="confirmation-status">
                <CheckCircle size={18} />
                <span>You've confirmed delivery. Waiting for buyer and seller confirmation.</span>
              </div>
            )}
          </div>
        )}

        {isCompleted && (
          <div className="completed-badge">
            <CheckCircle size={18} />
            <span>Delivery completed successfully!</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ActiveDeliveryCard

