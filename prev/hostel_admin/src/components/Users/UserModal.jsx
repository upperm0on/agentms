import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { X, Save, User, Mail, Phone, MapPin } from 'lucide-react'
import { createUser, updateUser } from '../../store/slices/usersSlice'
import toast from 'react-hot-toast'
import './UserModal.css'

function UserModal({ user, onClose }) {
  const dispatch = useDispatch()
  const isEditing = !!user
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    role: 'tenant',
    is_active: true
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        role: user.role || 'tenant',
        is_active: user.is_active !== false
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isEditing) {
        await dispatch(updateUser({ id: user.id, data: formData }))
        toast.success('User updated successfully!')
      } else {
        await dispatch(createUser(formData))
        toast.success('User created successfully!')
      }
      onClose()
    } catch (error) {
      toast.error('Failed to save user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name *</label>
              <div className="form-input-container">
                <User size={16} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email *</label>
              <div className="form-input-container">
                <Mail size={16} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone</label>
              <div className="form-input-container">
                <Phone size={16} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">Location</label>
              <div className="form-input-container">
                <MapPin size={16} />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="tenant">Tenant</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                <span>Active</span>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="button-spinner"></div>
              ) : (
                <>
                  <Save size={16} />
                  {isEditing ? 'Update User' : 'Create User'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal
