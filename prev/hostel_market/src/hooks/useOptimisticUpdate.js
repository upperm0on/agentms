import { useState, useCallback } from 'react'

/**
 * Generic hook for optimistic updates
 * Updates UI immediately, then syncs with server
 * 
 * @param {Array} initialData - Initial data array
 * @param {Function} onUpdate - Function to call for actual update (returns Promise)
 * @returns {Object} { data, update, loading, error, revert }
 * 
 * @example
 * const { data, update, loading, error } = useOptimisticUpdate(products, updateProduct)
 * 
 * // Update item optimistically
 * await update(itemId, newData)
 */
export function useOptimisticUpdate(initialData = [], onUpdate = null) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Map())

  // Sync with initial data when it changes
  useState(() => {
    if (initialData && initialData.length >= 0) {
      setData(initialData)
    }
  }, [initialData])

  const update = useCallback(async (itemId, newData, operation = 'update') => {
    setLoading(true)
    setError(null)

    // Find the item to update
    const itemIndex = data.findIndex(item => item.id === itemId)
    if (itemIndex === -1 && operation !== 'create') {
      setError('Item not found')
      setLoading(false)
      return
    }

    let previousData = null
    let optimisticData = null

    // Perform optimistic update
    if (operation === 'create') {
      // Add new item optimistically
      optimisticData = {
        ...newData,
        id: newData.id || `temp-${Date.now()}`,
        _optimistic: true,
      }
      setData(prev => [optimisticData, ...prev])
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev)
        newMap.set(optimisticData.id, { operation: 'create', data: optimisticData })
        return newMap
      })
    } else if (operation === 'update') {
      // Update item optimistically
      previousData = data[itemIndex]
      optimisticData = { ...previousData, ...newData, _optimistic: true }
      setData(prev => prev.map((item, idx) => idx === itemIndex ? optimisticData : item))
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev)
        newMap.set(itemId, { operation: 'update', data: optimisticData, previous: previousData })
        return newMap
      })
    } else if (operation === 'delete') {
      // Remove item optimistically
      previousData = data[itemIndex]
      setData(prev => prev.filter(item => item.id !== itemId))
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev)
        newMap.set(itemId, { operation: 'delete', data: previousData })
        return newMap
      })
    }

    // Perform actual update
    if (onUpdate) {
      try {
        const result = await onUpdate(itemId, newData, operation)
        
        // Replace optimistic update with real data
        if (operation === 'create') {
          setData(prev => prev.map(item => 
            item.id === optimisticData.id ? result : item
          ))
        } else if (operation === 'update') {
          setData(prev => prev.map(item => 
            item.id === itemId ? result : item
          ))
        }
        // For delete, data is already removed

        // Clear optimistic update
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev)
          newMap.delete(itemId)
          return newMap
        })

        setLoading(false)
        return result
      } catch (err) {
        // Revert optimistic update on error
        if (operation === 'create') {
          setData(prev => prev.filter(item => item.id !== optimisticData.id))
        } else if (operation === 'update') {
          setData(prev => prev.map((item, idx) => 
            idx === itemIndex ? previousData : item
          ))
        } else if (operation === 'delete') {
          setData(prev => {
            const newData = [...prev]
            newData.splice(itemIndex, 0, previousData)
            return newData
          })
        }

        // Clear optimistic update
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev)
          newMap.delete(itemId)
          return newMap
        })

        setError(err.message || 'Update failed')
        setLoading(false)
        throw err
      }
    } else {
      setLoading(false)
      return optimisticData
    }
  }, [data, onUpdate])

  const revert = useCallback((itemId) => {
    const update = optimisticUpdates.get(itemId)
    if (!update) return

    if (update.operation === 'create') {
      setData(prev => prev.filter(item => item.id !== itemId))
    } else if (update.operation === 'update') {
      setData(prev => prev.map(item => 
        item.id === itemId ? update.previous : item
      ))
    } else if (update.operation === 'delete') {
      setData(prev => {
        const newData = [...prev]
        const index = newData.findIndex(item => item.id === itemId)
        if (index === -1) {
          newData.push(update.data)
        }
        return newData
      })
    }

    setOptimisticUpdates(prev => {
      const newMap = new Map(prev)
      newMap.delete(itemId)
      return newMap
    })
  }, [optimisticUpdates])

  return {
    data,
    update,
    loading,
    error,
    revert,
    optimisticUpdates: Array.from(optimisticUpdates.values()),
  }
}


