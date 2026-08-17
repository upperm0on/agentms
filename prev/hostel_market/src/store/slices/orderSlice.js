import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../../utils/apiClient'

const initialState = {
  orders: [],
  currentOrder: null,
  orderHistory: [],
  loading: false,
  error: null,
}

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async ({ productId }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/orders/create/', { product_id: productId })
      return data
    } catch (err) {
      // Extract error details from response
      const errorData = err?.response?.data || err
      return rejectWithValue({
        ...errorData,
        status: err?.response?.status || err?.status,
        message: errorData?.message || errorData?.error || 'Failed to place order',
        requires_verification: errorData?.requires_verification || false
      })
    }
  }
)

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/orders')
      return data
    } catch (err) {
      // Silently handle 404s - endpoint not implemented yet
      if (err?.status === 404 && err?.silent) {
        // Return empty array as fulfilled result
        return []
      }
      // Only reject for non-404 errors
      if (err?.status !== 404) {
        return rejectWithValue(err)
      }
      // For 404s, return empty array
      return []
    }
  }
)

export const releaseEscrow = createAsyncThunk(
  'orders/releaseEscrow',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/orders/${orderId}/release`)
      return data
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

export const buyerConfirmDelivery = createAsyncThunk(
  'orders/buyerConfirmDelivery',
  async ({ transactionId }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/orders/${transactionId}/buyer-confirm/`)
      return data
    } catch (err) {
      const errorData = err?.response?.data || err
      return rejectWithValue({
        ...errorData,
        status: err?.response?.status || err?.status,
        message: errorData?.message || errorData?.error || 'Failed to confirm delivery'
      })
    }
  }
)

export const sellerConfirmDelivery = createAsyncThunk(
  'orders/sellerConfirmDelivery',
  async ({ transactionId }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/orders/${transactionId}/seller-confirm/`)
      return data
    } catch (err) {
      const errorData = err?.response?.data || err
      return rejectWithValue({
        ...errorData,
        status: err?.response?.status || err?.status,
        message: errorData?.message || errorData?.error || 'Failed to confirm delivery'
      })
    }
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload
    },
    setOrderStatus: (state, action) => {
      const { id, status } = action.payload || {}
      const idx = state.orders.findIndex(o => o.id === id)
      if (idx !== -1) {
        state.orders[idx] = { ...state.orders[idx], status }
      }
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    setOrderHistory: (state, action) => {
      state.orderHistory = action.payload
    },
    updateOrder: (state, action) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id)
      if (index !== -1) {
        state.orders[index] = action.payload
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false
        const order = action.payload
        state.orders.unshift(order)
        state.currentOrder = order
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to place order'
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(releaseEscrow.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.orders.findIndex(o => o.id === updated.id)
        if (idx !== -1) state.orders[idx] = updated
      })
      .addCase(buyerConfirmDelivery.fulfilled, (state, action) => {
        const updated = action.payload.transaction
        const idx = state.orders.findIndex(o => o.id === updated.id)
        if (idx !== -1) {
          state.orders[idx] = { ...state.orders[idx], ...updated }
        }
      })
      .addCase(sellerConfirmDelivery.fulfilled, (state, action) => {
        const updated = action.payload.transaction
        const idx = state.orders.findIndex(o => o.id === updated.id)
        if (idx !== -1) {
          state.orders[idx] = { ...state.orders[idx], ...updated }
        }
      })
  }
})

export const {
  setOrders,
  setCurrentOrder,
  setOrderHistory,
  setOrderStatus,
  updateOrder,
  setLoading,
  setError,
} = orderSlice.actions

export default orderSlice.reducer

