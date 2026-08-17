import React from 'react'
import { cn } from '../../utils/cn.js'
import './Skeleton.css'

function Skeleton({ 
  className, 
  variant = 'block', 
  size = 'md', 
  width,
  height,
  rounded = true,
  ...props 
}) {
  const style = {
    width: width || undefined,
    height: height || undefined,
    borderRadius: rounded ? undefined : 0,
  }
  
  return (
    <div 
      className={cn('skeleton', `skeleton-${variant}`, `skeleton-${size}`, className)} 
      style={style}
      aria-label="Loading..."
      {...props} 
    />
  )
}

// Preset skeleton components
function SkeletonText({ lines = 1, className }) {
  return (
    <div className={cn('skeleton-text-group', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="block" 
          size="md" 
          className={i === lines - 1 ? 'skeleton-last-line' : ''}
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className }) {
  return (
    <div className={cn('skeleton-card', className)}>
      <Skeleton variant="block" size="lg" className="skeleton-image" />
      <div className="skeleton-card-content">
        <Skeleton variant="block" size="md" width="60%" />
        <SkeletonText lines={2} />
        <Skeleton variant="block" size="sm" width="40%" />
      </div>
    </div>
  )
}

function SkeletonProduct({ className }) {
  return (
    <div className={cn('skeleton-product', className)}>
      <Skeleton variant="block" className="skeleton-product-image" />
      <div className="skeleton-product-info">
        <Skeleton variant="block" size="md" width="80%" />
        <Skeleton variant="block" size="sm" width="50%" />
        <Skeleton variant="block" size="sm" width="60%" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonProduct }


