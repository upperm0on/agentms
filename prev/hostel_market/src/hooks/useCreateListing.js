import { useState, useCallback } from 'react'
import { createListing as createListingAPI } from '../services/marketplaceService'

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on 4xx errors (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error
      }
      
      if (attempt === maxRetries) {
        throw error
      }
      
      const delay = initialDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Custom hook for creating listings with retry mechanism
 * @returns {object} { createListing, loading, error, retry, retryCount }
 */
export const useCreateListing = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [lastListingData, setLastListingData] = useState(null)

  const createListing = useCallback(async (listingData, useRetry = false) => {
    setLoading(true)
    setError(null)
    setLastListingData(listingData)
    
    const createFn = async () => {
      // If listingData contains image files, they should be uploaded first
      // This will be handled by image upload service integration
      const createdListing = await createListingAPI(listingData)
      setRetryCount(0) // Reset retry count on success
      return createdListing
    }
    
    try {
      if (useRetry) {
        return await retryWithBackoff(createFn, 3, 1000)
      } else {
        return await createFn()
      }
    } catch (err) {
      console.error('Error creating listing:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create listing'
      setError(errorMessage)
      setRetryCount(prev => prev + 1)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const retry = useCallback(() => {
    if (lastListingData) {
      return createListing(lastListingData, true)
    }
    throw new Error('No listing data to retry')
  }, [lastListingData, createListing])

  return {
    createListing,
    loading,
    error,
    retry,
    retryCount,
  }
}


