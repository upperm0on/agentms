import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import hostelsSlice from './slices/hostelsSlice'
import usersSlice from './slices/usersSlice'
import reservationsSlice from './slices/reservationsSlice'
import analyticsSlice from './slices/analyticsSlice'
import settingsSlice from './slices/settingsSlice'

const store = configureStore({
  reducer: {
    auth: authSlice,
    hostels: hostelsSlice,
    users: usersSlice,
    reservations: reservationsSlice,
    analytics: analyticsSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export { store }
export default store
