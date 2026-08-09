import React, { useState } from 'react';
import { Calendar, CreditCard, Loader2, RotateCcw } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import ReservationModal from './ReservationModal';
import ChangeReservationModal from './ChangeReservationModal';
import '../../assets/css/reservation/ReservationButton.css';
import { useReservationData } from '../../hooks/useReservationData';
import { useAuthData } from '../../hooks/useAuthData';
import { getManagerReservationAmount } from '../../utils/pricingUtils';

function ReservationButton({ roomDetails, hostel, isAvailable, onReservationSuccess }) {
  const { hasReservation, reservation, allReservations } = useReservationData();
  const { token, email } = useAuthData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user has an existing reservation using Redux
  const hasExistingReservation = () => hasReservation;

  // Derive effective availability: prefer explicit boolean on roomDetails; else use passed isAvailable
  const availabilityByUuid = Array.isArray(hostel?.room_availability)
    ? hostel.room_availability.reduce((acc, r) => {
        if (r && r.room_uuid) acc[r.room_uuid] = r;
        return acc;
      }, {})
    : {};
  const backendAvail = roomDetails?.uuid ? availabilityByUuid[roomDetails.uuid] : null;
  const effectiveAvailable = typeof roomDetails?.room_available === 'boolean'
    ? roomDetails.room_available
    : (backendAvail ? !!backendAvail.is_available : !!isAvailable);
  const unavailableMessage = backendAvail
    ? (backendAvail.available_slots > 0 ? `${backendAvail.available_slots} Slots Available` : 'Fully Booked')
    : (isAvailable ? 'Available' : 'Fully Booked');

  const hasRoomReservationPrice = Number(roomDetails?.reservation_price) > 0;

  const handleReservationClick = () => {
    if (!effectiveAvailable || !hasRoomReservationPrice) return;
    
    if (hasExistingReservation()) {
      setIsChangeModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
    setError(null);
  };

  const handleReservationSubmit = async (reservationData) => {
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
          email: email || localStorage.getItem('email') || '',
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

  const handleChangeReservationSubmit = async (newRoomDetails) => {
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('Please log in to change your reservation');
      setIsLoading(false);
      return;
    }

    try {

      // Get current reservation data from Redux
      const currentReservation = reservation || {};
      
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

      // Initiate payment for new reservation (full amount)
      const depositPercentage = 100;
      const paymentRes = await fetch(buildApiUrl(API_ENDPOINTS.RESERVATIONS_PAYMENT_INITIATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          reservation_id: newReservation.id,
          email: email || localStorage.getItem('email') || '',
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

  const getCurrentReservation = () => reservation || {};

  return (
    <>
      <button
        type="button"
        className={`reservation-btn ${hasExistingReservation() ? 'change-reservation' : ''}`}
        onClick={handleReservationClick}
        disabled={!effectiveAvailable || isLoading || !hasRoomReservationPrice}
        aria-disabled={!effectiveAvailable || isLoading || !hasRoomReservationPrice}
        title={
          !effectiveAvailable
            ? unavailableMessage
                : (!hasRoomReservationPrice
                ? 'Reservations disabled: manager has not set a reservation price for this room'
                : (hasExistingReservation() ? 'Change your reservation (no refund)' : 'Reserve this room'))
        }
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : effectiveAvailable ? (
          hasExistingReservation() ? <RotateCcw size={18} /> : <Calendar size={18} />
        ) : (
          <CreditCard size={18} />
        )}
        <span>
          {isLoading
            ? "Processing..."
            : (!effectiveAvailable
                ? unavailableMessage
                : (!hasRoomReservationPrice ? "Reservations Disabled" : (hasExistingReservation() ? "Change Reservation" : "Reserve Room")))}
        </span>
      </button>

      {isModalOpen && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleReservationSubmit}
          roomDetails={roomDetails}
          hostel={hostel}
          error={error}
        />
      )}

      {isChangeModalOpen && (
        <ChangeReservationModal
          isOpen={isChangeModalOpen}
          onClose={() => setIsChangeModalOpen(false)}
          onSubmit={handleChangeReservationSubmit}
          roomDetails={roomDetails}
          hostel={hostel}
          currentReservation={getCurrentReservation()}
          error={error}
        />
      )}
    </>
  );
}

export default ReservationButton;
