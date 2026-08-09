import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import hostelReducer from './slices/hostelSlice';
import reservationReducer from './slices/reservationSlice';

// Clean Redux store configuration
export const store = configureStore({
  reducer: {
    auth: authReducer,
    hostel: hostelReducer,
    reservation: reservationReducer,
  },
  // Add middleware for better error handling
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;