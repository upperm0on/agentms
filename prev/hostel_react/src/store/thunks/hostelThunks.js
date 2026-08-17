import { createAsyncThunk } from '@reduxjs/toolkit';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import { setCurrentHostel, setLoading, setError, clearError, setAvailableProfiles } from '../slices/hostelSlice';
import { setReservation, setAllReservations, setLoading as setReservationLoading, setError as setReservationError } from '../slices/reservationSlice';

// Fetch consumer data
export const fetchConsumerData = createAsyncThunk(
  'hostel/fetchConsumerData',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      if (!auth.token) {
        throw new Error('No authentication token');
      }

      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await fetch(buildApiUrl(API_ENDPOINTS.CONSUMER_REQUEST), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${auth.token}`,
        },
      });

      if (response.status === 404) {
        // No consumer data found - clear any existing hostel data
        dispatch(setCurrentHostel(null));
        dispatch(setLoading(false));
        return { hasHostel: false };
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Only set hostel data if user is an active consumer (stat === "True")
      if (data.stat === "True" && data.data) {
        dispatch(setCurrentHostel(data.data));
      } else {
        // User has consumer record but is not active - clear hostel data
        dispatch(setCurrentHostel(null));
      }
      
      dispatch(setLoading(false));
      return { 
        hasHostel: data.stat === "True",
        data: data.data,
        room: data.room_uuid || data.room
      };
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    }
  }
);

// Fetch reservations
export const fetchReservations = createAsyncThunk(
  'reservation/fetchReservations',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      if (!auth.token) {
        throw new Error('No authentication token');
      }

      dispatch(setReservationLoading(true));
      dispatch(setReservationError(null));

      const response = await fetch(buildApiUrl(API_ENDPOINTS.RESERVATIONS_LIST), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${auth.token}`,
        },
      });

      if (response.status === 404) {
        dispatch(setReservationLoading(false));
        return { hasReservation: false };
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.reservations && data.reservations.length > 0) {
        const latestReservation = data.reservations[0];
        dispatch(setReservation(latestReservation));
        dispatch(setAllReservations(data.reservations));
        
        // DON'T set hostel data from reservation - let Consumer API determine this
        // The Consumer API should be the source of truth for hostel data
        
        dispatch(setReservationLoading(false));
        return { hasReservation: true, reservation: latestReservation, allReservations: data.reservations };
      }
      
      dispatch(setReservationLoading(false));
      return { hasReservation: false };
    } catch (error) {
      dispatch(setReservationLoading(false));
      dispatch(setReservationError(error.message));
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all hostels
export const fetchAllHostels = createAsyncThunk(
  'hostel/fetchAllHostels',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      if (!auth.token) {
        throw new Error('No authentication token');
      }

      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await fetch(buildApiUrl(API_ENDPOINTS.HOSTELS), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      dispatch(setAllHostels(data));
      dispatch(setLoading(false));
      
      return data;
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all reservations for availability calculation
export const fetchAllReservations = createAsyncThunk(
  'reservation/fetchAllReservations',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      if (!auth.token) {
        throw new Error('No authentication token');
      }

      dispatch(setReservationLoading(true));
      dispatch(setReservationError(null));

      const response = await fetch(buildApiUrl(API_ENDPOINTS.RESERVATIONS_LIST), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${auth.token}`,
        },
      });

      if (response.status === 404) {
        dispatch(setAllReservations([]));
        dispatch(setReservationLoading(false));
        return { reservations: [] };
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const reservations = data.reservations || [];
      
      dispatch(setAllReservations(reservations));
      dispatch(setReservationLoading(false));
      
      return { reservations };
    } catch (error) {
      dispatch(setReservationLoading(false));
      dispatch(setReservationError(error.message));
      return rejectWithValue(error.message);
    }
  }
);

// Fetch available profiles for the user
export const fetchAvailableProfiles = createAsyncThunk(
  'hostel/fetchAvailableProfiles',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      if (!auth.token) {
        throw new Error('No authentication token');
      }

      dispatch(setLoading(true));
      dispatch(clearError());

      // For now, return mock profiles
      // In a real implementation, you'd fetch from API
      const mockProfiles = [
        {
          id: 'consumer',
          type: 'consumer',
          name: 'Student Profile',
          description: 'View as student/consumer',
          active: true,
          endpoint: '/hq/api/payments/consumer_request/'
        },
        {
          id: 'manager',
          type: 'manager', 
          name: 'Manager Profile',
          description: 'Manage hostels',
          active: false,
          endpoint: '/hq/api/manager/profile/'
        },
        {
          id: 'admin',
          type: 'admin',
          name: 'Admin Profile', 
          description: 'System administration',
          active: false,
          endpoint: '/hq/api/admin/profile/'
        }
      ];

      dispatch(setAvailableProfiles(mockProfiles));
      dispatch(setLoading(false));
      return mockProfiles;
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    }
  }
);
