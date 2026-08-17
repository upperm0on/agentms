import axios from 'axios'

// Create a separate API instance for admin authentication
const getBaseURL = () => {
  // Check for production environment
  const isProduction = import.meta.env.PROD;
  
  // If VITE_API_BASE_URL is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // For production, use relative paths to avoid CORS issues
  if (isProduction) {
    return ''; // Use relative paths in production
  }
  
  // For development, use local API server on port 8080
  return 'http://localhost:8080';
};

const adminApi = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
adminApi.interceptors.request.use(
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
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - Authentication required')
      // Clear invalid token
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Admin Authentication API
export const adminAuthAPI = {
  login: (credentials) => adminApi.post('/hq/api/admin-login/', {
    ...credentials,
    is_admin: true
  }),
  logout: () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    window.location.href = '/login'
  },
  getProfile: () => adminApi.get('/hq/api/landing_page/'),
}

// Admin Data API
export const adminDataAPI = {
  // Hostels
  getHostels: (params = {}) => adminApi.get('/hq/api/hostels/', { params }),
  getHostelById: (id) => adminApi.get(`/hq/detail_hostel/${id}/`),
  createHostel: (data) => adminApi.post('/hq/api/manager/create_hostel/', data),
  updateHostel: (id, data) => adminApi.put(`/hq/api/manager/update_or_create/${id}/`, data),
  deleteHostel: (id) => adminApi.delete(`/hq/api/manager/delete_hostel/${id}/`),
  
  // Users/Tenants
  getUsers: (params = {}) => adminApi.get('/hq/api/manager/tenants/', { params }),
  getUserById: (id) => adminApi.get(`/hq/api/manager/tenants/${id}/`),
  createUser: (data) => adminApi.post('/hq/api/manager/tenants/', data),
  updateUser: (id, data) => adminApi.put(`/hq/api/manager/tenants/${id}/`, data),
  deleteUser: (id) => adminApi.delete(`/hq/api/manager/tenants/${id}/`),
  
  // Reservations
  getReservations: (params = {}) => adminApi.get('/hq/api/manager/reservations/', { params }),
  getReservationById: (id) => adminApi.get(`/hq/api/manager/reservations/${id}/`),
  updateReservation: (id, data) => adminApi.put(`/hq/api/manager/reservations/${id}/`, data),
  cancelReservation: (id) => adminApi.post('/hq/api/manager/reservations/cancel/', { reservation_id: id }),
  confirmPayment: (id) => adminApi.post('/hq/api/manager/reservations/confirm-payment/', { reservation_id: id }),
  
  // Analytics
  getAnalytics: () => adminApi.get('/hq/api/landing_page/'),
  getRevenueData: (dateRange) => adminApi.get('/hq/api/manager/payments/'),
  getOccupancyData: (dateRange) => adminApi.get('/hq/api/hostels/'),
  getUserGrowthData: (dateRange) => adminApi.get('/hq/api/manager/tenants/'),
  
  // Payments
  getPayments: (params = {}) => adminApi.get('/hq/api/manager/payments/', { params }),
  getPaymentById: (id) => adminApi.get(`/hq/api/manager/payments/${id}/`),
  
  // Reviews
  getReviews: (params = {}) => adminApi.get('/hq/api/reviews/', { params }),
  getReviewById: (id) => adminApi.get(`/hq/api/reviews/${id}/`),
  updateReview: (id, data) => adminApi.post('/hq/api/reviews/', { ...data, id }),
  deleteReview: (id) => adminApi.post('/hq/api/reviews/', { action: 'delete', id }),
}

// Dynamic Database Management API
export const dynamicDbAPI = {
  // Get all available tables
  getAllTables: () => adminApi.get('/hq/api/admin/tables/'),
  
  // Get table data with pagination and filtering
  getTableData: (appLabel, modelName, params = {}) => 
    adminApi.get(`/hq/api/admin/tables/${appLabel}/${modelName}/`, { params }),
  
  // Get table structure/schema
  getTableStructure: (appLabel, modelName) => 
    adminApi.get(`/hq/api/admin/tables/${appLabel}/${modelName}/structure/`),
  
  // Create new record
  createRecord: (appLabel, modelName, data) => 
    adminApi.post(`/hq/api/admin/tables/${appLabel}/${modelName}/create/`, data),
  
  // Update existing record
  updateRecord: (appLabel, modelName, recordId, data) => 
    adminApi.put(`/hq/api/admin/tables/${appLabel}/${modelName}/${recordId}/`, data),
  
  // Delete record
  deleteRecord: (appLabel, modelName, recordId) => 
    adminApi.delete(`/hq/api/admin/tables/${appLabel}/${modelName}/${recordId}/delete/`),
}

export default adminApi
