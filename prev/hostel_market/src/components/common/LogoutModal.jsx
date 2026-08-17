import React from 'react'
import { LogOut, X } from 'lucide-react'
import './LogoutModal.css'

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-header">
          <div className="logout-modal-icon">
            <LogOut size={24} />
          </div>
          <h3 className="logout-modal-title">Confirm Logout</h3>
          <button className="logout-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="logout-modal-body">
          <p className="logout-modal-message">
            Are you sure you want to logout? You'll need to sign in again to access the marketplace.
          </p>
        </div>
        
        <div className="logout-modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutModal






