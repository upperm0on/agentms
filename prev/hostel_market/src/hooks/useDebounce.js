import { useState, useEffect } from 'react'

/**
 * Custom hook for debouncing values
 * Useful for search inputs, form validation, etc.
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {any} The debounced value
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('')
 * const debouncedQuery = useDebounce(searchQuery, 300)
 * 
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     performSearch(debouncedQuery)
 *   }
 * }, [debouncedQuery])
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    // Set up timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    // Clean up timeout if value changes before delay completes
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}


