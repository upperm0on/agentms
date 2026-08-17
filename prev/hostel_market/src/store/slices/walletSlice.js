import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../../utils/apiClient'

const initialState = {
  balance: 0,
  escrowBalance: 0,
  transactions: [],
  payoutRequests: [],
  loading: false,
  error: null,
}

export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/wallet')
      return data
    } catch (err) {
      // Silently handle 404s - endpoint not implemented yet
      if (err?.status === 404 && err?.silent) {
        // Return default values as fulfilled result
        return { balance: 0, escrow: 0, transactions: [] }
      }
      // Only reject for non-404 errors
      if (err?.status !== 404) {
        return rejectWithValue(err)
      }
      // For 404s, return default values
      return { balance: 0, escrow: 0, transactions: [] }
    }
  }
)

export const withdraw = createAsyncThunk(
  'wallet/withdraw',
  async (amount, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/wallet/withdraw', { amount })
      return data
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload
    },
    setEscrowBalance: (state, action) => {
      state.escrowBalance = action.payload
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload
    },
    setPayoutRequests: (state, action) => {
      state.payoutRequests = action.payload
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false
        state.balance = action.payload?.balance || 0
        state.escrowBalance = action.payload?.escrow || 0
        state.transactions = Array.isArray(action.payload?.transactions) ? action.payload.transactions : []
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to fetch wallet'
      })
      .addCase(withdraw.fulfilled, (state, action) => {
        state.balance = action.payload?.balance || 0
        state.escrowBalance = action.payload?.escrow || 0
        state.transactions = Array.isArray(action.payload?.transactions) ? action.payload.transactions : []
      })
  }
})

export const {
  setBalance,
  setEscrowBalance,
  setTransactions,
  setPayoutRequests,
  addTransaction,
  setLoading,
  setError,
} = walletSlice.actions

export default walletSlice.reducer

