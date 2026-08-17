import { useState, useCallback } from 'react'
import { searchListings, searchStores, searchProducts } from '../services/searchService'

/**
 * Custom hook for search functionality
 * @param {object} options - Search options
 * @returns {object} { search, searchStores, searchProducts, results, loading, error }
 */
export const useSearch = (options = {}) => {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (query = '', filters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const searchResults = await searchListings(query, filters)
      setResults(searchResults)
      return searchResults
    } catch (err) {
      console.error('Error searching listings:', err)
      const errorMessage = err.message || 'Failed to search listings'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const searchStoresOnly = useCallback(async (query = '', filters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const searchResults = await searchStores(query, filters)
      setResults(searchResults)
      return searchResults
    } catch (err) {
      console.error('Error searching stores:', err)
      const errorMessage = err.message || 'Failed to search stores'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const searchProductsOnly = useCallback(async (query = '', filters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const searchResults = await searchProducts(query, filters)
      setResults(searchResults)
      return searchResults
    } catch (err) {
      console.error('Error searching products:', err)
      const errorMessage = err.message || 'Failed to search products'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    search,
    searchStores: searchStoresOnly,
    searchProducts: searchProductsOnly,
    results,
    loading,
    error,
  }
}


