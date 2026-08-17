import { apiClient } from '../utils/apiClient'

/**
 * Fetch current user's store
 * @returns {Promise} Store data
 */
export const fetchStore = async () => {
  try {
    // API path is relative to baseURL (which already includes /hq/api)
    const response = await apiClient.get('/marketplace/store/me/')
    // API returns { store: {...}, entrepreneur: {...} }
    // Return the store object
    return response.data?.store || response.data
  } catch (error) {
    console.error('Failed to fetch store:', error)
    throw error
  }
}

/**
 * Fetch store's products
 * @returns {Promise} Array of products
 */
export const fetchStoreProducts = async () => {
  try {
    // API path is relative to baseURL (which already includes /hq/api)
    const response = await apiClient.get('/marketplace/products/')
    // API returns { products: [...], count: ... }
    // Return the products array
    return response.data?.products || response.data
  } catch (error) {
    console.error('Failed to fetch store products:', error)
    throw error
  }
}

/**
 * Update store settings
 * @param {object} settingsData - Store settings data
 * @returns {Promise} Updated store data
 */
export const updateStoreSettings = async (settingsData) => {
  try {
    // API path is relative to baseURL (which already includes /hq/api)
    const response = await apiClient.put('/marketplace/store/settings/', settingsData)
    return response.data
  } catch (error) {
    console.error('Failed to update store settings:', error)
    throw error
  }
}

/**
 * Create new listing (product or service)
 * @param {object} listingData - Listing data including name, description, price, type, etc.
 * @returns {Promise} Created listing data
 */
export const createListing = async (listingData) => {
  try {
    // API path is relative to baseURL (which already includes /hq/api)
    const response = await apiClient.post('/marketplace/listings/create/', listingData)
    return response.data
  } catch (error) {
    console.error('Failed to create listing:', error)
    throw error
  }
}

/**
 * Update existing listing (product or service)
 * @param {number} commodityId - Commodity ID
 * @param {object} listingData - Listing data including name, description, price, type, etc.
 * @returns {Promise} Updated listing data
 */
export const updateListing = async (commodityId, listingData) => {
  try {
    // API path is relative to baseURL (which already includes /hq/api)
    const response = await apiClient.put(`/marketplace/listings/${commodityId}/update/`, listingData)
    return response.data
  } catch (error) {
    console.error('Failed to update listing:', error)
    throw error
  }
}

/**
 * Contact seller about a product
 * @param {string|number} productId - Product ID
 * @param {string} message - Message to send
 * @returns {Promise} Response data
 */
export const contactSeller = async (productId, message) => {
  try {
    // API path is relative to baseURL (which already includes /hq/api)
    const response = await apiClient.post('/marketplace/contact/', {
      product_id: productId,
      message: message,
    })
    return response.data
  } catch (error) {
    console.error('Failed to contact seller:', error)
    throw error
  }
}


