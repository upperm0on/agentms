import axios from 'axios'

// Placeholder endpoint for development - remove in production to use relative paths
const placeholder_endpoint = import.meta.env.DEV ? 'http://localhost:8000' : ''
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${placeholder_endpoint}/hq/api`

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 30000, // Increased timeout to 30 seconds for large requests
})

apiClient.interceptors.request.use((config) => {
  // Inject auth token if available
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error shape
    const status = error?.response?.status
    const errorData = error?.response?.data || {}
    const message = errorData?.message || errorData?.error || error.message || 'Request failed'
    const url = error?.config?.url || ''
    
    // Suppress 404 errors for endpoints that don't exist yet (orders, wallet)
    // These are expected during development - don't log to console
    if (status === 404 && (url.includes('/orders') || url.includes('/wallet'))) {
      // Silently handle 404s for these endpoints - they're not implemented yet
      // Suppress console error by not logging it
      return Promise.reject({ 
        status, 
        message, 
        silent: true, 
        url,
        response: { data: errorData },
        requires_verification: errorData?.requires_verification || false
      })
    }
    
    // Only log non-404 errors or 404s for other endpoints
    if (status !== 404) {
      console.error(`API Error [${status}]: ${message}`, { url })
    }
    
    // Return error with all relevant data
    return Promise.reject({ 
      status, 
      message, 
      url,
      response: { data: errorData, status },
      requires_verification: errorData?.requires_verification || false,
      account_verified: errorData?.account_verified !== undefined ? errorData.account_verified : undefined
    })
  }
)

export function buildQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)))
    } else {
      search.append(key, String(value))
    }
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}


