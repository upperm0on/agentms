import { apiClient, buildQuery } from '../utils/apiClient'

/**
 * Search listings with query and filters
 * @param {string} query - Search query string
 * @param {object} filters - Filter options (category, type, price range, etc.)
 * @returns {Promise} Search results with stores and products
 */
export const searchListings = async (query = '', filters = {}) => {
  try {
    const params = {
      q: query,
      ...filters,
    }
    
    const queryString = buildQuery(params)
    
    // Try marketplace listings endpoint first
    // If backend has dedicated search endpoint, use: /hq/api/marketplace/search/
    const endpoint = '/hq/api/marketplace/listings/' + queryString
    
    const response = await apiClient.get(endpoint)
    return response.data
  } catch (error) {
    console.error('Failed to search listings:', error)
    throw error
  }
}

/**
 * Search stores with query and filters
 * @param {string} query - Search query string
 * @param {object} filters - Filter options
 * @returns {Promise} Search results with stores
 */
export const searchStores = async (query = '', filters = {}) => {
  try {
    const params = {
      q: query,
      type: 'store',
      ...filters,
    }
    
    const queryString = buildQuery(params)
    const endpoint = '/hq/api/marketplace/listings/' + queryString
    
    const response = await apiClient.get(endpoint)
    return response.data
  } catch (error) {
    console.error('Failed to search stores:', error)
    throw error
  }
}

/**
 * Search products/services with query and filters
 * @param {string} query - Search query string
 * @param {object} filters - Filter options
 * @returns {Promise} Search results with products/services
 */
export const searchProducts = async (query = '', filters = {}) => {
  try {
    const params = {
      q: query,
      ...filters,
    }
    
    const queryString = buildQuery(params)
    const endpoint = '/hq/api/marketplace/listings/' + queryString
    
    const response = await apiClient.get(endpoint)
    return response.data
  } catch (error) {
    console.error('Failed to search products:', error)
    throw error
  }
}


