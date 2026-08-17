import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../../utils/apiClient'

// Async thunks
export const registerDeliverer = createAsyncThunk(
  'deliverer/register',
  async ({ location, phoneNumber }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/deliverers/register/', {
        location,
        phone_number: phoneNumber
      })
      return data
    } catch (err) {
      const errorData = err?.response?.data || err
      return rejectWithValue({
        ...errorData,
        status: err?.response?.status || err?.status,
        message: errorData?.message || errorData?.error || 'Failed to register as deliverer',
        requires_verification: errorData?.requires_verification || false
      })
    }
  }
)

export const fetchDelivererStatus = createAsyncThunk(
  'deliverer/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/deliverers/me/')
      return data
    } catch (err) {
      const errorData = err?.response?.data || err
      return rejectWithValue({
        ...errorData,
        status: err?.response?.status || err?.status,
        message: errorData?.message || errorData?.error || 'Failed to fetch deliverer status'
      })
    }
  }
)

export const fetchDeliveryRequests = createAsyncThunk(
  'deliverer/fetchRequests',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/deliverers/requests/')
      return data
    } catch (err) {
      const errorData = err?.response?.data || err
      return rejectWithValue({
        ...errorData,
        status: err?.response?.status || err?.status,
        message: errorData?.message || errorData?.error || 'Failed to fetch delivery requests'
      })
    }
  }
)

export const acceptDeliveryRequest = createAsyncThunk(
  'deliverer/acceptRequest',
  async ({ transactionId }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/deliverers/requests/${transactionId}/accept/`)
      return data
    } catch (err) {
      const errorData = err?.response?.data || err
      return rejectWithValue({
        ...errorData,
        status: err?.response?.status || err?.status,
        message: errorData?.message || errorData?.error || 'Failed to accept delivery request'
      })
    }
  }
)

export const fetchMyDeliveries = createAsyncThunk(
  'deliverer/fetchMyDeliveries',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/deliverers/deliveries/')
      return data
    } catch (err) {
      const errorData = err?.response?.data || err
      return rejectWithValue({
        ...errorData,
        status: err?.response?.status || err?.status,
        message: errorData?.message || errorData?.error || 'Failed to fetch deliveries'
      })
    }
  }
)

export const fetchCompletedDeliveries = createAsyncThunk(
  'deliverer/fetchCompleted',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/deliverers/completed/')
      return data
    } catch (err) {
      const errorData = err?.response?.data || err
      return rejectWithValue({
        ...errorData,
        status: err?.response?.status || err?.status,
        message: errorData?.message || errorData?.error || 'Failed to fetch completed deliveries'
      })
    }
  }
)

export const confirmDelivery = createAsyncThunk(
  'deliverer/confirmDelivery',
  async ({ transactionId }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/deliverers/deliveries/${transactionId}/confirm/`)
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

const initialState = {
  isDeliverer: false,
  deliverer: null,
  availableRequests: [],
  myDeliveries: [],
  completedDeliveries: [],
  hasActiveDelivery: false,
  activeDeliveryId: null,
  totalEarnings: 0,
  loading: false,
  error: null
}

const delivererSlice = createSlice({
  name: 'deliverer',
  initialState,
  reducers: {
    clearDeliverer: (state) => {
      state.isDeliverer = false
      state.deliverer = null
      state.availableRequests = []
      state.myDeliveries = []
      state.completedDeliveries = []
      state.hasActiveDelivery = false
      state.activeDeliveryId = null
      state.totalEarnings = 0
    }
  },
  extraReducers: (builder) => {
    // Register deliverer
    builder
      .addCase(registerDeliverer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerDeliverer.fulfilled, (state, action) => {
        state.loading = false
        state.isDeliverer = true
        state.deliverer = action.payload.deliverer
      })
      .addCase(registerDeliverer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to register as deliverer'
      })

    // Fetch deliverer status
    builder
      .addCase(fetchDelivererStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDelivererStatus.fulfilled, (state, action) => {
        state.loading = false
        state.isDeliverer = action.payload.is_deliverer
        state.deliverer = action.payload.deliverer
      })
      .addCase(fetchDelivererStatus.rejected, (state, action) => {
        state.loading = false
        state.isDeliverer = false
        state.deliverer = null
        state.error = action.payload?.message || 'Failed to fetch deliverer status'
      })

    // Fetch delivery requests
    builder
      .addCase(fetchDeliveryRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDeliveryRequests.fulfilled, (state, action) => {
        state.loading = false
        state.availableRequests = action.payload.available_requests || []
        state.hasActiveDelivery = action.payload.has_active_delivery || false
        state.activeDeliveryId = action.payload.active_delivery_id || null
      })
      .addCase(fetchDeliveryRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to fetch delivery requests'
      })

    // Accept delivery request
    builder
      .addCase(acceptDeliveryRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(acceptDeliveryRequest.fulfilled, (state, action) => {
        state.loading = false
        // Remove accepted request from available requests
        state.availableRequests = state.availableRequests.filter(
          req => req.id !== action.payload.transaction.id
        )
        // Add to my deliveries
        state.myDeliveries = [action.payload.transaction, ...state.myDeliveries]
        state.hasActiveDelivery = true
        state.activeDeliveryId = action.payload.transaction.id
      })
      .addCase(acceptDeliveryRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to accept delivery request'
      })

    // Fetch my deliveries
    builder
      .addCase(fetchMyDeliveries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyDeliveries.fulfilled, (state, action) => {
        state.loading = false
        state.myDeliveries = action.payload || []
        state.hasActiveDelivery = action.payload.length > 0
        state.activeDeliveryId = action.payload.length > 0 ? action.payload[0].id : null
      })
      .addCase(fetchMyDeliveries.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to fetch deliveries'
      })

    // Fetch completed deliveries
    builder
      .addCase(fetchCompletedDeliveries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCompletedDeliveries.fulfilled, (state, action) => {
        state.loading = false
        state.completedDeliveries = action.payload.deliveries || []
        state.totalEarnings = action.payload.total_earnings || 0
      })
      .addCase(fetchCompletedDeliveries.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to fetch completed deliveries'
      })

    // Confirm delivery
    builder
      .addCase(confirmDelivery.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(confirmDelivery.fulfilled, (state, action) => {
        state.loading = false
        // Update delivery in my deliveries
        const index = state.myDeliveries.findIndex(d => d.id === action.payload.transaction.id)
        if (index !== -1) {
          state.myDeliveries[index] = action.payload.transaction
        }
      })
      .addCase(confirmDelivery.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to confirm delivery'
      })
  }
})

export const { clearDeliverer } = delivererSlice.actions
export default delivererSlice.reducer
