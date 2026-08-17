import React from 'react'
import './StoreBanner.css'

/**
 * Reusable StoreBanner component
 * Displays store banner image with fallback
 * @param {Object} props
 * @param {string} props.bannerUrl - Banner image URL
 * @param {string} props.banner - Alternative banner prop name
 * @param {string} props.alt - Alt text for image
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.height - Banner height in pixels (default: 220)
 */
function StoreBanner({ 
  bannerUrl, 
  banner, 
  alt = 'Store banner', 
  className = '', 
  height = 220 
}) {
  const imageUrl = bannerUrl || banner
  
  // Handle different URL formats
  const finalImageUrl = imageUrl ? (
    imageUrl.startsWith('http') || imageUrl.startsWith('/') 
      ? imageUrl 
      : `/${imageUrl}`
  ) : null
  
  return (
    <div 
      className={`store-banner ${className}`}
      style={{ height: `${height}px` }}
    >
      {finalImageUrl ? (
        <img src={finalImageUrl} alt={alt} />
      ) : (
        <div className="store-banner-fallback" />
      )}
    </div>
  )
}

export default StoreBanner

