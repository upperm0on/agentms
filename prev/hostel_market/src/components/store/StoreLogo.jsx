import React from 'react'
import { Store } from 'lucide-react'
import './StoreLogo.css'

/**
 * Reusable StoreLogo component
 * Displays store logo image with fallback icon
 * @param {Object} props
 * @param {string} props.logoUrl - Logo image URL
 * @param {string} props.logo - Alternative logo prop name
 * @param {string} props.alt - Alt text for image
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.size - Logo size in pixels (default: 72)
 * @param {boolean} props.circular - Whether logo should be circular (default: true)
 */
function StoreLogo({ 
  logoUrl, 
  logo, 
  alt = 'Store logo', 
  className = '', 
  size = 72,
  circular = true
}) {
  const imageUrl = logoUrl || logo
  
  // Handle different URL formats
  const finalImageUrl = imageUrl ? (
    imageUrl.startsWith('http') || imageUrl.startsWith('/') 
      ? imageUrl 
      : `/${imageUrl}`
  ) : null
  
  return (
    <div 
      className={`store-logo ${circular ? 'store-logo-circular' : ''} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {finalImageUrl ? (
        <img src={finalImageUrl} alt={alt} />
      ) : (
        <Store size={size * 0.55} />
      )}
    </div>
  )
}

export default StoreLogo

