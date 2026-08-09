import React, { useState } from 'react';
import { X, AlertTriangle, DollarSign, Calendar, Building2, MapPin, Clock } from 'lucide-react';
import '../../assets/css/reservation/ChangeReservationModal.css';
import { formatRoomPrice } from '../../utils/currencyUtils';
import { getManagerReservationAmount } from '../../utils/pricingUtils';

function ChangeReservationModal({ isOpen, onClose, onSubmit, roomDetails, hostel, currentReservation, error }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmed) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(roomDetails);
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="change-reservation-modal-overlay" onClick={onClose}>
      <div className="change-reservation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="change-reservation-modal-header">
          <h3 className="change-reservation-modal-title">
            <AlertTriangle size={20} />
            Change Your Reservation
          </h3>
          <button 
            className="change-reservation-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="change-reservation-modal-content">
          {/* Current Reservation Info */}
          <div className="current-reservation-info">
            <h4 className="current-reservation-title">Current Reservation</h4>
            <div className="current-reservation-details">
              <div className="detail-item">
                <Building2 size={16} />
                <span><strong>Hostel:</strong> {currentReservation.hostel.name}</span>
              </div>
              <div className="detail-item">
                <MapPin size={16} />
                <span><strong>Campus:</strong> {currentReservation.hostel.campus?.campus || currentReservation.hostel.campus || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <Calendar size={16} />
                <span><strong>Reserved:</strong> {new Date(currentReservation.reservee_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <Clock size={16} />
                <span><strong>Expires:</strong> {new Date(currentReservation.expiry_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <DollarSign size={16} />
                <span><strong>Deposit Paid:</strong> GH₵{currentReservation.deposit_amount || 0}</span>
              </div>
            </div>
          </div>

          {/* New Room Info */}
          <div className="new-reservation-info">
            <h4 className="new-reservation-title">New Room Selection</h4>
            <div className="new-reservation-details">
              <div className="detail-item">
                <Building2 size={16} />
                <span><strong>Hostel:</strong> {hostel.name}</span>
              </div>
              <div className="detail-item">
                <MapPin size={16} />
                <span><strong>Campus:</strong> {hostel.campus?.campus || hostel.campus || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span><strong>Room:</strong> {roomDetails.number_in_room} in Room</span>
              </div>
              <div className="detail-item price-item">
                <span><strong>Price:</strong> {formatRoomPrice(
                  roomDetails, 
                  hostel?.manager?.payment_currency || 'GHS', 
                  hostel?.checkout_date || hostel?.checkout
                )}</span>
              </div>
            </div>
          </div>

          {/* Important Warning */}
          <div className="change-reservation-warning">
            <AlertTriangle size={20} className="warning-icon" />
            <div className="warning-content">
              <h4>Important Notice</h4>
              <p>
                <strong>You will NOT be refunded for your current reservation.</strong>
                Changing your reservation means you will lose your current payment and will need to pay the full reservation price for the new room.
              </p>
              <ul className="warning-list">
                <li>Your current payment of <strong>GH₵{currentReservation.deposit_amount || 0}</strong> will be forfeited</li>
                <li>
                  You will need to pay the full reservation price of 
                  <strong>{
                    (() => {
                      const total = getManagerReservationAmount(roomDetails, hostel);
                      return Number(total).toLocaleString();
                    })()
                  }</strong> for the new room
                </li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="change-reservation-error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="change-reservation-form">
            <div className="confirmation-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  required
                />
                <span className="checkbox-text">
                  I understand that I will lose my current deposit and will not be refunded. 
                  I agree to pay a new deposit for the new room.
                </span>
              </label>
            </div>

            <div className="change-reservation-modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-warning"
                disabled={!confirmed || isSubmitting}
              >
                {isSubmitting ? 'Processing...' : `Change Reservation (Pay New Deposit)`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangeReservationModal;
