import React, { useState } from 'react'
import { Truck, MapPin, Phone, Upload, X } from 'lucide-react'
import Modal from '../ui/Modal'
import { Input, Select, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import './DriverSignup.css'

function DriverSignup({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    vehicle_type: 'bicycle',
    vehicle_number: '',
    id_document: null,
    delivery_zones: [],
    availability: 'available',
    hourly_rate: '',
  })
  
  const [errors, setErrors] = useState({})
  const [idPreview, setIdPreview] = useState(null)
  
  const vehicleTypes = [
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'car', label: 'Car' },
    { value: 'walking', label: 'Walking' },
  ]
  
  const zones = [
    { value: 'kumasi', label: 'Kumasi' },
    { value: 'accra', label: 'Accra' },
    { value: 'cape_coast', label: 'Cape Coast' },
  ]
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, id_document: file }))
      setIdPreview(URL.createObjectURL(file))
    }
  }
  
  const handleZoneChange = (zone) => {
    setFormData(prev => ({
      ...prev,
      delivery_zones: prev.delivery_zones.includes(zone)
        ? prev.delivery_zones.filter(z => z !== zone)
        : [...prev.delivery_zones, zone]
    }))
  }
  
  const validate = () => {
    const newErrors = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    
    if (!formData.vehicle_number.trim()) {
      newErrors.vehicle_number = 'Vehicle number is required'
    }
    
    if (!formData.id_document) {
      newErrors.id_document = 'ID document is required'
    }
    
    if (formData.delivery_zones.length === 0) {
      newErrors.delivery_zones = 'Select at least one delivery zone'
    }
    
    if (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0) {
      newErrors.hourly_rate = 'Valid hourly rate is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    onSubmit(formData)
  }
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Sign Up as Delivery Driver"
      size="large"
    >
      <form onSubmit={handleSubmit} className="driver-signup-form">
        <div className="signup-intro">
          <Truck size={32} />
          <p>Join our delivery network and earn money by delivering orders!</p>
        </div>
        
        {/* Personal Information */}
        <div className="form-section">
          <h3 className="section-title">Personal Information</h3>
          
          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            error={errors.full_name}
            required
            placeholder="John Doe"
          />
          
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            required
            placeholder="+233 XX XXX XXXX"
          />
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
        </div>
        
        {/* Vehicle Information */}
        <div className="form-section">
          <h3 className="section-title">Vehicle Information</h3>
          
          <Select
            label="Vehicle Type"
            name="vehicle_type"
            value={formData.vehicle_type}
            onChange={handleChange}
            options={vehicleTypes}
            required
          />
          
          <Input
            label="Vehicle Number / License Plate"
            name="vehicle_number"
            value={formData.vehicle_number}
            onChange={handleChange}
            error={errors.vehicle_number}
            required
            placeholder="e.g., GR-1234-20"
          />
        </div>
        
        {/* ID Document Upload */}
        <div className="form-section">
          <h3 className="section-title">Identity Verification</h3>
          
          <div className="document-upload">
            {idPreview ? (
              <div className="document-preview">
                <img src={idPreview} alt="ID preview" />
                <button
                  type="button"
                  className="remove-document"
                  onClick={() => {
                    setIdPreview(null)
                    setFormData(prev => ({ ...prev, id_document: null }))
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="document-upload-label">
                <Upload size={24} />
                <span>Upload ID Document</span>
                <p>National ID, Driver's License, or Student ID</p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden-input"
                />
              </label>
            )}
          </div>
          {errors.id_document && (
            <span className="error-text">{errors.id_document}</span>
          )}
        </div>
        
        {/* Delivery Zones */}
        <div className="form-section">
          <h3 className="section-title">Delivery Zones</h3>
          
          <div className="zones-grid">
            {zones.map(zone => (
              <button
                key={zone.value}
                type="button"
                className={`zone-button ${formData.delivery_zones.includes(zone.value) ? 'selected' : ''}`}
                onClick={() => handleZoneChange(zone.value)}
              >
                <MapPin size={16} />
                {zone.label}
              </button>
            ))}
          </div>
          {errors.delivery_zones && (
            <span className="error-text">{errors.delivery_zones}</span>
          )}
        </div>
        
        {/* Pricing */}
        <div className="form-section">
          <h3 className="section-title">Pricing</h3>
          
          <Input
            label="Hourly Rate (GHS)"
            name="hourly_rate"
            type="number"
            step="0.01"
            value={formData.hourly_rate}
            onChange={handleChange}
            error={errors.hourly_rate}
            required
            placeholder="e.g., 20.00"
            helperText="Rate per hour for delivery services"
          />
        </div>
        
        {/* Actions */}
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default DriverSignup

