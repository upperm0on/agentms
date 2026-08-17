import { useState, useEffect, useCallback } from 'react'
import { fetchStore, fetchStoreProducts } from '../services/marketplaceService'

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 1000)
 * @returns {Promise} Result of the function
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
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Custom hook for fetching store and products data with retry mechanism
 * @returns {object} { store, products, loading, error, refetch, retry }
 */
export const useStoreData = () => {
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchData = useCallback(async (useRetry = false) => {
    setLoading(true)
    setError(null)
    
    const fetchFn = async () => {
      const [storeData, productsData] = await Promise.all([
        fetchStore(),
        fetchStoreProducts(),
      ])
      
      setStore(storeData)
      setProducts(Array.isArray(productsData) ? productsData : productsData?.results || [])
      setRetryCount(0) // Reset retry count on success
    }
    
    try {
      if (useRetry) {
        await retryWithBackoff(fetchFn, 3, 1000)
      } else {
        await fetchFn()
      }
    } catch (err) {
      console.error('Error fetching store data:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load store data'
      setError(errorMessage)
      setRetryCount(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }, [])

  const retry = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    store,
    products,
    loading,
    error,
    refetch: fetchData,
    retry,
    retryCount,
  }
}


