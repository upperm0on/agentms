import { apiClient } from '../utils/apiClient'

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} is_ent - Whether user is logging in as entrepreneur
 * @returns {Promise} Login response with token and user data
 */
export const login = async (email, password, is_ent = false) => {
  try {
    // Placeholder endpoint for development - remove in production to use relative paths
    const placeholder_endpoint = import.meta.env.DEV ? 'http://localhost:8000' : ''
    
    console.log(`Login request: email=${email}, is_ent=${is_ent}`)
    
    const response = await fetch(`${placeholder_endpoint}/hq/api/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        is_ent,
      }),
    })
    
    console.log(`Login response status: ${response.status}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }))
      console.error('Login error:', errorData)
      throw { message: errorData.error || 'Login failed', status: response.status }
    }
    
    const data = await response.json()
    console.log('Login successful:', { is_entrepreneur: data.is_entrepreneur, has_token: !!data.token })
    return data
  } catch (error) {
    console.error('Login fetch error:', error)
    throw error
  }
}

/**
 * Create store (open store - creates store, entrepreneur, and commodities)
 * @param {string} token - Auth token
 * @param {object} storeData - Store data including name, description, location, and commodities
 * @returns {Promise} Created store and entrepreneur data
 */
export const createStore = async (token, storeData) => {
  try {
    // Create store endpoint
    // POST /hq/api/store/create/
    // Vite proxy handles /hq/api routes to localhost:8000
    console.log('=== createStore function called ===')
    console.log('Token:', token ? token.substring(0, 10) + '...' : 'NO TOKEN')
    console.log('Store data:', storeData)
    
    // Placeholder endpoint for development - remove in production to use relative paths
    const placeholder_endpoint = import.meta.env.DEV ? 'http://localhost:8000' : ''
    const url = `${placeholder_endpoint}/hq/api/store/create/`
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    }
    
    console.log('=== Making fetch request ===')
    console.log('URL:', url)
    console.log('Method: POST')
    console.log('Headers:', headers)
    console.log('Body:', JSON.stringify(storeData))
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(storeData),
    })
    
    console.log('=== Fetch response received ===')
    console.log('Status:', response.status)
    console.log('Status text:', response.statusText)
    console.log('OK:', response.ok)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create store' }))
      console.error('=== Store creation error response ===', errorData)
      throw { 
        message: errorData.error || errorData.message || 'Failed to open store', 
        status: response.status,
        response: errorData
      }
    }
    
    const data = await response.json()
    console.log('=== Store created successfully ===', data)
    return data
  } catch (error) {
    console.error('=== Store creation fetch error ===', error)
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    throw error
  }
}

/**
 * Check if user is an entrepreneur by trying entrepreneur login
 * Note: This requires email and password, so it's not ideal
 * Alternative: Use checkEntrepreneurWithToken if endpoint exists
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Entrepreneur data if exists, null otherwise
 */
export const checkEntrepreneur = async (email, password) => {
  try {
    // Try entrepreneur login to check if user is entrepreneur
    const loginData = await login(email, password, true)
    if (loginData.is_entrepreneur && loginData.entrepreneur) {
      return loginData.entrepreneur
    }
    return null
  } catch (error) {
    // If login fails, user is not an entrepreneur
    if (error.status === 403 || error.message?.includes('not an entrepreneur')) {
      return null
    }
    throw error
  }
}

/**
 * Check if user is an entrepreneur using token
 * Uses the /hq/api/entrepreneur/me/ endpoint
 * @param {string} token - Auth token
 * @returns {Promise} Object with is_entrepreneur, entrepreneur, and store data, or null if not entrepreneur
 */
export const checkEntrepreneurWithToken = async (token) => {
  try {
    // Placeholder endpoint for development - remove in production to use relative paths
    const placeholder_endpoint = import.meta.env.DEV ? 'http://localhost:8000' : ''
    
    // Check if user is entrepreneur
    const response = await fetch(`${placeholder_endpoint}/hq/api/entrepreneur/me/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
    
    if (!response.ok) {
      // If 404 or other error, user is not an entrepreneur
      if (response.status === 404 || response.status === 403) {
        return { is_entrepreneur: false, entrepreneur: null, store: null }
      }
      throw { message: 'Failed to check entrepreneur status', status: response.status }
    }
    
    const data = await response.json()
    // Backend returns: { is_entrepreneur: true/false, entrepreneur: {...}, store: {...} }
    return data
  } catch (error) {
    // If 404 or 403, user is not an entrepreneur
    if (error.status === 404 || error.status === 403) {
      return { is_entrepreneur: false, entrepreneur: null, store: null }
    }
    console.error('Error checking entrepreneur status:', error)
    throw error
  }
}

