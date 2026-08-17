import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentReservation: null,
  roomBooked: null,
  hasReservation: false,
  allReservations: [], // Store all reservations for availability calculation
  loading: false,
  error: null,
};

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    setReservation: (state, action) => {
      state.currentReservation = action.payload;
      state.hasReservation = true;
      if (action.payload.room_uuid || action.payload.room) {
        state.roomBooked = action.payload.room_uuid || action.payload.room;
      }
    },
    clearReservation: (state) => {
      state.currentReservation = null;
      state.roomBooked = null;
      state.hasReservation = false;
    },
    setAllReservations: (state, action) => {
      state.allReservations = action.payload;
    },
    addReservation: (state, action) => {
      state.allReservations.push(action.payload);
    },
    removeReservation: (state, action) => {
      state.allReservations = state.allReservations.filter(
        reservation => reservation.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setReservation, 
  clearReservation, 
  setAllReservations,
  addReservation,
  removeReservation,
  setLoading, 
  setError, 
  clearError 
} = reservationSlice.actions;

export default reservationSlice.reducer;
