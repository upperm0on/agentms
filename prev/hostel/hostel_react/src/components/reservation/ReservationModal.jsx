import React, { useState } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import '../../assets/css/reservation/ReservationModal.css';
import { formatRoomPrice, getCurrencySymbol } from '../../utils/currencyUtils';
import { getManagerReservationAmount } from '../../utils/pricingUtils';

function ReservationModal({ isOpen, onClose, onSubmit, roomDetails, hostel, error }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit();
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasRoomReservationPrice = Number(roomDetails?.reservation_price) > 0;
  const totalAmount = getManagerReservationAmount(roomDetails, hostel);
  const currencyCode = hostel?.manager?.payment_currency || 'GHS';
  const currencySymbol = getCurrencySymbol(currencyCode);
  

  if (!isOpen) return null;

  return (
    <div className="reservation-modal-overlay" onClick={onClose}>
      <div className="reservation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reservation-modal-header">
          <h3 className="reservation-modal-title">Reserve Room</h3>
          <button 
            className="reservation-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="reservation-modal-content">
          <div className="reservation-info">
            <h4 className="reservation-room-title">Room {roomDetails.number_in_room}</h4>
            <p className="reservation-hostel-name">{hostel.name}</p>
            
            <div className="reservation-pricing">
              <div className="pricing-item">
                <span>Reservation Price: {currencySymbol}{totalAmount.toLocaleString()}</span>
              </div>
              
            </div>
          </div>

          {error && (
            <div className="reservation-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="reservation-modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : `Pay Reservation (${currencySymbol}${totalAmount.toLocaleString()})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReservationModal;