import React from 'react'
import { cn } from '../../utils/cn'
import './LoadingSpinner.css'

function LoadingSpinner({ 
  size = 'md', 
  className,
  text,
  fullScreen = false 
}) {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={cn('loading-spinner', `loading-spinner-${size}`, className)}>
          <div className="spinner" />
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    )
  }

  return (
    <div className={cn('loading-spinner', `loading-spinner-${size}`, className)}>
      <div className="spinner" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  )
}

export { LoadingSpinner }

