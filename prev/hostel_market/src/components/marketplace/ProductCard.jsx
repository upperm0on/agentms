import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ShoppingBag, Wrench, Package, Tag, Heart, MessageCircle, Star, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import './ProductCard.css'
import ContactSellerModal from './ContactSellerModal'
import { useContactSeller } from '../../hooks/useContactSeller'
import { useToast } from '../../contexts/ToastContext'
import { useLazyImage } from '../../hooks/useLazyImage'

import { toggleFavorite, selectIsFavorited } from '../../store/slices/favoritesSlice'

function ProductCard({ product, onFavorite, favorited = false, isOwner = false, onEdit, onDeleteRequest }) {
  const dispatch = useDispatch()
  const { success, error: showError } = useToast()
  const { sendMessage, loading: contactLoading } = useContactSeller()
  const favoritedFromStore = useSelector(selectIsFavorited(product.id))
  const isFavorited = favorited || favoritedFromStore
  const isService = product.type === 'service'
  const [contactOpen, setContactOpen] = React.useState(false)
  
  // Lazy load product image
  const { imageSrc, isLoaded, ref: imageRef, onLoad, onError } = useLazyImage(
    product.primary_image,
    '/placeholder-product.jpg'
  )
  
  return (
    <Card className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-image-container">
        <img 
          ref={imageRef}
          src={imageSrc}
          alt={product.name}
          className={`product-card-image ${isLoaded ? 'loaded' : 'loading'}`}
          loading="lazy"
          onLoad={onLoad}
          onError={onError}
        />
        <div className="product-card-badge">
          {isService ? (
            <>
              <Wrench size={14} />
              Service
            </>
          ) : (
            <>
              <Package size={14} />
              Product
            </>
          )}
        </div>
        {product.stock_quantity === 0 && !isService && (
          <div className="product-card-badge out-of-stock">
            Out of Stock
          </div>
        )}
        
        <div className="product-card-actions">
          <button 
            className={`product-card-action ${isFavorited ? 'favorited' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              dispatch(toggleFavorite(product))
              onFavorite?.(product.id)
            }}
            aria-label="Add to favorites"
          >
            <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
          <button
            className="product-card-action"
            onClick={(e) => { e.preventDefault(); setContactOpen(true) }}
            aria-label="Contact seller"
            title="Contact seller"
          >
            <MessageCircle size={18} />
          </button>
          
          {isOwner && (
            <>
              <button
                className="product-card-action"
                onClick={(e) => {
                  e.preventDefault()
                  onEdit?.(product)
                }}
                aria-label="Edit item"
                title="Edit"
              >
                <Pencil size={18} />
              </button>
              <button
                className="product-card-action"
                onClick={(e) => {
                  e.preventDefault()
                  onDeleteRequest?.(product, e)
                }}
                aria-label="Delete item"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </Link>
      
      <CardContent className="product-card-content">
        <div className="product-card-header">
          <Link to={`/stores/${product.store_id}`} className="product-card-store">
            {product.store_name || 'Store'}
          </Link>
          {product.store_rating && (
            <div className="product-card-rating">
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>{product.store_rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <h3 className="product-card-name">{product.name}</h3>
        
        {product.description && (
          <p className="product-card-description">
            {product.description.length > 80 
              ? `${product.description.substring(0, 80)}...` 
              : product.description}
          </p>
        )}
        
        {product.tags && product.tags.length > 0 && (
          <div className="product-card-tags">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="product-card-tag">
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="product-card-footer">
          <div className="product-card-price">
            <span className="currency">{product.currency || 'GHS'}</span>
            <span className="amount">{parseFloat(product.price).toLocaleString()}</span>
          </div>
          <Link to={`/products/${product.id}`}>
            <Button size="sm" variant="default">
              {isService ? 'Book Service' : 'Buy Now'}
            </Button>
          </Link>
        </div>
        
        {!isService && product.stock_quantity !== undefined && (
          <div className="product-card-stock">
            {product.stock_quantity > 0 
              ? `${product.stock_quantity} in stock` 
              : 'Out of stock'}
          </div>
        )}
      </CardContent>
      <ContactSellerModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        product={product}
        onSubmit={async (formData) => { 
          try {
            await sendMessage(product.id, formData.message)
            success('Message sent successfully!')
            setContactOpen(false)
          } catch (error) {
            showError(error.message || 'Failed to send message. Please try again.')
          }
        }}
      />
    </Card>
  )
}

export default ProductCard

