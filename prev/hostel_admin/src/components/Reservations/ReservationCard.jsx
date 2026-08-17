import { useState } from 'react'
import { MoreVertical, Edit2, Trash2, Eye, CheckCircle2, XCircle, Calendar, User, Building2, DollarSign } from 'lucide-react'
import './ReservationCard.css'

function ReservationCard({ reservation }) {
  const [showActions, setShowActions] = useState(false)

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    }
    return colors[status] || 'status-pending'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return CheckCircle
      case 'cancelled':
        return XCircle
      default:
        return Calendar
    }
  }

  const StatusIcon = getStatusIcon(reservation.status)

  return (
    <div className="reservation-card">
      <div className="reservation-card-header">
        <div className="reservation-info">
          <h3 className="reservation-id">#{reservation.id}</h3>
          <div className="reservation-user">
            <User size={14} />
            <span>{reservation.user?.name || 'Unknown User'}</span>
          </div>
        </div>
        <div className="reservation-actions">
          <button 
            className="actions-btn"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical size={16} />
          </button>
          {showActions && (
            <div className="actions-menu">
              <button className="action-item">
                <Eye size={14} />
                View
              </button>
              <button className="action-item">
                <Edit2 size={14} />
                Edit
              </button>
              <button className="action-item delete">
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="reservation-details">
        <div className="detail-item">
          <Building2 size={14} />
          <span>{reservation.hostel?.name || 'Unknown Hostel'}</span>
        </div>
        <div className="detail-item">
          <Calendar size={14} />
          <span>{reservation.check_in_date} - {reservation.check_out_date}</span>
        </div>
        <div className="detail-item">
          <DollarSign size={14} />
          <span>${reservation.total_amount || '0'}</span>
        </div>
      </div>

      <div className="reservation-footer">
        <div className="reservation-status">
          <StatusIcon size={16} />
          <span className={`status-badge ${getStatusColor(reservation.status)}`}>
            {reservation.status?.charAt(0).toUpperCase() + reservation.status?.slice(1)}
          </span>
        </div>
        <div className="reservation-date">
          <span>Created: {new Date(reservation.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

export default ReservationCard
