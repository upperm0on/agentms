import { createSlice } from '@reduxjs/toolkit';

// Clean initial state
const initialState = {
  isAuthenticated: false,
  token: null,
  email: null,
  user: null,
  loading: true, // Start with loading true for initialization
  error: null,
  initialized: false, // Track if auth has been initialized
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.token = null;
      state.email = null;
      state.user = null;
      state.loading = false;
      state.error = action.payload || 'Login failed';
    },
    
    // Logout action
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.email = null;
      state.user = null;
      state.loading = false;
      state.error = null;
      state.initialized = true; // Mark as initialized even on logout
    },
    
    // Initialize from localStorage
    initializeAuth: (state, action) => {
      const { token, email, user } = action.payload;
      state.isAuthenticated = !!token;
      state.token = token;
      state.email = email;
      state.user = user;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  initializeAuth,
  clearError
} = authSlice.actions;

export default authSlice.reducer;
