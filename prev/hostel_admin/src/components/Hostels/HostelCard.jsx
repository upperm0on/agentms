import { useState, useEffect, memo, useCallback } from 'react'
import { MapPin, Users, Star, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react'
import './HostelCard.css'

const HostelCard = memo(function HostelCard({ hostel, onEdit, onView, onDelete, isExpanded = false }) {
  const [showActions, setShowActions] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Prevent unnecessary re-renders and reset image states
  useEffect(() => {
    // Reset image states when hostel changes
    setImageError(false)
    setImageLoading(true)
  }, [hostel.id])

  const handleActionClick = useCallback((action) => {
    setShowActions(false)
    action(hostel)
  }, [hostel])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoading(false)
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageError(false)
    setImageLoading(false)
  }, [])

  return (
    <div className={`hostel-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="hostel-card-image">
        <img 
          src={imageError || !hostel.image ? '/images/hostel-placeholder.jpg' : hostel.image} 
          alt={hostel.name}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <div className="hostel-card-overlay">
          <div className="hostel-status">
            {hostel.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      <div className="hostel-card-content">
        <div className="hostel-card-header">
          <h3 className="hostel-name">{hostel.name}</h3>
          <div className="hostel-actions">
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

        <div className="hostel-info">
          <div className="info-item">
            <MapPin size={16} />
            <span>{hostel.campus?.campus || 'Unknown Campus'}</span>
          </div>
          <div className="info-item">
            <Users size={16} />
            <span>{hostel.room_details?.length || 0} Room Types</span>
          </div>
          <div className="info-item">
            <Star size={16} />
            <span>{hostel.ratings || 'N/A'} Rating</span>
          </div>
        </div>

        <div className="hostel-stats">
          <div className="stat">
            <span className="stat-label">Capacity</span>
            <span className="stat-value">{hostel.capacity || 'N/A'}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Occupancy</span>
            <span className="stat-value">{hostel.occupancy || '0%'}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default HostelCard
