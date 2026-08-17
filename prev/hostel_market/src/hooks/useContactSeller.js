import { useState } from 'react'
import { contactSeller as contactSellerAPI } from '../services/marketplaceService'

/**
 * Custom hook for contacting sellers
 * @returns {object} { sendMessage, loading, error }
 */
export const useContactSeller = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = async (productId, message) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await contactSellerAPI(productId, message)
      return response
    } catch (err) {
      console.error('Error contacting seller:', err)
      const errorMessage = err.message || 'Failed to send message'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    sendMessage,
    loading,
    error,
  }
}


