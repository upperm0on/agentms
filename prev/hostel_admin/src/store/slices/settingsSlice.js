import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { settingsAPI } from '../../services/api'

// Async thunks
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.get()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings')
    }
  }
)

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.update(settingsData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings')
    }
  }
)

const initialState = {
  settings: {
    general: {
      siteName: '',
      siteDescription: '',
      timezone: 'UTC',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      bookingAlerts: true,
      paymentAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'medium'
    },
    system: {
      maintenanceMode: false,
      autoBackup: true,
      backupFrequency: 'daily',
      logLevel: 'info'
    }
  },
  isLoading: false,
  error: null
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateLocalSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false
        state.settings = action.payload
        state.error = null
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false
        state.settings = action.payload
        state.error = null
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, updateLocalSettings } = settingsSlice.actions
export default settingsSlice.reducer
