import { createSlice } from '@reduxjs/toolkit'

// Load persisted auth state from localStorage
const loadAuthState = () => {
  try {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    const role = localStorage.getItem('role') || 'buyer'
    const entrepreneurStr = localStorage.getItem('entrepreneur')
    const accountVerified = localStorage.getItem('accountVerified') === 'true'
    
    if (!token) return null
    
    return {
      user: userStr ? JSON.parse(userStr) : null,
      token,
      isAuthenticated: !!token,
      role,
      entrepreneur: entrepreneurStr ? JSON.parse(entrepreneurStr) : null,
      accountVerified,
    }
  } catch (error) {
    console.error('Error loading auth state from localStorage:', error)
    return null
  }
}

const persistedState = loadAuthState()

const initialState = persistedState || {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  role: 'buyer', // 'buyer', 'seller', or 'deliverer' (can be multiple)
  entrepreneur: null, // Entrepreneur data if user is a seller
  deliverer: null, // Deliverer data if user is a deliverer
  accountVerified: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = !!action.payload.token
      if (action.payload.role) {
        state.role = action.payload.role
      }
      if (action.payload.entrepreneur) {
        state.entrepreneur = action.payload.entrepreneur
        state.role = 'seller'
      }
      if (action.payload.deliverer) {
        state.deliverer = action.payload.deliverer
      }
      if (action.payload.account_verified !== undefined) {
        state.accountVerified = action.payload.account_verified
      }
      
      // Persist to localStorage
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token)
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user))
        }
        if (action.payload.role) {
          localStorage.setItem('role', action.payload.role)
        }
        if (action.payload.entrepreneur) {
          localStorage.setItem('entrepreneur', JSON.stringify(action.payload.entrepreneur))
        }
        if (action.payload.deliverer) {
          localStorage.setItem('deliverer', JSON.stringify(action.payload.deliverer))
        }
        if (action.payload.account_verified !== undefined) {
          localStorage.setItem('accountVerified', String(action.payload.account_verified))
        }
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.role = 'buyer'
      state.entrepreneur = null
      state.deliverer = null
      state.accountVerified = false
      
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      localStorage.removeItem('entrepreneur')
      localStorage.removeItem('deliverer')
      localStorage.removeItem('accountVerified')
      localStorage.removeItem('name')
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setRole: (state, action) => {
      state.role = action.payload === 'seller' ? 'seller' : 'buyer'
    },
    setEntrepreneur: (state, action) => {
      state.entrepreneur = action.payload
      state.role = 'seller'
      
      // Persist entrepreneur to localStorage
      if (action.payload) {
        localStorage.setItem('entrepreneur', JSON.stringify(action.payload))
        localStorage.setItem('role', 'seller')
      }
    },
    setDeliverer: (state, action) => {
      state.deliverer = action.payload
      
      // Persist deliverer to localStorage
      if (action.payload) {
        localStorage.setItem('deliverer', JSON.stringify(action.payload))
      }
    },
  },
})

export const { setAuth, logout, setLoading, setRole, setEntrepreneur, setDeliverer } = authSlice.actions
export default authSlice.reducer

