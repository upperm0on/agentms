import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import './Toast.css'

function Toast({ 
  title, 
  description, 
  variant = 'info', 
  icon: Icon,
  onClose,
  actions = [],
  className 
}) {
  return (
    <div 
      className={cn('toast', `toast-${variant}`, className)} 
      role="status" 
      aria-live="polite"
      aria-atomic="true"
    >
      {Icon && (
        <div className="toast-icon">
          <Icon size={20} />
        </div>
      )}
      <div className="toast-body">
        {title && <div className="toast-title">{title}</div>}
        {description && <div className="toast-desc">{description}</div>}
        {actions && actions.length > 0 && (
          <div className="toast-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={cn('toast-action', action.variant && `toast-action-${action.variant}`)}
                onClick={() => {
                  if (action.onClick) {
                    action.onClick()
                  }
                  if (action.dismissOnClick !== false && onClose) {
                    onClose()
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {onClose && (
        <button 
          className="toast-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

function ToastContainer({ children }) {
  return (
    <div 
      className="toast-container" 
      aria-live="polite" 
      aria-atomic="true"
      role="region"
      aria-label="Notifications"
    >
      {children}
    </div>
  )
}

export { Toast, ToastContainer }


