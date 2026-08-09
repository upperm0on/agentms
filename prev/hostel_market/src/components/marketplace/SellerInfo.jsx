import React from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import StoreLogo from '../store/StoreLogo'
import './SellerInfo.css'

/**
 * Reusable SellerInfo component
 * Displays store logo, name, and rating
 * @param {Object} props
 * @param {string} props.name - Store name
 * @param {number} props.rating - Store rating
 * @param {string} props.logoUrl - Store logo URL
 * @param {string} props.logo - Alternative logo prop
 * @param {number|string} props.storeId - Store ID for link
 * @param {boolean} props.showLink - Whether to show as link (default: true)
 */
function SellerInfo({ 
  name, 
  rating, 
  logoUrl, 
  logo, 
  storeId, 
  showLink = true 
}) {
  const content = (
    <div className="seller-info">
      <StoreLogo 
        logoUrl={logoUrl || logo}
        logo={logo}
        alt={name || 'Store logo'}
        size={32}
        className="seller-logo"
      />
      <div className="seller-details">
        <div className="seller-name">{name || 'Store'}</div>
        {rating && (
          <div className="seller-rating">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{Number(rating).toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  )

  if (showLink && storeId) {
    return (
      <Link to={`/stores/${storeId}`} className="seller-info-link">
        {content}
      </Link>
    )
  }

  return content
}

export default SellerInfo


