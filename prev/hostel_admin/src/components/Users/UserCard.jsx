import { useState } from 'react'
import { MoreVertical, Edit2, Trash2, Eye, Mail, Phone, MapPin } from 'lucide-react'
import './UserCard.css'

function UserCard({ user, onEdit, onView, onDelete }) {
  const [showActions, setShowActions] = useState(false)

  const handleActionClick = (action) => {
    setShowActions(false)
    action(user)
  }

  const getRoleColor = (role) => {
    const colors = {
      manager: 'role-manager',
      tenant: 'role-tenant',
      admin: 'role-admin'
    }
    return colors[role] || 'role-default'
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'status-active' : 'status-inactive'
  }

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar">
          <span>{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</span>
        </div>
        <div className="user-info">
          <h3 className="user-name">{user.name || 'Unknown User'}</h3>
          <p className="user-email">{user.email}</p>
        </div>
        <div className="user-actions">
          <button 
            className="actions-btn"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical size={16} />
          </button>
          {showActions && (
            <div className="actions-menu">
              <button 
                className="action-item"
                onClick={() => handleActionClick(onView)}
              >
                <Eye size={14} />
                View
              </button>
              <button 
                className="action-item"
                onClick={() => handleActionClick(onEdit)}
              >
                <Edit2 size={14} />
                Edit
              </button>
              <button 
                className="action-item delete"
                onClick={() => handleActionClick(onDelete)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="user-details">
        <div className="detail-item">
          <Mail size={14} />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="detail-item">
            <Phone size={14} />
            <span>{user.phone}</span>
          </div>
        )}
        {user.location && (
          <div className="detail-item">
            <MapPin size={14} />
            <span>{user.location}</span>
          </div>
        )}
      </div>

      <div className="user-footer">
        <div className="user-role">
          <span className={`role-badge ${getRoleColor(user.role)}`}>
            {user.role || 'User'}
          </span>
        </div>
        <div className="user-status">
          <span className={`status-badge ${getStatusColor(user.is_active)}`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default UserCard
