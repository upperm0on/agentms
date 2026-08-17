import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reservationsAPI } from '../../services/api'

// Async thunks
export const fetchReservations = createAsyncThunk(
  'reservations/fetchReservations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reservationsAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reservations')
    }
  }
)

export const updateReservation = createAsyncThunk(
  'reservations/updateReservation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await reservationsAPI.update(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reservation')
    }
  }
)

export const cancelReservation = createAsyncThunk(
  'reservations/cancelReservation',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reservationsAPI.cancel(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel reservation')
    }
  }
)

export const confirmPayment = createAsyncThunk(
  'reservations/confirmPayment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reservationsAPI.confirmPayment(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm payment')
    }
  }
)

const initialState = {
  reservations: [],
  currentReservation: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {
    search: '',
    status: 'all',
    dateRange: 'all',
  },
}

const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: 'all',
        dateRange: 'all',
      }
    },
    setCurrentReservation: (state, action) => {
      state.currentReservation = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reservations
      .addCase(fetchReservations.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.isLoading = false
        state.reservations = action.payload.results || action.payload
        state.totalCount = action.payload.count || action.payload.length
        state.error = null
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update reservation
      .addCase(updateReservation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.reservations.findIndex(reservation => reservation.id === action.payload.id)
        if (index !== -1) {
          state.reservations[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Cancel reservation
      .addCase(cancelReservation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.reservations.findIndex(reservation => reservation.id === action.payload.id)
        if (index !== -1) {
          state.reservations[index] = action.payload
        }
        state.error = null
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Confirm payment
      .addCase(confirmPayment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.reservations.findIndex(reservation => reservation.id === action.payload.id)
        if (index !== -1) {
          state.reservations[index] = action.payload
        }
        state.error = null
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, clearFilters, setCurrentReservation, clearError } = reservationsSlice.actions
export default reservationsSlice.reducer
