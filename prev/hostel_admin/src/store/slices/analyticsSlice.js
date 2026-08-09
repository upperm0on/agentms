import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dynamicDbAPI } from '../../services/adminApi'

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch real data from multiple tables
      const [hostelsResponse, consumersResponse, managersResponse, reservationsResponse, paymentsResponse] = await Promise.all([
        dynamicDbAPI.getTableData('hq', 'hostel', { page_size: 1 }),
        dynamicDbAPI.getTableData('consumers', 'consumer', { page_size: 1 }),
        dynamicDbAPI.getTableData('managers', 'manager', { page_size: 1 }),
        dynamicDbAPI.getTableData('reservations', 'reservation', { page_size: 1 }),
        dynamicDbAPI.getTableData('payments', 'payment', { page_size: 1 })
      ])

      const totalHostels = hostelsResponse.data.success ? hostelsResponse.data.pagination.total_count : 0
      const totalConsumers = consumersResponse.data.success ? consumersResponse.data.pagination.total_count : 0
      const totalManagers = managersResponse.data.success ? managersResponse.data.pagination.total_count : 0
      const totalReservations = reservationsResponse.data.success ? reservationsResponse.data.pagination.total_count : 0
      const totalPayments = paymentsResponse.data.success ? paymentsResponse.data.pagination.total_count : 0

      // Calculate total revenue from payments
      let totalRevenue = 0
      if (paymentsResponse.data.success && paymentsResponse.data.data.length > 0) {
        totalRevenue = paymentsResponse.data.data.reduce((sum, payment) => {
          return sum + (parseFloat(payment.amount) || 0)
        }, 0)
      }

      // Calculate occupancy rate (simplified)
      const occupancyRate = totalReservations > 0 ? Math.min(100, (totalReservations / totalHostels) * 10) : 0

      return {
        totalHostels,
        totalUsers: totalConsumers + totalManagers,
        totalReservations,
        totalRevenue,
        occupancyRate: Math.round(occupancyRate),
        growthRate: 0, // Will be calculated based on historical data
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      return rejectWithValue(error.message)
    }
  }
)

export const fetchRevenueData = createAsyncThunk(
  'analytics/fetchRevenueData',
  async (dateRange, { rejectWithValue }) => {
    try {
      const response = await dynamicDbAPI.getTableData('payments', 'payment', { page_size: 100 })
      if (response.data.success) {
        // Group payments by month for the last 6 months
        const payments = response.data.data
        const monthlyRevenue = {}
        
        payments.forEach(payment => {
          if (payment.date_created) {
            const date = new Date(payment.date_created)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            
            if (!monthlyRevenue[monthKey]) {
              monthlyRevenue[monthKey] = { month: monthName, revenue: 0 }
            }
            monthlyRevenue[monthKey].revenue += parseFloat(payment.amount) || 0
          }
        })
        
        return Object.values(monthlyRevenue).sort((a, b) => a.month.localeCompare(b.month))
      }
      return []
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      return []
    }
  }
)

export const fetchOccupancyData = createAsyncThunk(
  'analytics/fetchOccupancyData',
  async (dateRange, { rejectWithValue }) => {
    try {
      const response = await dynamicDbAPI.getTableData('reservations', 'reservation', { page_size: 100 })
      if (response.data.success) {
        // Group reservations by month for occupancy calculation
        const reservations = response.data.data
        const monthlyOccupancy = {}
        
        reservations.forEach(reservation => {
          if (reservation.date_created) {
            const date = new Date(reservation.date_created)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            
            if (!monthlyOccupancy[monthKey]) {
              monthlyOccupancy[monthKey] = { month: monthName, occupancy: 0, count: 0 }
            }
            monthlyOccupancy[monthKey].count += 1
            // Simplified occupancy calculation
            monthlyOccupancy[monthKey].occupancy = Math.min(100, monthlyOccupancy[monthKey].count * 5)
          }
        })
        
        return Object.values(monthlyOccupancy).sort((a, b) => a.month.localeCompare(b.month))
      }
      return []
    } catch (error) {
      console.error('Error fetching occupancy data:', error)
      return []
    }
  }
)

export const fetchUserGrowthData = createAsyncThunk(
  'analytics/fetchUserGrowthData',
  async (dateRange, { rejectWithValue }) => {
    try {
      const [consumersResponse, managersResponse] = await Promise.all([
        dynamicDbAPI.getTableData('consumers', 'consumer', { page_size: 100 }),
        dynamicDbAPI.getTableData('managers', 'manager', { page_size: 100 })
      ])
      
      if (consumersResponse.data.success && managersResponse.data.success) {
        const allUsers = [...consumersResponse.data.data, ...managersResponse.data.data]
        const monthlyUsers = {}
        
        allUsers.forEach(user => {
          if (user.date_created) {
            const date = new Date(user.date_created)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            
            if (!monthlyUsers[monthKey]) {
              monthlyUsers[monthKey] = { month: monthName, users: 0 }
            }
            monthlyUsers[monthKey].users += 1
          }
        })
        
        return Object.values(monthlyUsers).sort((a, b) => a.month.localeCompare(b.month))
      }
      return []
    } catch (error) {
      console.error('Error fetching user growth data:', error)
      return []
    }
  }
)

const initialState = {
  overview: {
    totalHostels: 0,
    totalUsers: 0,
    totalReservations: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    growthRate: 0,
  },
  revenueData: [],
  occupancyData: [],
  userGrowthData: [],
  isLoading: false,
  error: null,
  dateRange: '30d',
}

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch analytics overview
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false
        state.overview = action.payload
        state.error = null
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch revenue data
      .addCase(fetchRevenueData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRevenueData.fulfilled, (state, action) => {
        state.isLoading = false
        state.revenueData = action.payload
        state.error = null
      })
      .addCase(fetchRevenueData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch occupancy data
      .addCase(fetchOccupancyData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOccupancyData.fulfilled, (state, action) => {
        state.isLoading = false
        state.occupancyData = action.payload
        state.error = null
      })
      .addCase(fetchOccupancyData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch user growth data
      .addCase(fetchUserGrowthData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserGrowthData.fulfilled, (state, action) => {
        state.isLoading = false
        state.userGrowthData = action.payload
        state.error = null
      })
      .addCase(fetchUserGrowthData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setDateRange, clearError } = analyticsSlice.actions
export default analyticsSlice.reducer