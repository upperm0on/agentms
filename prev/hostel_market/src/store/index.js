import { configureStore } from '@reduxjs/toolkit'
import marketplaceReducer from './slices/marketplaceSlice'
import authReducer from './slices/authSlice'
import orderReducer from './slices/orderSlice'
import walletReducer from './slices/walletSlice'
import favoritesReducer from './slices/favoritesSlice'
import storeFavoritesReducer from './slices/storeFavoritesSlice'
import delivererReducer from './slices/delivererSlice'

export const store = configureStore({
  reducer: {
    marketplace: marketplaceReducer,
    auth: authReducer,
    orders: orderReducer,
    wallet: walletReducer,
    favorites: favoritesReducer,
    storeFavorites: storeFavoritesReducer,
    deliverer: delivererReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates', 'products', 'stores'],
      },
    }),
})
