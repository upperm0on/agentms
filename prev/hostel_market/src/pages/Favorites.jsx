import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/marketplace/ProductCard'
import { clearFavorites, selectFavoritesMap, selectFavoriteIds } from '../store/slices/favoritesSlice'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Trash2, ShoppingBag } from 'lucide-react'
import './Favorites.css'

function Favorites() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const ids = useSelector(selectFavoriteIds)
  const byId = useSelector(selectFavoritesMap)
  const products = ids.map(id => byId[id]).filter(Boolean)

  return (
    <div className="favorites-page section">
      <div className="container">
        <div className="favorites-header">
          <div>
            <h1 className="favorites-title">Your Favorites</h1>
            <p className="favorites-subtitle">
              {products.length > 0 
                ? `${products.length} ${products.length === 1 ? 'item' : 'items'} saved`
                : 'Save products you love for later'
              }
            </p>
          </div>
        {products.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => dispatch(clearFavorites())}
              aria-label="Clear All Favorites"
              title="Clear All Favorites"
            >
              <Trash2 size={18} />
              <span className="button-text">Clear All</span>
            </Button>
        )}
      </div>

      {products.length === 0 ? (
          <EmptyState
            variant="favorites"
            title="No favorites yet"
            description="Tap the heart icon on any product to save it here for easy access later."
            action={
              <Button variant="default" onClick={() => navigate('/browse')} aria-label="Browse Products" title="Browse Products">
                <ShoppingBag size={18} />
                <span className="button-text">Browse</span>
              </Button>
            }
          />
      ) : (
          <div className="favorites-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

export default Favorites


