import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import './Modal.css'

function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium', 
  className = '',
  showClose = true,
  icon: Icon
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        className={cn('modal', `modal-${size}`, className)} 
        onClick={(e) => e.stopPropagation()}
      >
        {(title || Icon || showClose) && (
        <div className="modal-header">
            <div className="modal-header-left">
              {Icon && (
                <div className="modal-icon">
                  <Icon size={24} />
                </div>
              )}
              {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
            </div>
            {showClose && (
              <button 
                className="modal-close" 
                onClick={onClose} 
                aria-label="Close modal"
              >
            <X size={20} />
          </button>
            )}
        </div>
        )}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal

