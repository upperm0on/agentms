import { useSelector } from 'react-redux';

// Simple hook to get reservation data from Redux
export const useReservationData = () => {
  const reservationState = useSelector(state => state.reservation);
  
  return {
    reservation: reservationState.currentReservation,
    hasReservation: reservationState.hasReservation,
    allReservations: reservationState.allReservations,
    loading: reservationState.loading,
    error: reservationState.error,
  };
};
