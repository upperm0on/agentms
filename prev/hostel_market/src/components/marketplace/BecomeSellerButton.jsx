import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Store, Settings } from 'lucide-react'
import './BecomeSellerButton.css'

function BecomeSellerButton({ variant = 'default', size = 'md', className = '', asLink = false }) {
  const navigate = useNavigate()
  const { isAuthenticated, role, entrepreneur } = useSelector(state => state.auth)
  
  // Check if user has a store
  const hasStore = !!(entrepreneur?.store || entrepreneur?.store_id)

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // If user has a store, show "Manage Store" button
  if (hasStore) {
    const handleManageClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log('Manage Store button clicked, navigating to /my-store')
      navigate('/my-store')
    }

    if (asLink) {
      return (
        <button
          onClick={handleManageClick}
          className={`manage-store-link ${className}`}
        >
          <Settings size={16} />
          <span>Manage Store</span>
        </button>
      )
    }

    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleManageClick}
        className={`manage-store-btn ${className}`}
      >
        <Settings size={16} />
        <span>Manage Store</span>
      </Button>
    )
  }

  // If user doesn't have a store, show "Open Store" button
  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Open Store button clicked, navigating to /open-store')
    navigate('/open-store')
  }

  if (asLink) {
    return (
      <button
        onClick={handleClick}
        className={`open-store-link ${className}`}
      >
        <Store size={16} />
        <span>Open Your Store</span>
      </button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`open-store-btn ${className}`}
    >
      <Store size={16} />
      <span>Open Your Store</span>
    </Button>
  )
}

export default BecomeSellerButton

