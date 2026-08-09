import React from 'react'
import { cn } from '../../utils/cn.js'
import { Package, ShoppingBag, Heart, Search, Store, FileQuestion, AlertCircle } from 'lucide-react'
import './EmptyState.css'

const ILLUSTRATIONS = {
  products: Package,
  stores: Store,
  favorites: Heart,
  search: Search,
  orders: ShoppingBag,
  general: FileQuestion,
  error: AlertCircle,
}

function EmptyState({ 
  title, 
  description, 
  illustration, 
  action, 
  className,
  variant = 'general',
  compact = false,
  icon: Icon
}) {
  const IllustrationIcon = Icon || ILLUSTRATIONS[variant] || ILLUSTRATIONS.general
  
  return (
    <div className={cn(
      'empty-state', 
      'radius-lg', 
      'shadow-sm',
      compact && 'empty-state-compact',
      className
    )}>
      <div className="empty-illustration">
        {illustration || <IllustrationIcon />}
      </div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  )
}

export { EmptyState }


