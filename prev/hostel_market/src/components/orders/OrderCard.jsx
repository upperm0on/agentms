import React, { useState } from 'react'
import { Package, Clock, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import ContactSellerModal from '../marketplace/ContactSellerModal'
import { useContactSeller } from '../../hooks/useContactSeller'
import { useToast } from '../../contexts/ToastContext'
import './OrderCard.css'

function OrderCard({ order, onView, onConfirm, onCancel }) {
  const { sendMessage } = useContactSeller()
  const { success, error: showError } = useToast()
  const [contactOpen, setContactOpen] = useState(false)
  
  const getStatusIcon = () => {
    switch (order.status) {
      case 'pending':
        return <Clock size={18} className="status-icon pending" />
      case 'confirmed':
        return <CheckCircle size={18} className="status-icon confirmed" />
      case 'completed':
        return <CheckCircle size={18} className="status-icon completed" />
      case 'cancelled':
        return <XCircle size={18} className="status-icon cancelled" />
      default:
        return <Clock size={18} className="status-icon pending" />
    }
  }
  
  const getStatusColor = () => {
    switch (order.status) {
      case 'pending':
        return 'status-pending'
      case 'confirmed':
        return 'status-confirmed'
      case 'completed':
        return 'status-completed'
      case 'cancelled':
        return 'status-cancelled'
      default:
        return 'status-pending'
    }
  }
  
  const isService = order.type === 'service'
  const needsConfirmation = isService && order.status === 'pending' && order.escrow_status === 'held'
  
  return (
    <Card className="order-card">
      <CardContent className="order-card-content">
        <div className="order-card-header">
          <div className="order-info">
            <div className="order-id">
              Order #{order.id}
            </div>
            <div className="order-date">
              {new Date(order.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className={`order-status ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
          </div>
        </div>
        
        <div className="order-card-body">
          <div className="order-item-info">
            {order.item_image && (
              <img 
                src={order.item_image} 
                alt={order.item_name}
                className="order-item-image"
              />
            )}
            <div className="order-item-details">
              <h3 className="order-item-name">{order.item_name}</h3>
              <p className="order-item-store">
                {isService ? 'Service from' : 'Product from'} {order.store_name}
              </p>
              {order.user_role === 'seller' && order.consumer_username && (
                <p className="order-consumer-info" style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Buyer: {order.consumer_username}
                </p>
              )}
              {isService && (
                <div className="order-service-note">
                  Service order - Escrow: {order.escrow_status || 'N/A'}
                </div>
              )}
            </div>
          </div>
          
          <div className="order-price-section">
            <div className="order-price-row">
              <span>Price:</span>
              <span className="order-price">
                {order.currency || 'GHS'} {parseFloat(order.total_amount).toLocaleString()}
              </span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="order-price-row">
                <span>Delivery:</span>
                <span>{order.currency || 'GHS'} {parseFloat(order.delivery_fee).toLocaleString()}</span>
              </div>
            )}
            <div className="order-price-row total">
              <span>Total:</span>
              <span className="order-total">
                {order.currency || 'GHS'} {parseFloat(order.total_amount + (order.delivery_fee || 0)).toLocaleString()}
              </span>
            </div>
          </div>
          
          {needsConfirmation && (
            <div className="order-confirmation-notice">
              <MessageSquare size={16} />
              <span>Both buyer and seller must confirm completion to release escrow</span>
            </div>
          )}
        </div>
        
        <div className="order-card-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(order)}
          >
            <Eye size={16} />
            View Details
          </Button>
          
          {/* Contact Seller button - show for completed or pending orders */}
          {(order.status === 'completed' || order.status === 'pending') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setContactOpen(true)}
            >
              <MessageSquare size={16} />
              Contact Seller
            </Button>
          )}
          
          {order.status === 'pending' && !isService && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel?.(order)}
            >
              Cancel Order
            </Button>
          )}
          
          {needsConfirmation && (
            <Button
              variant="success"
              size="sm"
              onClick={() => onConfirm?.(order)}
            >
              <CheckCircle size={16} />
              Confirm Completion
            </Button>
          )}
        </div>
        
        {/* Contact Seller Modal */}
        {order.product_id && (
          <ContactSellerModal
            isOpen={contactOpen}
            onClose={() => setContactOpen(false)}
            product={{
              id: order.product_id,
              name: order.item_name || order.product_name,
              store_id: order.store_id,
              store_name: order.store_name
            }}
            orderId={order.id}
            isOrderContact={true}
            onSubmit={async (formData) => {
              try {
                await sendMessage(order.product_id, formData.message)
                success('Message sent to seller successfully! They will contact you soon about delivery.')
                setContactOpen(false)
              } catch (error) {
                showError(error.message || 'Failed to send message. Please try again.')
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default OrderCard

