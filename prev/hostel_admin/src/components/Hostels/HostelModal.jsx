import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { X, Save, Upload, MapPin, Users, DollarSign } from 'lucide-react'
import { createHostel, updateHostel } from '../../store/slices/hostelsSlice'
import toast from 'react-hot-toast'
import './HostelModal.css'

function HostelModal({ hostel, onClose }) {
  const dispatch = useDispatch()
  const isEditing = !!hostel
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campus: '',
    address: '',
    capacity: '',
    price_range: '',
    amenities: [],
    room_details: [],
    is_active: true,
    image: null
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (hostel) {
      setFormData({
        name: hostel.name || '',
        description: hostel.description || '',
        campus: hostel.campus?.campus || '',
        address: hostel.address || '',
        capacity: hostel.capacity || '',
        price_range: hostel.price_range || '',
        amenities: hostel.amenities || [],
        room_details: hostel.room_details || [],
        is_active: hostel.is_active !== false,
        image: null
      })
    }
  }, [hostel])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isEditing) {
        console.log('Submitting hostel update:', { id: hostel.id, data: formData })
        const result = await dispatch(updateHostel({ id: hostel.id, data: formData }))
        
        if (updateHostel.fulfilled.match(result)) {
          toast.success('Hostel updated successfully!')
          onClose()
        } else {
          toast.error(result.payload || 'Failed to update hostel')
        }
      } else {
        console.log('Submitting hostel creation:', formData)
        const result = await dispatch(createHostel(formData))
        
        if (createHostel.fulfilled.match(result)) {
          toast.success('Hostel created successfully!')
          onClose()
        } else {
          toast.error(result.payload || 'Failed to create hostel')
        }
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Edit Hostel' : 'Create New Hostel'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Hostel Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter hostel name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="campus" className="form-label">Campus *</label>
              <input
                type="text"
                id="campus"
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter campus name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter hostel address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="capacity" className="form-label">Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter total capacity"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price_range" className="form-label">Price Range</label>
              <input
                type="text"
                id="price_range"
                name="price_range"
                value={formData.price_range}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., $200-400/month"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amenities" className="form-label">Amenities</label>
              <input
                type="text"
                id="amenities"
                value={formData.amenities.join(', ')}
                onChange={(e) => handleArrayChange('amenities', e.target.value)}
                className="form-input"
                placeholder="WiFi, Laundry, Security, etc."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Enter hostel description"
              rows={4}
            />
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
                  {isEditing ? 'Update Hostel' : 'Create Hostel'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HostelModal
