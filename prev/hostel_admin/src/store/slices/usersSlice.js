import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { usersAPI } from '../../services/api'

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await usersAPI.create(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user')
    }
  }
)

export const fetchManagers = createAsyncThunk(
  'users/fetchManagers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getManagers()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch managers')
    }
  }
)

export const fetchTenants = createAsyncThunk(
  'users/fetchTenants',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getTenants()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenants')
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.update(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await usersAPI.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user')
    }
  }
)

const initialState = {
  users: [],
  managers: [],
  tenants: [],
  currentUser: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {
    search: '',
    role: 'all',
    status: 'all',
  },
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        role: 'all',
        status: 'all',
      }
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload.results || action.payload
        state.totalCount = action.payload.count || action.payload.length
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.users.unshift(action.payload)
        state.totalCount += 1
        state.error = null
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch managers
      .addCase(fetchManagers.fulfilled, (state, action) => {
        state.managers = action.payload.results || action.payload
      })
      // Fetch tenants
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.tenants = action.payload.results || action.payload
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.users.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = state.users.filter(user => user.id !== action.payload)
        state.totalCount -= 1
        state.error = null
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, clearFilters, setCurrentUser, clearError } = usersSlice.actions
export default usersSlice.reducer
