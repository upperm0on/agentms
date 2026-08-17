import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import StoreDashboard from '../components/store/StoreDashboard'
import { useStoreData } from '../hooks/useStoreData'
import { SkeletonProduct } from '../components/ui/Skeleton'
import { useToast } from '../contexts/ToastContext'
import { addProduct, updateProduct, removeProduct } from '../store/slices/marketplaceSlice'
import { createListing, updateListing } from '../services/marketplaceService'
import { LogIn, RefreshCw } from 'lucide-react'

function MyStore() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { success, error: showError } = useToast()
  const { isAuthenticated, role, entrepreneur } = useSelector(state => state.auth)
  const isSeller = role === 'seller'
  const { store: hookStore, products: hookProducts, loading: hookLoading, error: hookError, refetch } = useStoreData()
  
  // Local state for optimistic updates
  const [optimisticProducts, setOptimisticProducts] = useState([])
  
  // Determine store - prefer hook data, fallback to entrepreneur data
  const store = hookStore || entrepreneur?.store || (entrepreneur?.store_id ? { id: entrepreneur.store_id } : null)
  const hasStore = !!store || !!(entrepreneur?.store || entrepreneur?.store_id)
  
  // Merge hook products with optimistic updates
  useEffect(() => {
    if (hookProducts && hookProducts.length >= 0) {
      // Remove optimistic items that are now in hook data
      setOptimisticProducts(prev => prev.filter(opt => {
        const existsInHook = hookProducts.some(hp => hp.id === opt.id || (opt._optimistic && hp.id === opt.id.replace('temp-', '')))
        return !existsInHook || opt._optimistic
      }))
    }
  }, [hookProducts])
  
  // Combine hook products with optimistic updates
  const products = React.useMemo(() => {
    const hookProductIds = new Set(hookProducts.map(p => p.id))
    const optimisticOnly = optimisticProducts.filter(p => !hookProductIds.has(p.id))
    return [...hookProducts, ...optimisticOnly]
  }, [hookProducts, optimisticProducts])

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '32px 0' }}>
        <h1 style={{ marginTop: 0 }}>My Store</h1>
        <p style={{ color: 'var(--color-muted-text)' }}>You need to log in to manage your store.</p>
        <Button onClick={() => navigate('/login')} aria-label="Login" title="Login">
          <LogIn size={18} />
          <span className="button-text">Login</span>
        </Button>
      </div>
    )
  }

  if (hookLoading && (!hookStore && hookProducts.length === 0)) {
    return (
      <div className="container" style={{ padding: '32px 0' }}>
        <h1 style={{ marginTop: 0 }}>My Store</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '24px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonProduct key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (hookError && !hasStore) {
    return (
      <div className="container" style={{ padding: '32px 0' }}>
        <h1 style={{ marginTop: 0 }}>My Store</h1>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: 12, borderRadius: 8 }}>
          {hookError}
        </div>
        <div style={{ marginTop: 12 }}>
          <Button variant="outline" onClick={() => refetch()} aria-label="Retry" title="Retry">
            <RefreshCw size={18} />
            <span className="button-text">Retry</span>
          </Button>
        </div>
      </div>
    )
  }

  // If user doesn't have a store, don't show MyStore page
  if (!hasStore) {
    return null
  }

  async function handleCreate(newItem) {
    // Optimistic update: Add item immediately
    const optimisticItem = {
      ...newItem,
      id: newItem.id || `temp-${Date.now()}`,
      _optimistic: true,
    }
    setOptimisticProducts(prev => [optimisticItem, ...prev])
    dispatch(addProduct(optimisticItem))
    
    try {
      // Actually create the listing on the backend
      console.log('[DEBUG] Creating listing with data:', newItem)
      const response = await createListing(newItem)
      console.log('[DEBUG] Created listing response:', response)
      
      // The API returns { status: 'success', product: {...} }
      const createdProduct = response?.product || response
      
      // Remove optimistic item and add the real one
      setOptimisticProducts(prev => prev.filter(p => p.id !== optimisticItem.id))
      dispatch(addProduct(createdProduct))
      
      // Refetch to sync with server
      await refetch()
      success('Item created successfully!')
    } catch (err) {
      console.error('[DEBUG] Failed to create listing:', err)
      // Revert on error
      setOptimisticProducts(prev => prev.filter(p => p.id !== optimisticItem.id))
      showError(err.response?.data?.message || err.message || 'Failed to create item. Please try again.')
    }
  }

  async function handleUpdate(updated) {
    // Optimistic update: Update item immediately
    setOptimisticProducts(prev => {
      const existing = prev.find(p => p.id === updated.id)
      if (existing) {
        return prev.map(p => p.id === updated.id ? { ...p, ...updated, _optimistic: true } : p)
      }
      return prev
    })
    dispatch(updateProduct(updated))
    
    // Call API to update listing
    try {
      const response = await updateListing(updated.id, {
        name: updated.name,
        description: updated.description,
        type: updated.type,
        price: updated.price,
        category_slug: updated.category_slug || updated.category,
        primary_image: updated.primary_image,
        primary_image_path: updated.primary_image_path,
        tags: updated.tags || [],
        stock_quantity: updated.stock_quantity,
      })
      
      // Update Redux with response data
      if (response?.product) {
        dispatch(updateProduct(response.product))
      }
      
      // Refetch to sync with server
      await refetch()
      setOptimisticProducts(prev => prev.filter(p => p.id !== updated.id))
      success('Item updated successfully!')
    } catch (err) {
      // Revert on error - refetch will restore original
      setOptimisticProducts(prev => prev.filter(p => p.id !== updated.id))
      showError(err.response?.data?.message || err.message || 'Failed to update item. Please try again.')
      // Refetch to restore original state
      await refetch()
    }
  }

  function handleDelete(id) {
    // Optimistic update: Remove item immediately
    const deletedItem = products.find(p => p.id === id)
    setOptimisticProducts(prev => prev.filter(p => p.id !== id))
    dispatch(removeProduct(id))
    
    // Refetch to sync with server
    refetch().then(() => {
      success('Item deleted successfully!')
    }).catch((err) => {
      // Revert on error - add item back
      if (deletedItem) {
        setOptimisticProducts(prev => [...prev, { ...deletedItem, _optimistic: true }])
        dispatch(addProduct(deletedItem))
      }
      showError(err.message || 'Failed to delete item. Please try again.')
    })
  }

  function handleUpdateStore(updatedStore) {
    // Refetch store data using hook
    refetch().then(() => {
      success('Store updated successfully!')
    }).catch((err) => {
      showError(err.message || 'Failed to update store. Please try again.')
    })
  }

  return (
    <StoreDashboard
      store={store}
      products={products}
      isSeller={isSeller}
      onCreateItem={handleCreate}
      onUpdateItem={handleUpdate}
      onDeleteItem={handleDelete}
      onUpdateStore={handleUpdateStore}
    />
  )
}

export default MyStore


