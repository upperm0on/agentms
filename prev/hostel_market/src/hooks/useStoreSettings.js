import { useState, useCallback } from 'react'
import { updateStoreSettings as updateSettings } from '../services/marketplaceService'

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
 * Custom hook for updating store settings with retry mechanism
 * @returns {object} { saveSettings, loading, error, retry, retryCount }
 */
export const useStoreSettings = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [lastSettings, setLastSettings] = useState(null)

  const saveSettings = useCallback(async (settingsData, useRetry = false) => {
    setLoading(true)
    setError(null)
    setLastSettings(settingsData)
    
    const saveFn = async () => {
      const updatedStore = await updateSettings(settingsData)
      setRetryCount(0) // Reset retry count on success
      return updatedStore
    }
    
    try {
      if (useRetry) {
        return await retryWithBackoff(saveFn, 3, 1000)
      } else {
        return await saveFn()
      }
    } catch (err) {
      console.error('Error updating store settings:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update store settings'
      setError(errorMessage)
      setRetryCount(prev => prev + 1)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const retry = useCallback(() => {
    if (lastSettings) {
      return saveSettings(lastSettings, true)
    }
    throw new Error('No settings to retry')
  }, [lastSettings, saveSettings])

  return {
    saveSettings,
    loading,
    error,
    retry,
    retryCount,
  }
}


