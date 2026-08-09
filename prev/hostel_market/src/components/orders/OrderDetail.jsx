import React, { useState } from 'react'
import { X, Package, CheckCircle, XCircle, Clock, User, MapPin, Phone, Mail, MessageSquare, Truck } from 'lucide-react'
import Modal from '../ui/Modal'
import { Button } from '../ui/Button'
import ContactSellerModal from '../marketplace/ContactSellerModal'
import { useContactSeller } from '../../hooks/useContactSeller'
import { useToast } from '../../contexts/ToastContext'
import { useDispatch } from 'react-redux'
import { buyerConfirmDelivery, sellerConfirmDelivery } from '../../store/slices/orderSlice'
import './OrderDetail.css'

function OrderDetail({ order, isOpen, onClose, onConfirm, onCancel, userRole = 'buyer' }) {
  const dispatch = useDispatch()
  const { sendMessage } = useContactSeller()
  const { success, error: showError } = useToast()
  const [contactOpen, setContactOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  
  const isService = order.type === 'service'
  const isBuyer = userRole === 'buyer'
  const isSeller = userRole === 'seller'
  
  // Check if order has delivery (deliverer assigned)
  const hasDelivery = order.deliverer || (order.delivery_status && order.delivery_status !== 'pending')
  
  // Delivery confirmation logic
  const canConfirmDelivery = hasDelivery && 
    order.delivery_status === 'delivered' && 
    order.deliverer_confirmed &&
    ((isBuyer && !order.buyer_confirmed) || (isSeller && !order.seller_confirmed))
  
  // Service confirmation logic (existing)
  const canConfirm = isService && 
    order.status === 'pending' && 
    order.escrow_status === 'held' &&
    ((isBuyer && !order.buyer_confirmed) || (isSeller && !order.seller_confirmed))
  
  const bothConfirmed = (isService && order.buyer_confirmed && order.seller_confirmed) ||
    (hasDelivery && order.buyer_confirmed && order.seller_confirmed)
  
  const handleDeliveryConfirmation = async () => {
    if (!order.id) return
    
    setConfirming(true)
    try {
      if (isBuyer) {
        await dispatch(buyerConfirmDelivery({ transactionId: order.id })).unwrap()
        success('Delivery confirmed! Waiting for seller confirmation.')
      } else if (isSeller) {
        await dispatch(sellerConfirmDelivery({ transactionId: order.id })).unwrap()
        success('Delivery confirmed! Transaction completed!')
      }
      onConfirm?.(order)
    } catch (err) {
      showError(err?.message || 'Failed to confirm delivery')
    } finally {
      setConfirming(false)
    }
  }
  
  if (!order) return null
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Order #${order.id}`}
      size="large"
    >
      <div className="order-detail">
        {/* Order Status */}
        <div className="order-status-section">
          <div className={`status-badge status-${order.status}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
          {isService && (
            <div className="escrow-status">
              Escrow: <span className={order.escrow_status}>{order.escrow_status || 'N/A'}</span>
            </div>
          )}
        </div>
        
        {/* Order Item */}
        <div className="order-item-section">
          {order.item_image && (
            <img 
              src={order.item_image} 
              alt={order.item_name}
              className="order-detail-image"
            />
          )}
          <div className="order-item-info">
            <h2 className="order-item-title">{order.item_name}</h2>
            <p className="order-item-store">
              {isService ? 'Service from' : 'Product from'} {order.store_name}
            </p>
            {order.item_description && (
              <p className="order-item-description">{order.item_description}</p>
            )}
          </div>
        </div>
        
        {/* Order Info */}
        <div className="order-info-grid">
          <div className="info-item">
            <span className="info-label">Order Date</span>
            <span className="info-value">
              {new Date(order.created_at).toLocaleString()}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Order Type</span>
            <span className="info-value">
              {isService ? 'Service' : 'Product'}
            </span>
          </div>
          {order.delivery_address && (
            <div className="info-item">
              <span className="info-label">Delivery Address</span>
              <span className="info-value">{order.delivery_address}</span>
            </div>
          )}
          {order.delivery_driver && (
            <div className="info-item">
              <span className="info-label">Delivery Driver</span>
              <span className="info-value">{order.delivery_driver.name}</span>
            </div>
          )}
        </div>
        
        {/* Contact Info */}
        <div className="contact-section">
          <h3 className="section-title">
            {isBuyer ? 'Seller' : 'Buyer'} Contact Information
          </h3>
          <div className="contact-info">
            {isSeller && order.consumer && (
              <>
                <div className="contact-item">
                  <User size={16} />
                  <span>{order.consumer_username || order.consumer?.username || 'N/A'}</span>
                </div>
                <div className="contact-item">
                  <Mail size={16} />
                  <span>{order.consumer_email || order.consumer?.email || 'N/A'}</span>
                </div>
                {order.buyer_location && (
                  <div className="contact-item">
                    <MapPin size={16} />
                    <span>Location: {order.buyer_location}</span>
                  </div>
                )}
              </>
            )}
            {isBuyer && (
              <>
                {order.contact_name && (
                  <div className="contact-item">
                    <User size={16} />
                    <span>{order.contact_name}</span>
                  </div>
                )}
                {order.contact_phone && (
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{order.contact_phone}</span>
                  </div>
                )}
                {order.contact_email && (
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>{order.contact_email}</span>
                  </div>
                )}
              </>
            )}
            {!isBuyer && !isSeller && (
              <div className="contact-item">
                <span>No contact information available</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Delivery Status */}
        {hasDelivery && (
          <div className="delivery-section">
            <h3 className="section-title">
              <Truck size={18} />
              Delivery Status
            </h3>
            <div className="delivery-info">
              <div className="info-item">
                <span className="info-label">Delivery Status</span>
                <span className={`info-value status-${order.delivery_status || 'pending'}`}>
                  {order.delivery_status ? order.delivery_status.charAt(0).toUpperCase() + order.delivery_status.slice(1).replace('_', ' ') : 'Pending'}
                </span>
              </div>
              {order.deliverer && (
                <div className="info-item">
                  <span className="info-label">Deliverer</span>
                  <span className="info-value">{order.deliverer.user_username || order.deliverer.user_email || 'N/A'}</span>
                </div>
              )}
              {order.seller_location && (
                <div className="info-item">
                  <span className="info-label">Pickup Location</span>
                  <span className="info-value">{order.seller_location}</span>
                </div>
              )}
              {order.buyer_location && (
                <div className="info-item">
                  <span className="info-label">Delivery Location</span>
                  <span className="info-value">{order.buyer_location}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Service/Delivery Confirmation Status */}
        {(isService || hasDelivery) && (
          <div className="confirmation-section">
            <h3 className="section-title">Completion Confirmation</h3>
            <div className="confirmation-status">
              {hasDelivery && order.deliverer_confirmed && (
                <div className="confirmation-item confirmed">
                  <CheckCircle size={20} />
                  <span>Deliverer Confirmed: Yes</span>
                </div>
              )}
              <div className={`confirmation-item ${order.buyer_confirmed ? 'confirmed' : 'pending'}`}>
                <CheckCircle size={20} />
                <span>Buyer Confirmed: {order.buyer_confirmed ? 'Yes' : 'Pending'}</span>
              </div>
              <div className={`confirmation-item ${order.seller_confirmed ? 'confirmed' : 'pending'}`}>
                <CheckCircle size={20} />
                <span>Seller Confirmed: {order.seller_confirmed ? 'Yes' : 'Pending'}</span>
              </div>
            </div>
            {bothConfirmed && (
              <div className="confirmation-success">
                {hasDelivery ? 'All parties confirmed! Transaction completed!' : 'Both parties confirmed! Escrow will be released.'}
              </div>
            )}
          </div>
        )}
        
        {/* Pricing */}
        <div className="pricing-section">
          <h3 className="section-title">Order Summary</h3>
          <div className="pricing-breakdown">
            <div className="price-row">
              <span>Price</span>
              <span>{order.currency || 'GHS'} {parseFloat(order.item_price).toLocaleString()}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="price-row">
                <span>Delivery Fee</span>
                <span>{order.currency || 'GHS'} {parseFloat(order.delivery_fee).toLocaleString()}</span>
              </div>
            )}
            <div className="price-row total">
              <span>Total</span>
              <span className="total-amount">
                {order.currency || 'GHS'} {parseFloat(order.total_amount + (order.delivery_fee || 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="order-detail-actions">
          {/* Contact Seller button - show for completed or pending orders */}
          {isBuyer && (order.status === 'completed' || order.status === 'pending') && order.product_id && (
            <Button
              variant="default"
              size="lg"
              onClick={() => setContactOpen(true)}
            >
              <MessageSquare size={20} />
              Contact Seller
            </Button>
          )}
          
          {canConfirmDelivery && (
            <Button
              variant="success"
              size="lg"
              onClick={handleDeliveryConfirmation}
              disabled={confirming}
            >
              <CheckCircle size={20} />
              {confirming ? 'Confirming...' : 'Confirm Delivery'}
            </Button>
          )}
          
          {canConfirm && (
            <Button
              variant="success"
              size="lg"
              onClick={() => onConfirm?.(order)}
            >
              <CheckCircle size={20} />
              Confirm Completion
            </Button>
          )}
          
          {order.status === 'pending' && !isService && (
            <Button
              variant="destructive"
              size="lg"
              onClick={() => onCancel?.(order)}
            >
              <XCircle size={20} />
              Cancel Order
            </Button>
          )}
          
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
          >
            Close
          </Button>
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
      </div>
    </Modal>
  )
}

export default OrderDetail

