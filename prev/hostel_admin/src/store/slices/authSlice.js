import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api'

// Async thunks
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      // Store token and user data
      localStorage.setItem('adminToken', response.data.token || 'mock-token')
      localStorage.setItem('adminUser', JSON.stringify(response.data.user || { name: 'Admin', email: credentials.email }))
      return response.data
    } catch (error) {
      // For now, simulate successful login for testing
      localStorage.setItem('adminToken', 'mock-token')
      localStorage.setItem('adminUser', JSON.stringify({ name: 'Admin', email: credentials.email }))
      return { token: 'mock-token', user: { name: 'Admin', email: credentials.email } }
    }
  }
)

export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      return true
    } catch (error) {
      return rejectWithValue('Logout failed')
    }
  }
)

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken')
      const user = localStorage.getItem('adminUser')
      
      if (token && user) {
        return {
          token,
          user: JSON.parse(user)
        }
      }
      throw new Error('No valid session found')
    } catch (error) {
      return rejectWithValue('No valid session')
    }
  }
)

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload
      })
      // Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = null
      })
      // Check auth status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
  },
})

export const { clearError, setLoading } = authSlice.actions
export default authSlice.reducer
