import React, { useState } from 'react'
import { Store, X, Upload, Image as ImageIcon } from 'lucide-react'
import Modal from '../ui/Modal'
import { Input, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import './CreateStoreModal.css'
import { useDispatch, useSelector } from 'react-redux'
import { addStore } from '../../store/slices/marketplaceSlice'
import { useImageUpload } from '../../hooks/useImageUpload'
import { useToast } from '../../contexts/ToastContext'

function CreateStoreModal({ isOpen, onClose, onSubmit, store = null }) {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { uploadLogo, uploadBanner, loading: uploadingImage, progress: uploadProgress } = useImageUpload()
  const { success, error: showError } = useToast()
  const [formData, setFormData] = useState({
    name: store?.name || '',
    description: store?.description || '',
    contact_phone: store?.contact_phone || '',
    contact_email: store?.contact_email || user?.email || '', // Use user's email by default
    logo: null,
    banner: null,
    logo_url: store?.logo || null,
    banner_url: store?.banner || null,
  })
  
  const [errors, setErrors] = useState({})
  const [logoPreview, setLogoPreview] = useState(store?.logo || null)
  const [bannerPreview, setBannerPreview] = useState(store?.banner || null)
  
  // Update email from user when user object is available
  React.useEffect(() => {
    if (user?.email && !store) {
      // Only set email if creating new store (not editing)
      setFormData(prev => ({
        ...prev,
        contact_email: prev.contact_email || user.email
      }))
    }
  }, [user?.email, store])
  
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0]
    if (file) {
      // Set preview immediately
      const previewUrl = URL.createObjectURL(file)
      if (type === 'logo') {
        setFormData(prev => ({ ...prev, logo: file }))
        setLogoPreview(previewUrl)
      } else {
        setFormData(prev => ({ ...prev, banner: file }))
        setBannerPreview(previewUrl)
      }

      // Upload image immediately
      try {
        const uploadFn = type === 'logo' ? uploadLogo : uploadBanner
        const uploadedImage = await uploadFn(file)
        if (uploadedImage && uploadedImage.url) {
          if (type === 'logo') {
            setFormData(prev => ({ ...prev, logo_url: uploadedImage.url }))
            setLogoPreview(uploadedImage.url)
          } else {
            setFormData(prev => ({ ...prev, banner_url: uploadedImage.url }))
            setBannerPreview(uploadedImage.url)
          }
        }
      } catch (error) {
        console.error(`Failed to upload ${type}:`, error)
        showError(`Failed to upload ${type}. Please try again.`)
        // Keep the file for retry on submit
      }
    }
  }
  
  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required'
    }
    
    // Note: Store model doesn't have a category field - categories are only for individual products/services
    // Email is automatically set from user, so we only validate phone if provided
    // But we don't require either since email is always available from user
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    try {
      // If logo/banner are still File objects, upload them first
      let logoUrl = formData.logo_url || logoPreview
      let bannerUrl = formData.banner_url || bannerPreview

      if (formData.logo instanceof File) {
        try {
          const uploadedLogo = await uploadLogo(formData.logo)
          logoUrl = uploadedLogo?.url || logoUrl
        } catch (error) {
          console.error('Failed to upload logo:', error)
          showError('Failed to upload logo. Please try again.')
          return
        }
      }

      if (formData.banner instanceof File) {
        try {
          const uploadedBanner = await uploadBanner(formData.banner)
          bannerUrl = uploadedBanner?.url || bannerUrl
        } catch (error) {
          console.error('Failed to upload banner:', error)
          showError('Failed to upload banner. Please try again.')
          return
        }
      }
      
      // Ensure email is set from user if not already set
      const submitData = {
        ...formData,
        contact_email: formData.contact_email || user?.email || '',
        logo: logoUrl,
        banner: bannerUrl,
        logo_url: logoUrl,
        banner_url: bannerUrl,
      }
      
      // Call onSubmit callback if provided
      onSubmit?.(submitData)
      
      // Add to Redux store
      dispatch(addStore({
        name: formData.name,
        description: formData.description,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        logo: logoUrl,
        banner: bannerUrl,
      }))
      
      success('Store created successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to create store:', error)
      showError('Failed to create store. Please try again.')
    }
  }
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={store ? 'Edit Store' : 'Create New Store'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="create-store-form">
        {/* Banner Upload */}
        <div className="form-section">
          <label className="section-label">Store Banner</label>
          <div className="image-upload-container banner">
            {bannerPreview ? (
              <div className="image-preview">
                <img src={bannerPreview} alt="Banner preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => {
                    setBannerPreview(null)
                    setFormData(prev => ({ ...prev, banner: null }))
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="image-upload-label">
                <Upload size={24} />
                <span>Upload Banner</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'banner')}
                  className="hidden-input"
                />
              </label>
            )}
          </div>
        </div>
        
        {/* Logo Upload */}
        <div className="form-section">
          <label className="section-label">Store Logo</label>
          <div className="image-upload-container logo">
            {logoPreview ? (
              <div className="image-preview logo-preview">
                <img src={logoPreview} alt="Logo preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => {
                    setLogoPreview(null)
                    setFormData(prev => ({ ...prev, logo: null }))
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="image-upload-label logo-label">
                <Store size={32} />
                <span>Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  className="hidden-input"
                />
              </label>
            )}
          </div>
        </div>
        
        {/* Store Name */}
        <Input
          label="Store Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="e.g., TechHub Electronics"
        />
        
        {/* Description */}
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Tell customers about your store..."
        />
        
        {/* Contact Info */}
        <div className="form-row">
          <Input
            label="Contact Phone"
            name="contact_phone"
            type="tel"
            value={formData.contact_phone}
            onChange={handleChange}
            error={errors.contact_phone}
            placeholder="+233 XX XXX XXXX (Optional)"
          />
        </div>
        
        {/* Actions */}
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onClose} disabled={uploadingImage}>
            Cancel
          </Button>
          <Button type="submit" variant="default" disabled={uploadingImage}>
            {uploadingImage 
              ? `Uploading... ${uploadProgress}%` 
              : (store ? 'Update Store' : 'Create Store')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateStoreModal

