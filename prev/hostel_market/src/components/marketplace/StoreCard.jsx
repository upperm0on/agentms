import React from 'react'
import { Link } from 'react-router-dom'
import { Star, TrendingUp, Eye } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import StoreLogo from '../store/StoreLogo'
import './StoreCard.css'

function StoreCard({ store }) {
  const engagementScore = store.engagement_score || 0
  const isTrending = engagementScore >= 200
  
  return (
    <Link to={`/stores/${store.id}`} className="store-card-link">
      <Card className={`store-card ${isTrending ? 'store-card-trending' : ''}`}>
        <div className="store-card-header">
          <StoreLogo 
            logoUrl={store.logo_url || store.logo}
            logo={store.logo}
            alt={store.name}
            size={60}
            className="store-card-logo"
          />
          {isTrending && (
            <div className="store-card-badge trending">
              <TrendingUp size={14} />
              Trending
            </div>
          )}
        </div>
        
        <CardContent className="store-card-content">
          <h3 className="store-card-name">{store.name}</h3>
          
          {store.category && (
            <span className="store-card-category">{store.category.name}</span>
          )}
          
          {store.description && (
            <p className="store-card-description">
              {store.description.length > 100 
                ? `${store.description.substring(0, 100)}...` 
                : store.description}
            </p>
          )}
          
          <div className="store-card-stats">
            <div className="store-card-stat">
              <Eye size={16} />
              <span>{store.total_views || 0} views</span>
            </div>
            {store.rating && (
              <div className="store-card-stat">
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span>{store.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {store.product_count !== undefined && (
            <div className="store-card-products">
              {store.product_count} {store.product_count === 1 ? 'product' : 'products'}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default StoreCard

