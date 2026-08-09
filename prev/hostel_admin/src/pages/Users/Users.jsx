import { useState, useEffect, useMemo } from 'react'
import { Users as UsersIcon, Search, Filter, MoreVertical, Edit2, Trash2, Eye, Plus } from 'lucide-react'
import { dynamicDbAPI } from '../../services/adminApi'
import './Users.css'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  // Load real users data
  useEffect(() => {
    loadUsers()
  }, [currentPage])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load consumers (regular users)
      const consumersResponse = await dynamicDbAPI.getTableData('consumers', 'consumer', {
        page: currentPage,
        page_size: 20
      })
      
      // Load managers
      const managersResponse = await dynamicDbAPI.getTableData('managers', 'manager', {
        page: currentPage,
        page_size: 20
      })
      
      if (consumersResponse.data.success && managersResponse.data.success) {
        // Combine consumers and managers into a unified users list
        const consumers = consumersResponse.data.data.map(user => ({
          ...user,
          user_type: 'Consumer',
          is_manager: false
        }))
        
        const managers = managersResponse.data.data.map(user => ({
          ...user,
          user_type: 'Manager',
          is_manager: true
        }))
        
        const allUsers = [...consumers, ...managers]
        setUsers(allUsers)
        setPagination(consumersResponse.data.pagination)
      } else {
        setError('Failed to load users data')
      }
    } catch (err) {
      console.error('Error loading users:', err)
      setError('Error loading users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchFields = [
        user.user?.username,
        user.user?.email,
        user.user?.first_name,
        user.user?.last_name,
        user.user_type
      ].filter(Boolean).join(' ').toLowerCase()
      
      const matchesSearch = searchFields.includes(searchInput.toLowerCase())
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'active' && user.is_active) ||
                           (filterStatus === 'inactive' && !user.is_active)
      return matchesSearch && matchesFilter
    })
  }, [users, searchInput, filterStatus])

  const handleEdit = (userId) => {
    console.log('Edit user:', userId)
  }

  const handleDelete = async (userId) => {
    const user = users.find(u => u.id === userId)
    if (!user) return
    
    const userName = user.user?.username || user.user?.email || 'this user'
    
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        setLoading(true)
        
        // Determine if it's a consumer or manager
        const isManager = user.user_type === 'Manager'
        const appLabel = isManager ? 'managers' : 'consumers'
        const modelName = isManager ? 'manager' : 'consumer'
        
        await dynamicDbAPI.deleteRecord(appLabel, modelName, userId)
        
        // Reload users after successful deletion
        await loadUsers()
        
        console.log('User deleted successfully')
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert(`Failed to delete user: ${error.message || error}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleView = (userId) => {
    console.log('View user:', userId)
  }

  if (loading) {
    return (
      <div className="users-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="users-error">
        <h3>Error Loading Users</h3>
        <p>{error}</p>
        <button onClick={loadUsers} className="btn-primary">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="users">
      <div className="users-header">
        <div className="users-title">
          <UsersIcon size={24} />
          <h1>Users Management</h1>
        </div>
        <div className="users-actions">
          <button className="btn-primary">Add User</button>
        </div>
      </div>

      <div className="users-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const userName = user.user?.username || 'Unknown'
              const userEmail = user.user?.email || 'No email'
              const displayName = user.user?.first_name && user.user?.last_name 
                ? `${user.user.first_name} ${user.user.last_name}`
                : userName
              
              return (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{displayName}</span>
                        <span className="user-id">ID: {user.id}</span>
                      </div>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleView(user.id)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleEdit(user.id)}
                          title="Edit User"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn-icon danger" 
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="user-email">{userEmail}</span>
                  </td>
                  <td>
                    <span className={`role-badge ${user.user_type.toLowerCase()}`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className="date-info">
                      {user.date_created ? new Date(user.date_created).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="date-info">
                      {user.user?.last_login ? new Date(user.user.last_login).toLocaleDateString() : 'Never'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="no-users">
          <UsersIcon size={48} />
          <h3>No users found</h3>
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
            ({pagination.total_count} total users)
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

export default Users