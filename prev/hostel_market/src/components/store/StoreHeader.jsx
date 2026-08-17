import React from 'react'
import { Star } from 'lucide-react'
import StoreLogo from './StoreLogo'
import './StoreHeader.css'

/**
 * Reusable StoreHeader component
 * Displays store logo, name, and metadata
 * @param {Object} props
 * @param {Object} props.store - Store object
 * @param {React.ReactNode} props.actions - Action buttons to display
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.logoSize - Logo size in pixels (default: 72)
 */
function StoreHeader({ store, actions, className = '', logoSize = 72 }) {
  if (!store) return null

  return (
    <div className={`store-header-card ${className}`}>
      <div className="store-header-main">
        <StoreLogo 
          logoUrl={store.logo_url || store.logo}
          logo={store.logo}
          alt={store.name || 'Store logo'}
          size={logoSize}
        />
        <div className="store-title-block">
          <h1 className="store-name">{store.name || 'Store'}</h1>
          <div className="store-meta-line">
            {store.category?.name && (
              <>
                <span className="store-category">{store.category.name}</span>
                <span className="dot" />
              </>
            )}
            {store.rating && (
              <>
                <span className="store-rating">
                  <Star size={16} color="#f59e0b" fill="#f59e0b" /> 
                  {store.rating.toFixed(1)} 
                  {store.total_reviews ? ` (${store.total_reviews})` : ''}
                </span>
                <span className="dot" />
              </>
            )}
            {store.total_views && (
              <span className="store-views">{store.total_views.toLocaleString()} views</span>
            )}
          </div>
          {store.description && (
            <p className="store-description">{store.description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="store-header-actions">
          {actions}
        </div>
      )}
    </div>
  )
}

export default StoreHeader

