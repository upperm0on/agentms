import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Package, MapPin, DollarSign, User, Store, Truck } from 'lucide-react'
import './DeliveryRequestCard.css'

function DeliveryRequestCard({ request, onAccept }) {
  const product = request.product || {}
  const store = request.store || {}
  const consumer = request.consumer || {}

  return (
    <Card className="delivery-request-card">
      <CardContent>
        <div className="delivery-request-header">
          <div className="delivery-request-icon">
            <Package size={24} />
          </div>
          <div className="delivery-request-title">
            <h3>{product.name || 'Product'}</h3>
            <p className="delivery-request-id">Request #{request.id}</p>
          </div>
        </div>

        <div className="delivery-request-details">
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
              <span className="detail-value">{request.seller_location || 'Not specified'}</span>
            </div>
          </div>

          <div className="detail-row">
            <MapPin size={16} />
            <div>
              <span className="detail-label">Delivery Location:</span>
              <span className="detail-value">{request.buyer_location || 'Not specified'}</span>
            </div>
          </div>

          <div className="detail-row">
            <DollarSign size={16} />
            <div>
              <span className="detail-label">Delivery Fee:</span>
              <span className="detail-value delivery-fee">
                GHS {Number(request.delivery_fee || 0).toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="delivery-request-actions">
          <Button
            variant="default"
            size="lg"
            onClick={onAccept}
            className="accept-button"
          >
            <Truck size={18} />
            Accept Delivery
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default DeliveryRequestCard

