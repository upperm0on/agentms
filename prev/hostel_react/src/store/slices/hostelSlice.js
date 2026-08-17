import { createSlice } from '@reduxjs/toolkit';

// Clean initial state
const initialState = {
  currentHostel: null,
  allHostels: [],
  currentProfile: 'consumer', // Track current profile type
  availableProfiles: [], // Available profiles for switching
  loading: false,
  error: null,
};

const hostelSlice = createSlice({
  name: 'hostel',
  initialState,
  reducers: {
    // Set current hostel (from Consumer API)
    setCurrentHostel: (state, action) => {
      state.currentHostel = action.payload;
      state.error = null;
    },
    
    // Set all hostels (from search API)
    setAllHostels: (state, action) => {
      state.allHostels = action.payload;
      state.error = null;
    },
    
    // Update hostel details
    updateHostelDetails: (state, action) => {
      if (state.currentHostel) {
        state.currentHostel = { ...state.currentHostel, ...action.payload };
      }
    },
    
    // Loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Clear all hostel data
    clearHostelData: (state) => {
      state.currentHostel = null;
      state.allHostels = [];
      state.error = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Profile switching actions
    setCurrentProfile: (state, action) => {
      state.currentProfile = action.payload;
    },
    
    setAvailableProfiles: (state, action) => {
      state.availableProfiles = action.payload;
    },
    
    switchProfile: (state, action) => {
      const { profileType, hostelData } = action.payload;
      state.currentProfile = profileType;
      if (profileType === 'consumer' && hostelData) {
        state.currentHostel = hostelData;
      } else if (profileType !== 'consumer') {
        // Clear hostel data for non-consumer profiles
        state.currentHostel = null;
      }
    },
  },
});

export const {
  setCurrentHostel,
  setAllHostels,
  updateHostelDetails,
  setLoading,
  setError,
  clearHostelData,
  clearError,
  setCurrentProfile,
  setAvailableProfiles,
  switchProfile,
} = hostelSlice.actions;

export default hostelSlice.reducer;
