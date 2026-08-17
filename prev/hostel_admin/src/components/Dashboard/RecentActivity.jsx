import { useState, useEffect } from 'react'
import { Clock, User, Building2, Calendar, RefreshCw } from 'lucide-react'
import { dynamicDbAPI } from '../../services/adminApi'
import './RecentActivity.css'

function RecentActivity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRecentActivity()
  }, [])

  const loadRecentActivity = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load recent reservations, users, and hostels
      const [reservationsResponse, consumersResponse, managersResponse, hostelsResponse] = await Promise.all([
        dynamicDbAPI.getTableData('reservations', 'reservation', { page_size: 5, ordering: '-date_created' }),
        dynamicDbAPI.getTableData('consumers', 'consumer', { page_size: 3, ordering: '-date_created' }),
        dynamicDbAPI.getTableData('managers', 'manager', { page_size: 3, ordering: '-date_created' }),
        dynamicDbAPI.getTableData('hq', 'hostel', { page_size: 3, ordering: '-date_created' })
      ])

      const allActivities = []

      // Process reservations
      if (reservationsResponse.data.success) {
        reservationsResponse.data.data.forEach(reservation => {
          const userName = reservation.tenant?.user?.username || 'Unknown User'
          allActivities.push({
            id: `reservation-${reservation.id}`,
            type: 'reservation',
            message: `New reservation created`,
            user: userName,
            time: formatTimeAgo(reservation.date_created),
            icon: Calendar,
            color: 'blue'
          })
        })
      }

      // Process new users
      if (consumersResponse.data.success) {
        consumersResponse.data.data.forEach(consumer => {
          const userName = consumer.user?.username || 'New User'
          allActivities.push({
            id: `consumer-${consumer.id}`,
            type: 'user',
            message: 'New user registered',
            user: userName,
            time: formatTimeAgo(consumer.date_created),
            icon: User,
            color: 'purple'
          })
        })
      }

      // Process new managers
      if (managersResponse.data.success) {
        managersResponse.data.data.forEach(manager => {
          const userName = manager.user?.username || 'New Manager'
          allActivities.push({
            id: `manager-${manager.id}`,
            type: 'manager',
            message: 'New manager registered',
            user: userName,
            time: formatTimeAgo(manager.date_created),
            icon: User,
            color: 'green'
          })
        })
      }

      // Process new hostels
      if (hostelsResponse.data.success) {
        hostelsResponse.data.data.forEach(hostel => {
          allActivities.push({
            id: `hostel-${hostel.id}`,
            type: 'hostel',
            message: 'New hostel added',
            user: hostel.name || 'New Hostel',
            time: formatTimeAgo(hostel.date_created),
            icon: Building2,
            color: 'orange'
          })
        })
      }

      // Sort by time and take the most recent 10
      setActivities(allActivities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10))
    } catch (err) {
      console.error('Error loading recent activity:', err)
      setError('Failed to load recent activity')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time'
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: 'activity-blue',
      green: 'activity-green',
      purple: 'activity-purple',
      orange: 'activity-orange',
      red: 'activity-red',
    }
    return colors[color] || 'activity-blue'
  }

  if (loading) {
    return (
      <div className="recent-activity">
        <div className="recent-activity-header">
          <h3 className="recent-activity-title">Recent Activity</h3>
        </div>
        <div className="recent-activity-loading">
          <div className="loading-spinner"></div>
          <p>Loading recent activity...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="recent-activity">
        <div className="recent-activity-header">
          <h3 className="recent-activity-title">Recent Activity</h3>
          <button onClick={loadRecentActivity} className="refresh-btn">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="recent-activity-error">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="recent-activity">
      <div className="recent-activity-header">
        <h3 className="recent-activity-title">Recent Activity</h3>
        <button onClick={loadRecentActivity} className="refresh-btn">
          <RefreshCw size={16} />
        </button>
      </div>
      
      <div className="recent-activity-list">
        {activities.length === 0 ? (
          <div className="no-activities">
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon ${getColorClasses(activity.color)}`}>
                  <Icon size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <div className="activity-meta">
                    <span className="activity-user">{activity.user}</span>
                    <span className="activity-time">
                      <Clock size={12} />
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default RecentActivity
