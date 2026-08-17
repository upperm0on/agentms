import React from 'react'
import { Button } from '../ui/Button'
import { Heart, ShieldCheck } from 'lucide-react'
import './StickyCTA.css'

function StickyCTA({ priceText, isService, stockQuantity, onToggleFavorite, isFavorited, onPrimary }) {
  return (
    <aside className="sticky-cta">
      <div className="sticky-cta__price-row">
        <div className="sticky-cta__price">{priceText}</div>
        {stockQuantity !== undefined && (
          <div className={`sticky-cta__stock ${stockQuantity > 0 ? 'in' : 'out'}`}>
            {stockQuantity > 0 ? `${stockQuantity} in stock` : 'Out of stock'}
          </div>
        )}
      </div>
      <div className="sticky-cta__actions">
        <Button size="lg" variant="default" onClick={onPrimary}>{isService ? 'Book Service' : 'Buy Now'}</Button>
        <Button size="lg" variant="outline" onClick={onToggleFavorite} aria-pressed={!!isFavorited}>
          <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />{isFavorited ? 'Saved' : 'Save'}
        </Button>
      </div>
      <div className="sticky-cta__trust">
        <ShieldCheck size={16} />
        <span>Protected checkout for services via escrow</span>
      </div>
    </aside>
  )
}

export default StickyCTA


