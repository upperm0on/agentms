import React, { useState } from 'react';
import { X, AlertCircle, RotateCcw } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import ChangeReservationModal from './ChangeReservationModal';
import '../../assets/css/reservation/ReservationModal.css';
import { useReservationData } from '../../hooks/useReservationData';
import { useAuthData } from '../../hooks/useAuthData';
import { calculateRoomAvailability } from '../../utils/availabilityUtils';
import { formatRoomPrice, getCurrencySymbol } from '../../utils/currencyUtils';
import { getManagerReservationAmount } from '../../utils/pricingUtils';

function SimpleReservationModal({ isOpen, onClose, roomDetails, hostel }) {
  const { email: userEmail, token } = useAuthData();
  const { hasReservation, reservation, allReservations } = useReservationData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);

  // Check if user has an existing reservation using Redux
  const hasExistingReservation = () => hasReservation;

  const getCurrentReservation = () => reservation || {};

  // Calculate room availability (with null check)
  const roomAvailability = roomDetails ? calculateRoomAvailability(roomDetails, allReservations || []) : {
    totalCapacity: 0,
    currentOccupants: 0,
    reservedSlots: 0,
    availableSlots: 0,
    isAvailable: false,
    occupancyRate: 0
  };
  const isRoomAvailable = roomAvailability.isAvailable;

  // Manager-controlled totals
  const totalAmount = getManagerReservationAmount(roomDetails, hostel);
  const currencyCode = hostel?.manager?.payment_currency || 'GHS';
  const currencySymbol = getCurrencySymbol(currencyCode);

  const handleChangeReservationSubmit = async (newRoomDetails) => {
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('Please log in to change your reservation');
      setIsLoading(false);
      return;
    }

    try {

      // First, get current user's reservations from API
      const reservationsRes = await fetch(buildApiUrl(API_ENDPOINTS.RESERVATIONS_LIST), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      if (!reservationsRes.ok) {
        throw new Error('Failed to fetch current reservations');
      }

      const reservationsData = await reservationsRes.json();
      
      if (!reservationsData.reservations || reservationsData.reservations.length === 0) {
        throw new Error('No current reservation found');
      }

      // Get the most recent reservation
      const currentReservation = reservationsData.reservations[0];

      // First, delete the existing reservation
      const deleteUrl = buildApiUrl(`${API_ENDPOINTS.RESERVATIONS_DELETE}${currentReservation.id}/`);
      
      const deleteRes = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      if (!deleteRes.ok) {
        const errorData = await deleteRes.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to cancel existing reservation');
      }

      // Create new reservation
      const amountToCharge = getManagerReservationAmount(newRoomDetails, hostel);
      const createRes = await fetch(buildApiUrl(API_ENDPOINTS.RESERVATIONS_CREATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          hostel_id: hostel.id,
          reservee_date: new Date().toISOString().split('T')[0],
          room_uuid: newRoomDetails.uuid,
          amount: amountToCharge,
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        throw new Error(errorData.detail || 'Failed to create new reservation');
      }

      const newReservation = await createRes.json();

      // Update localStorage with new reservation data
      localStorage.setItem('reservation_data', JSON.stringify(newReservation));

      // Use authenticated user email
      const paymentEmail = userEmail || localStorage.getItem('email') || '';
      
      if (!paymentEmail) {
        throw new Error('User email not found. Please log in again.');
      }

      // Initiate payment (full reservation amount)
      const depositPercentage = 100;
      const paymentRes = await fetch(buildApiUrl(API_ENDPOINTS.RESERVATIONS_PAYMENT_INITIATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          reservation_id: newReservation.id,
          email: paymentEmail,
          deposit_percentage: depositPercentage,
        }),
      });

      if (!paymentRes.ok) {
        const errorData = await paymentRes.json();
        throw new Error(errorData.detail || 'Failed to initiate payment');
      }

      const paymentData = await paymentRes.json();

      // Redirect to Paystack payment
      window.location.href = paymentData.authorization_url;

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !roomDetails || !hostel) return null;

  // If user has existing reservation, show change modal instead
  if (hasExistingReservation()) {
    return (
      <ChangeReservationModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleChangeReservationSubmit}
        roomDetails={roomDetails}
        hostel={hostel}
        currentReservation={getCurrentReservation()}
        error={error}
      />
    );
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('Please log in to make a reservation');
      setIsLoading(false);
      return;
    }

    try {

      // Create reservation
      const amountToCharge = getManagerReservationAmount(roomDetails, hostel);
      const createRes = await fetch(buildApiUrl(API_ENDPOINTS.RESERVATIONS_CREATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          hostel_id: hostel.id,
          reservee_date: new Date().toISOString().split('T')[0], // Use current date as default
          room_uuid: roomDetails.uuid,
          amount: amountToCharge,
        }),
      });


      if (!createRes.ok) {
        const errorData = await createRes.json();
        throw new Error(errorData.detail || 'Failed to create reservation');
      }

      const reservation = await createRes.json();

      // Initiate payment (full reservation amount)
      const depositPercentage = 100;
      const paymentRes = await fetch(buildApiUrl(API_ENDPOINTS.RESERVATIONS_PAYMENT_INITIATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          reservation_id: reservation.id,
          email: userEmail || localStorage.getItem('email') || '',
          deposit_percentage: depositPercentage,
        }),
      });


      if (!paymentRes.ok) {
        const errorData = await paymentRes.json();
        throw new Error(errorData.detail || 'Failed to initiate payment');
      }

      const paymentData = await paymentRes.json();

      // Redirect to Paystack payment
      window.location.href = paymentData.authorization_url;

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if roomDetails is null
  if (!roomDetails) {
    return null;
  }

  return (
    <div className="reservation-modal-overlay" onClick={handleOverlayClick}>
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

            <div className="reservation-availability">
              <div className="availability-info">
                <span className="availability-label">Availability:</span>
                <span className={`availability-status ${isRoomAvailable ? 'available' : 'unavailable'}`}>
                  {isRoomAvailable 
                    ? `${roomAvailability.availableSlots} slot${roomAvailability.availableSlots > 1 ? 's' : ''} available`
                    : 'Fully booked'
                  }
                </span>
              </div>
              {!isRoomAvailable && (
                <div className="availability-warning">
                  <AlertCircle size={16} />
                  <span>This room is currently fully booked and not available for reservation.</span>
                </div>
              )}
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
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading || !isRoomAvailable}
                title={!isRoomAvailable ? 'Room is not available for reservation' : ''}
              >
                {isLoading ? 'Processing...' : !isRoomAvailable ? 'Room Not Available' : `Pay Reservation (${currencySymbol}${totalAmount.toLocaleString()})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SimpleReservationModal;
