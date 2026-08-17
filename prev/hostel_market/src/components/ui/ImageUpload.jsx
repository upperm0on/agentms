import React, { useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useImageUpload } from '../../hooks/useImageUpload'
import './ImageUpload.css'

/**
 * Reusable image upload component with drag-and-drop support
 * @param {object} props - Component props
 * @param {Function} props.onUploadComplete - Callback when upload completes with URLs
 * @param {Function} props.onUploadError - Callback when upload fails
 * @param {boolean} props.multiple - Allow multiple file uploads
 * @param {string} props.accept - Accept file types (default: 'image/*')
 * @param {number} props.maxFiles - Maximum number of files (for multiple)
 * @param {string} props.label - Label text
 */
export const ImageUpload = ({
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept = 'image/*',
  maxFiles = 5,
  label = 'Upload Image',
}) => {
  const { uploadImage, uploadImages, loading, progress, error } = useImageUpload()
  const [previewUrls, setPreviewUrls] = useState([])
  const [uploadedUrls, setUploadedUrls] = useState([])
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files)
    
    // Limit number of files
    const filesToUpload = multiple ? fileArray.slice(0, maxFiles) : [fileArray[0]]
    
    // Create preview URLs
    const previews = filesToUpload.map(file => URL.createObjectURL(file))
    setPreviewUrls(previews)
    
    try {
      let results
      if (multiple) {
        results = await uploadImages(filesToUpload)
      } else {
        const result = await uploadImage(filesToUpload[0])
        results = [result]
      }
      
      // Extract URLs from results (results are { url, path } objects)
      const urls = results.map(result => result?.url || result).filter(Boolean)
      setUploadedUrls(urls)
      
      if (onUploadComplete) {
        // Pass URLs to callback (for backward compatibility)
        onUploadComplete(multiple ? urls : urls[0])
      }
    } catch (err) {
      console.error('Upload error:', err)
      setPreviewUrls([])
      if (onUploadError) {
        onUploadError(err)
      }
    }
  }

  const handleFileChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleRemove = (index) => {
    const newPreviews = previewUrls.filter((_, i) => i !== index)
    const newUrls = uploadedUrls.filter((_, i) => i !== index)
    setPreviewUrls(newPreviews)
    setUploadedUrls(newUrls)
    
    if (onUploadComplete && newUrls.length > 0) {
      onUploadComplete(multiple ? newUrls : newUrls[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="image-upload-container">
      {label && <label className="image-upload-label-text">{label}</label>}
      
      {previewUrls.length === 0 ? (
        <div
          className={`image-upload-dropzone ${isDragging ? 'dragging' : ''} ${loading ? 'uploading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className="image-upload-input"
            disabled={loading}
          />
          <div className="image-upload-content">
            <Upload size={32} />
            <p className="image-upload-text">
              {loading ? 'Uploading...' : 'Drag and drop images here, or click to upload'}
            </p>
            {loading && (
              <div className="image-upload-progress">
                <div className="image-upload-progress-bar" style={{ width: `${progress}%` }} />
                <span className="image-upload-progress-text">{progress}%</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="image-upload-preview-grid">
          {previewUrls.map((preview, index) => (
            <div key={index} className="image-upload-preview-item">
              <img src={preview} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className="image-upload-remove"
                onClick={() => handleRemove(index)}
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
              {uploadedUrls[index] && (
                <div className="image-upload-status">
                  <ImageIcon size={12} />
                  <span>Uploaded</span>
                </div>
              )}
            </div>
          ))}
          {multiple && previewUrls.length < maxFiles && (
            <div
              className="image-upload-add-more"
              onClick={handleClick}
            >
              <Upload size={24} />
              <span>Add more</span>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="image-upload-error">
          {error}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="image-upload-input-hidden"
        disabled={loading}
      />
    </div>
  )
}

export default ImageUpload


