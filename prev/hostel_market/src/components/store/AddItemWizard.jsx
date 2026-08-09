import React, { useMemo, useState } from 'react'
import { X, PackagePlus, Wrench, ChevronLeft, ChevronRight, Upload, Tag, DollarSign, ImageIcon, CheckCircle2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import './AddItemWizard.css'
import { useImageUpload } from '../../hooks/useImageUpload'
import { useToast } from '../../contexts/ToastContext'

function StepIndicator({ step, total }) {
  return (
    <div className="wizard-steps">
      {Array.from({ length: total }).map((_, idx) => (
        <div key={idx} className={`wizard-step ${idx === step ? 'active' : idx < step ? 'done' : ''}`} />
      ))}
    </div>
  )
}

function AddItemWizard({ open, onClose, mode = 'product', onComplete, initialItem }) {
  const totalSteps = 4
  const [step, setStep] = useState(0)
  const { uploadImages, loading: uploadingImages, progress: uploadProgress } = useImageUpload()
  const { success, error: showError } = useToast()
  const [imagePreviews, setImagePreviews] = useState([])
  
  // Get store_id from Redux state
  const store = useSelector(state => state.entrepreneur?.store)
  const storeId = store?.id || initialItem?.store_id || null
  const productId = initialItem?.id || null
  
  // Initialize form state - reset when initialItem changes
  const [form, setForm] = useState(() => ({
    type: initialItem?.type || mode, // product | service
    name: initialItem?.name || '',
    description: initialItem?.description || '',
    price: initialItem?.price != null ? String(initialItem.price) : '',
    currency: initialItem?.currency || 'GHS',
    tags: Array.isArray(initialItem?.tags) ? initialItem.tags.join(', ') : (initialItem?.tags || ''),
    images: [],
    imageUrls: initialItem?.images || [],
    imagePaths: [], // Store paths for backend
  }))

  // Reset form when initialItem changes (for edit mode)
  React.useEffect(() => {
    if (initialItem) {
      // Get existing images - check both images array and primary_image
      const existingImages = []
      if (initialItem.primary_image) {
        existingImages.push(initialItem.primary_image)
      }
      if (Array.isArray(initialItem.images)) {
        // Add other images that aren't already in the array
        initialItem.images.forEach(img => {
          if (img && img !== initialItem.primary_image && !existingImages.includes(img)) {
            existingImages.push(img)
          }
        })
      }
      
      setForm({
        type: initialItem.type || mode,
        name: initialItem.name || '',
        description: initialItem.description || '',
        price: initialItem.price != null ? String(initialItem.price) : '',
        currency: initialItem.currency || 'GHS',
        tags: Array.isArray(initialItem.tags) ? initialItem.tags.join(', ') : (initialItem.tags || ''),
        images: [], // New file uploads go here
        imageUrls: existingImages, // Existing image URLs
        imagePaths: [], // Store paths for backend
      })
      setImagePreviews(existingImages) // Show existing images as previews
      setStep(0) // Reset to first step when editing
    } else {
      // Reset form for new item
      setForm({
        type: mode,
        name: '',
        description: '',
        price: '',
        currency: 'GHS',
        tags: '',
        images: [],
        imageUrls: [],
        imagePaths: [], // Store paths for backend
      })
      setImagePreviews([])
      setStep(0)
    }
  }, [initialItem, mode])

  const title = useMemo(() => {
    const isService = (initialItem?.type || mode) === 'service'
    const isEdit = Boolean(initialItem)
    if (isEdit) return isService ? 'Edit Service' : 'Edit Product'
    return isService ? 'Add Service' : 'Add Product'
  }, [mode, initialItem])

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Set previews immediately (create blob URLs for new files)
    const newPreviews = files.map(file => URL.createObjectURL(file))
    
    // Track the starting index before adding new previews
    let startIndex = 0
    setImagePreviews(prev => {
      startIndex = prev.length
      return [...prev, ...newPreviews]
    })
    setForm(prev => ({ ...prev, images: [...prev.images, ...files] }))

    // Upload images immediately
    try {
      // Pass product_id and store_id when uploading (for editing)
      const uploadedImages = await uploadImages(files, null, productId, storeId)
      if (uploadedImages && Array.isArray(uploadedImages)) {
        const imageUrls = uploadedImages.map(img => img.url || img).filter(Boolean)
        const imagePaths = uploadedImages.map(img => img.path || img.url || img).filter(Boolean)
        
        // Replace blob URLs with actual uploaded URLs in previews
        setImagePreviews(prev => {
          const updated = [...prev]
          imageUrls.forEach((url, idx) => {
            const previewIndex = startIndex + idx
            if (previewIndex < updated.length && updated[previewIndex]?.startsWith('blob:')) {
              // Revoke the blob URL and replace with actual URL
              URL.revokeObjectURL(updated[previewIndex])
              updated[previewIndex] = url
            }
          })
          return updated
        })
        
        setForm(prev => ({ 
          ...prev, 
          imageUrls: [...(prev.imageUrls || []), ...imageUrls],
          imagePaths: [...(prev.imagePaths || []), ...imagePaths]
        }))
        success('Images uploaded successfully!')
      }
    } catch (error) {
      console.error('Failed to upload images:', error)
      showError('Failed to upload images. Please try again.')
      // Remove failed previews and files
      setImagePreviews(prev => {
        const updated = [...prev]
        // Revoke blob URLs before removing
        newPreviews.forEach(preview => {
          if (preview?.startsWith('blob:')) {
            URL.revokeObjectURL(preview)
          }
        })
        return updated.slice(0, updated.length - newPreviews.length)
      })
      setForm(prev => ({ ...prev, images: prev.images.slice(0, prev.images.length - files.length) }))
    }
    
    // Clear the input so the same file can be selected again
    e.target.value = ''
  }

  const removeImage = (index) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev]
      // Only revoke object URLs (blob URLs), not regular URLs
      const preview = newPreviews[index]
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
      newPreviews.splice(index, 1)
      return newPreviews
    })
    setForm(prev => {
      // Calculate how many existing images (URLs) are before this index
      // Existing images are in imageUrls but not in images array
      const existingImageCount = prev.imageUrls.length - prev.images.length
      const isExistingImage = index < existingImageCount
      
      if (isExistingImage) {
        // Removing an existing image - only remove from imageUrls
        return {
          ...prev,
          imageUrls: prev.imageUrls.filter((_, i) => i !== index),
        }
      } else {
        // Removing a new image - remove from both arrays
        const newImageIndex = index - existingImageCount
        return {
          ...prev,
          images: prev.images.filter((_, i) => i !== newImageIndex),
          imageUrls: prev.imageUrls.filter((_, i) => i !== index),
        }
      }
    })
  }

  function next() {
    setStep(s => Math.min(totalSteps - 1, s + 1))
  }

  function prev() {
    setStep(s => Math.max(0, s - 1))
  }

  async function submit() {
    try {
      // If there are File objects that haven't been uploaded, upload them first
      let finalImageUrls = [...(form.imageUrls || [])]
      let finalImagePaths = [...(form.imagePaths || [])]
      if (form.images.length > 0) {
        try {
          // Pass product_id and store_id when uploading (for editing)
          const uploadedImages = await uploadImages(form.images, null, productId, storeId)
          if (uploadedImages && Array.isArray(uploadedImages)) {
            const newUrls = uploadedImages.map(img => img.url || img).filter(Boolean)
            const newPaths = uploadedImages.map(img => img.path || img.url || img).filter(Boolean)
            finalImageUrls = [...finalImageUrls, ...newUrls]
            finalImagePaths = [...finalImagePaths, ...newPaths]
          }
        } catch (error) {
          console.error('Failed to upload remaining images:', error)
          showError('Failed to upload some images. Please try again.')
          return
        }
      }

      // Get the path for primary_image if available
      const primaryImagePath = finalImagePaths[0] || null
      const primaryImageUrl = finalImageUrls[0] || initialItem?.primary_image || null
      
      const base = {
        id: initialItem?.id ?? Math.floor(Math.random() * 1000000),
        name: form.name || ((form.type === 'service') ? 'New Service' : 'New Product'),
        description: form.description,
        price: Number(form.price) || 0,
        currency: form.currency,
        type: form.type,
        primary_image: primaryImagePath || primaryImageUrl, // Send path if available, otherwise URL
        primary_image_path: primaryImagePath, // Also send path separately for backend
        images: finalImageUrls,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      const payload = form.type === 'product'
        ? { ...base, stock_quantity: initialItem?.stock_quantity ?? 1 }
        : base
      onComplete?.(payload)
      onClose?.()
    } catch (error) {
      console.error('Failed to submit item:', error)
      showError('Failed to create item. Please try again.')
    }
  }

  if (!open) return null

  return (
    <div className="wizard-backdrop" role="dialog" aria-modal="true">
      <div className="wizard-modal">
        <div className="wizard-header">
          <div className="wizard-title">
            {mode === 'service' ? <Wrench size={18} /> : <PackagePlus size={18} />}
            <span>{title}</span>
          </div>
          <button className="wizard-close" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <StepIndicator step={step} total={totalSteps} />

        <div className="wizard-carousel" style={{ transform: `translate3d(-${step * 100}%, 0, 0)` }}>
          <div className="wizard-slide">
            <h3 className="wizard-slide-title">Basics</h3>
            <div className="wizard-field">
              <label>Name</label>
              <div className="wizard-input">
                <Tag size={16} />
                <input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder={mode === 'service' ? 'Service name' : 'Product name'} />
              </div>
            </div>
            <div className="wizard-field">
              <label>Description</label>
              <textarea value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Short description" />
            </div>
          </div>

          <div className="wizard-slide">
            <h3 className="wizard-slide-title">Pricing</h3>
            <div className="wizard-field-row">
              <div className="wizard-field">
                <label>Price</label>
                <div className="wizard-input">
                  <DollarSign size={16} />
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => updateField('price', e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="wizard-field">
                <label>Currency</label>
                <select value={form.currency} onChange={e => updateField('currency', e.target.value)}>
                  <option value="GHS">GHS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="wizard-slide">
            <h3 className="wizard-slide-title">Media</h3>
            <div className="wizard-upload">
              <ImageIcon size={20} />
              <p>Drag and drop images here, or click to upload</p>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange}
                disabled={uploadingImages}
              />
              {uploadingImages && (
                <p style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                  Uploading... {uploadProgress}%
                </p>
              )}
            </div>
            {imagePreviews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginTop: 16 }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
                    <img src={preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="wizard-slide">
            <h3 className="wizard-slide-title">Review</h3>
            <div className="wizard-review">
              <div className="review-row"><strong>Type:</strong> <span>{form.type}</span></div>
              <div className="review-row"><strong>Name:</strong> <span>{form.name || '(not set)'}</span></div>
              <div className="review-row"><strong>Description:</strong> <span>{form.description || '(not set)'}</span></div>
              <div className="review-row"><strong>Price:</strong> <span>{form.currency} {form.price || 0}</span></div>
              <div className="review-row"><strong>Tags:</strong> <span>{form.tags || '(none)'}</span></div>
            </div>
          </div>
        </div>

        <div className="wizard-footer">
          <button className="wizard-nav" onClick={prev} disabled={step === 0 || uploadingImages}>
            <ChevronLeft size={16} /> Prev
          </button>
          {step < totalSteps - 1 ? (
            <button className="wizard-nav primary" onClick={next} disabled={uploadingImages}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button className="wizard-nav primary" onClick={submit} disabled={uploadingImages}>
              <CheckCircle2 size={16} /> {uploadingImages ? `Uploading... ${uploadProgress}%` : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddItemWizard


