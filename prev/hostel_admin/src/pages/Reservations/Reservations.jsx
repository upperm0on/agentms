import { useState, useEffect, useMemo } from 'react'
import { Calendar, Search, Filter, MoreVertical, Eye, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { dynamicDbAPI } from '../../services/adminApi'
import './Reservations.css'

function Reservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  // Load real reservations data
  useEffect(() => {
    loadReservations()
  }, [currentPage])

  const loadReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await dynamicDbAPI.getTableData('reservations', 'reservation', {
        page: currentPage,
        page_size: 20
      })
      
      if (response.data.success) {
        setReservations(response.data.data)
        setPagination(response.data.pagination)
      } else {
        setError('Failed to load reservations data')
      }
    } catch (err) {
      console.error('Error loading reservations:', err)
      setError('Error loading reservations: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      const searchFields = [
        reservation.tenant?.user?.username,
        reservation.tenant?.user?.email,
        reservation.tenant?.user?.first_name,
        reservation.tenant?.user?.last_name,
        reservation.hostel?.name,
        reservation.room?.name
      ].filter(Boolean).join(' ').toLowerCase()
      
      const matchesSearch = searchFields.includes(searchInput.toLowerCase())
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'confirmed' && reservation.status === 'confirmed') ||
                           (filterStatus === 'pending' && reservation.status === 'pending') ||
                           (filterStatus === 'cancelled' && reservation.status === 'cancelled')
      return matchesSearch && matchesFilter
    })
  }, [reservations, searchInput, filterStatus])

  const handleView = (reservationId) => {
    console.log('View reservation:', reservationId)
  }

  const handleApprove = (reservationId) => {
    console.log('Approve reservation:', reservationId)
  }

  const handleCancel = (reservationId) => {
    console.log('Cancel reservation:', reservationId)
  }

  if (loading) {
    return (
      <div className="reservations-loading">
        <div className="loading-spinner"></div>
        <p>Loading reservations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="reservations-error">
        <h3>Error Loading Reservations</h3>
        <p>{error}</p>
        <button onClick={loadReservations} className="btn-primary">
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="reservations">
      <div className="reservations-header">
        <div className="reservations-title">
          <Calendar size={24} />
          <h1>Reservations Management</h1>
        </div>
        <div className="reservations-stats">
          <div className="stat-card">
            <span className="stat-number">{reservations.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{reservations.filter(r => r.status === 'Confirmed').length}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{reservations.filter(r => r.status === 'Pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      <div className="reservations-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search reservations..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <Filter size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="reservations-table-container">
        <table className="reservations-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Hostel</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map(reservation => {
              const userName = reservation.tenant?.user?.username || 'Unknown'
              const userEmail = reservation.tenant?.user?.email || 'No email'
              const displayName = reservation.tenant?.user?.first_name && reservation.tenant?.user?.last_name 
                ? `${reservation.tenant.user.first_name} ${reservation.tenant.user.last_name}`
                : userName
              
              return (
                <tr key={reservation.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{displayName}</span>
                        <span className="user-email">{userEmail}</span>
                      </div>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleView(reservation.id)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {reservation.status === 'pending' && (
                          <button 
                            className="btn-icon success" 
                            onClick={() => handleApprove(reservation.id)}
                            title="Approve"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {reservation.status !== 'cancelled' && (
                          <button 
                            className="btn-icon danger" 
                            onClick={() => handleCancel(reservation.id)}
                            title="Cancel"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="hostel-name">{reservation.hostel?.name || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="room-name">{reservation.room?.name || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="date-info">
                      {reservation.check_in_date ? new Date(reservation.check_in_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="date-info">
                      {reservation.check_out_date ? new Date(reservation.check_out_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="amount-info">
                      GH₵{reservation.total_amount || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${reservation.status?.toLowerCase() || 'unknown'}`}>
                      {reservation.status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredReservations.length === 0 && !loading && (
        <div className="no-reservations">
          <Calendar size={48} />
          <h3>No reservations found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="pagination">
          <button 
            className="btn-secondary"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {pagination.total_pages} 
            ({pagination.total_count} total reservations)
          </span>
          <button 
            className="btn-secondary"
            onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
            disabled={currentPage === pagination.total_pages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Reservations