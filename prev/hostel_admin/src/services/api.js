import axios from 'axios'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  // Add retry configuration
  retry: 3,
  retryDelay: 1000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle broken pipe and connection errors
    if (error.code === 'ECONNRESET' || error.code === 'EPIPE' || error.message.includes('Broken pipe')) {
      console.warn('Connection error detected, retrying...', error.message)
      
      // Retry logic for connection errors
      if (!originalRequest._retry && originalRequest._retryCount < 3) {
        originalRequest._retry = true
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount))
        
        return api(originalRequest)
      }
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - Authentication required')
      // Don't redirect automatically, let components handle it
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      error.message = 'Network error. Please check your connection and try again.'
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/hq/api/login/', credentials),
  logout: () => api.post('/authenticate/logout/'),
  getProfile: () => api.get('/hq/api/landing_page/'),
}

// Hostels API - Admin access to ALL hostels
export const hostelsAPI = {
  getAll: (params = {}) => api.get('/hq/api/hostels/', { params }),
  getById: (id) => api.get(`/hq/detail_hostel/${id}/`),
  create: (data) => api.post('/hq/api/manager/create_hostel/', data),
  update: (id, data) => api.post('/hq/api/manager/update_or_create/', { ...data, id }),
  delete: (id) => api.delete(`/hq/update_hostel/${id}/`),
  getStats: () => api.get('/hq/api/manager/tenants/'),
}

// Users API - Admin access to ALL users
export const usersAPI = {
  getAll: (params = {}) => api.get('/hq/api/manager/tenants/', { params }), // All tenants
  getById: (id) => api.get(`/hq/api/manager/tenants/${id}/`),
  create: (data) => api.post('/hq/api/manager/tenants/', data),
  getManagers: (params = {}) => api.get('/hq/api/manager/tenants/', { params }),
  getTenants: (params = {}) => api.get('/hq/api/manager/tenants/', { params }),
  update: (id, data) => api.put(`/hq/api/manager/tenants/${id}/`, data),
  delete: (id) => api.delete(`/hq/api/manager/tenants/${id}/`),
  getStats: () => api.get('/hq/api/manager/tenants/'),
}

// Reservations API
export const reservationsAPI = {
  getAll: (params = {}) => api.get('/hq/api/manager/reservations/', { params }),
  getById: (id) => api.get(`/hq/api/manager/reservations/${id}/`),
  update: (id, data) => api.put(`/hq/api/manager/reservations/${id}/`, data),
  cancel: (id) => api.post(`/hq/api/manager/reservations/cancel/`, { reservation_id: id }),
  confirmPayment: (id) => api.post(`/hq/api/manager/reservations/confirm-payment/`, { reservation_id: id }),
  getStats: () => api.get('/hq/api/manager/reservations/'),
}

// Analytics API - Using existing endpoints for now
export const analyticsAPI = {
  getOverview: () => api.get('/hq/api/landing_page/'),
  getRevenueData: (dateRange) => api.get('/hq/api/manager/payments/'),
  getOccupancyData: (dateRange) => api.get('/hq/api/hostels/'),
  getUserGrowthData: (dateRange) => api.get('/hq/api/manager/tenants/'),
  getHostelPerformance: () => api.get('/hq/api/hostels/'),
}

// Payments API
export const paymentsAPI = {
  getAll: (params = {}) => api.get('/hq/api/manager/payments/', { params }),
  getById: (id) => api.get(`/hq/api/manager/payments/${id}/`),
  getStats: () => api.get('/hq/api/manager/payments/'),
  getByHostel: (hostelId) => api.get(`/hq/api/manager/payments/?hostel=${hostelId}`),
}

// Reviews API
export const reviewsAPI = {
  getAll: (params = {}) => api.get('/hq/api/reviews/', { params }),
  getById: (id) => api.get(`/hq/api/reviews/${id}/`),
  update: (id, data) => api.post(`/hq/api/reviews/`, { ...data, id }),
  delete: (id) => api.post(`/hq/api/reviews/`, { action: 'delete', id }),
  getStats: () => api.get('/hq/api/reviews/'),
}

// Settings API - Using landing page for now
export const settingsAPI = {
  get: () => api.get('/hq/api/landing_page/'),
  update: (data) => api.post('/hq/api/landing_page/', data),
  getSystemInfo: () => api.get('/hq/api/landing_page/'),
}

export default api
