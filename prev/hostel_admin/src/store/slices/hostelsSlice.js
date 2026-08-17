import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { hostelsAPI } from '../../services/api'

// Async thunks
export const fetchHostels = createAsyncThunk(
  'hostels/fetchHostels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hostelsAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hostels')
    }
  }
)

export const createHostel = createAsyncThunk(
  'hostels/createHostel',
  async (hostelData, { rejectWithValue }) => {
    try {
      const response = await hostelsAPI.create(hostelData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create hostel')
    }
  }
)

export const updateHostel = createAsyncThunk(
  'hostels/updateHostel',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('Updating hostel:', { id, data })
      const response = await hostelsAPI.update(id, data)
      console.log('Hostel update response:', response)
      return response.data
    } catch (error) {
      console.error('Hostel update error:', error)
      
      // Handle specific error types
      if (error.code === 'ECONNRESET' || error.code === 'EPIPE' || error.message.includes('Broken pipe')) {
        return rejectWithValue('Connection lost. Please check your internet connection and try again.')
      }
      
      if (error.response?.status === 413) {
        return rejectWithValue('Data too large. Please reduce the size of your request.')
      }
      
      if (error.response?.status === 500) {
        return rejectWithValue('Server error. Please try again later.')
      }
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to update hostel. Please try again.'
      )
    }
  }
)

export const deleteHostel = createAsyncThunk(
  'hostels/deleteHostel',
  async (id, { rejectWithValue }) => {
    try {
      await hostelsAPI.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete hostel')
    }
  }
)

const initialState = {
  hostels: [],
  currentHostel: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {
    search: '',
    status: 'all',
    campus: 'all',
  },
}

const hostelsSlice = createSlice({
  name: 'hostels',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: 'all',
        campus: 'all',
      }
    },
    setCurrentHostel: (state, action) => {
      state.currentHostel = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch hostels
      .addCase(fetchHostels.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchHostels.fulfilled, (state, action) => {
        state.isLoading = false
        // Handle Django API response format for all hostels
        if (Array.isArray(action.payload)) {
          // Direct array of hostels from /hq/api/hostels/
          state.hostels = action.payload
          state.totalCount = action.payload.length
        } else if (action.payload.hostel && Array.isArray(action.payload.hostel)) {
          // Extract hostels from the nested structure (manager endpoint)
          const hostels = action.payload.hostel.map(item => {
            const keys = Object.keys(item)
            if (keys.length > 0) {
              return item[keys[0]] // Get the actual hostel data
            }
            return null
          }).filter(Boolean)
          state.hostels = hostels
          state.totalCount = hostels.length
        } else {
          state.hostels = action.payload.results || action.payload || []
          state.totalCount = action.payload.count || action.payload.length || 0
        }
        state.error = null
      })
      .addCase(fetchHostels.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create hostel
      .addCase(createHostel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createHostel.fulfilled, (state, action) => {
        state.isLoading = false
        state.hostels.unshift(action.payload)
        state.totalCount += 1
        state.error = null
      })
      .addCase(createHostel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update hostel
      .addCase(updateHostel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateHostel.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.hostels.findIndex(hostel => hostel.id === action.payload.id)
        if (index !== -1) {
          state.hostels[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateHostel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete hostel
      .addCase(deleteHostel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteHostel.fulfilled, (state, action) => {
        state.isLoading = false
        state.hostels = state.hostels.filter(hostel => hostel.id !== action.payload)
        state.totalCount -= 1
        state.error = null
      })
      .addCase(deleteHostel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, clearFilters, setCurrentHostel, clearError } = hostelsSlice.actions
export default hostelsSlice.reducer
