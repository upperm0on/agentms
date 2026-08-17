import React, { useState } from 'react'
import { Package, Wrench, Upload, X, Image as ImageIcon } from 'lucide-react'
import Modal from '../ui/Modal'
import { Input, Textarea, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import './CreateListingModal.css'
import { useDispatch } from 'react-redux'
import { addProduct } from '../../store/slices/marketplaceSlice'
import { useCreateListing } from '../../hooks/useCreateListing'
import { useImageUpload } from '../../hooks/useImageUpload'
import { useToast } from '../../contexts/ToastContext'

function CreateListingModal({ isOpen, onClose, onSubmit, listing = null }) {
  const dispatch = useDispatch()
  const { success, error: showError } = useToast()
  const { createListing, loading: creatingListing } = useCreateListing()
  const { uploadImage, loading: uploadingImage, progress: uploadProgress } = useImageUpload()
  const [listingType, setListingType] = useState(listing?.type || 'product')
  const [formData, setFormData] = useState({
    type: listing?.type || 'product',
    name: listing?.name || '',
    description: listing?.description || '',
    price: listing?.price || '',
    currency: listing?.currency || 'GHS',
    stock_quantity: listing?.stock_quantity || '',
    primary_image: null,
    images: [],
    tags: listing?.tags?.join(', ') || '',
  })
  
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(listing?.primary_image || null)
  
  const currencies = [
    { value: 'GHS', label: 'GHS - Ghana Cedis' },
    { value: 'USD', label: 'USD - US Dollars' },
    { value: 'EUR', label: 'EUR - Euros' },
  ]
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const handleTypeChange = (type) => {
    setListingType(type)
    setFormData(prev => ({ ...prev, type }))
  }
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Set preview immediately
      setFormData(prev => ({ ...prev, primary_image: file }))
      setImagePreview(URL.createObjectURL(file))
      
      // Upload image immediately
      try {
        const uploadedImage = await uploadImage(file)
        if (uploadedImage && uploadedImage.url) {
          setFormData(prev => ({ ...prev, primary_image: uploadedImage.url }))
          setImagePreview(uploadedImage.url)
        }
      } catch (error) {
        console.error('Failed to upload image:', error)
        showError('Failed to upload image. Please try again.')
        // Keep the file for retry on submit
      }
    }
  }
  
  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }
    
    if (!formData.primary_image && !listing) {
      newErrors.primary_image = 'Image is required'
    }
    
    if (listingType === 'product' && (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0)) {
      newErrors.stock_quantity = 'Valid stock quantity is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    // If primary_image is still a File object, upload it first
    let imageUrl = imagePreview
    if (formData.primary_image instanceof File) {
      try {
        const uploadedImage = await uploadImage(formData.primary_image)
        imageUrl = uploadedImage?.url || imagePreview
      } catch (error) {
        console.error('Failed to upload image:', error)
        setErrors(prev => ({ ...prev, primary_image: 'Failed to upload image. Please try again.' }))
        showError('Failed to upload image. Please try again.')
        return
      }
    }
    
    const submitData = {
      ...formData,
      primary_image: imageUrl,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      stock_quantity: listingType === 'product' ? parseInt(formData.stock_quantity) : null,
    }
    
    // Optimistic update: Create temporary listing object
    const optimisticListing = {
      id: `temp-${Date.now()}`,
      ...submitData,
      primary_image: imageUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    // Add to Redux store immediately (optimistic update)
    dispatch(addProduct(optimisticListing))
    
    // Call onSubmit callback immediately for optimistic UI update
    onSubmit?.(optimisticListing)
    
    try {
      // Create listing using the hook (actual API call)
      const createdListing = await createListing(submitData)
      
      // Replace optimistic listing with real one
      dispatch(addProduct(createdListing))
      
      // Call onSubmit callback with real data
      onSubmit?.(createdListing)
      
      // Clear form after successful creation
      setFormData({
        type: 'product',
        name: '',
        description: '',
        price: '',
        currency: 'GHS',
        stock_quantity: '',
        primary_image: null,
        images: [],
        tags: '',
      })
      setImagePreview(null)
      setErrors({})
      setListingType('product')
      
      success('Listing created successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to create listing:', error)
      
      // Revert optimistic update on error
      // Note: In a real app, you'd remove the optimistic item from Redux
      // For now, we'll just show the error and let the user retry
      
      // Show field-specific errors if available
      if (error.response?.data) {
        const apiErrors = error.response.data
        const fieldErrors = {}
        
        if (apiErrors.name) fieldErrors.name = Array.isArray(apiErrors.name) ? apiErrors.name[0] : apiErrors.name
        if (apiErrors.description) fieldErrors.description = Array.isArray(apiErrors.description) ? apiErrors.description[0] : apiErrors.description
        if (apiErrors.price) fieldErrors.price = Array.isArray(apiErrors.price) ? apiErrors.price[0] : apiErrors.price
        if (apiErrors.primary_image) fieldErrors.primary_image = Array.isArray(apiErrors.primary_image) ? apiErrors.primary_image[0] : apiErrors.primary_image
        if (apiErrors.stock_quantity) fieldErrors.stock_quantity = Array.isArray(apiErrors.stock_quantity) ? apiErrors.stock_quantity[0] : apiErrors.stock_quantity
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...fieldErrors }))
        }
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create listing. Please check the form and try again.'
      showError(errorMessage)
    }
  }
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={listing ? 'Edit Listing' : 'Create New Listing'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="create-listing-form">
        {/* Listing Type Selection */}
        <div className="form-section">
          <label className="section-label">Listing Type</label>
          <div className="listing-type-selector">
            <button
              type="button"
              className={`type-option ${listingType === 'product' ? 'active' : ''}`}
              onClick={() => handleTypeChange('product')}
            >
              <Package size={20} />
              <span>Product</span>
            </button>
            <button
              type="button"
              className={`type-option ${listingType === 'service' ? 'active' : ''}`}
              onClick={() => handleTypeChange('service')}
            >
              <Wrench size={20} />
              <span>Service</span>
            </button>
          </div>
        </div>
        
        {/* Image Upload */}
        <div className="form-section">
          <label className="section-label">
            {listingType === 'product' ? 'Product Image' : 'Service Image'}
            <span className="required">*</span>
          </label>
          <div className="image-upload-container">
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => {
                    setImagePreview(null)
                    setFormData(prev => ({ ...prev, primary_image: null }))
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="image-upload-label">
                <Upload size={24} />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden-input"
                />
              </label>
            )}
          </div>
          {errors.primary_image && (
            <span className="error-text">{errors.primary_image}</span>
          )}
        </div>
        
        {/* Name */}
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder={`e.g., ${listingType === 'product' ? 'iPhone 13 Pro Max' : 'Graphic Design Services'}`}
        />
        
        {/* Description */}
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          rows={4}
          required
          placeholder="Describe your listing in detail..."
        />
        
        {/* Price and Currency */}
        <div className="form-row">
          <div className="price-input-group">
            <Input
              label="Price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              required
              placeholder="0.00"
            />
          </div>
          <Select
            label="Currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            options={currencies}
          />
        </div>
        
        {/* Stock Quantity (only for products) */}
        {listingType === 'product' && (
          <Input
            label="Stock Quantity"
            name="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={handleChange}
            error={errors.stock_quantity}
            required
            placeholder="0"
            min="0"
          />
        )}
        
        {/* Tags */}
        <Input
          label="Tags (comma-separated)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="e.g., electronics, phone, mobile"
          helperText="Separate tags with commas"
        />
        
        {/* Actions */}
        <div className="form-actions">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={creatingListing || uploadingImage}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="default" 
            disabled={creatingListing || uploadingImage}
          >
            {creatingListing || uploadingImage 
              ? (uploadingImage ? `Uploading... ${Math.round(uploadProgress)}%` : 'Creating...') 
              : (listing ? 'Update Listing' : 'Create Listing')}
          </Button>
        </div>
        
        {/* Global error message */}
        {creatingListing && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#f0f9ff', 
            border: '1px solid #bae6fd', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#0369a1'
          }}>
            Creating your listing... This may take a moment.
          </div>
        )}
      </form>
    </Modal>
  )
}

export default CreateListingModal

