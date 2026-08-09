import { useState, useCallback } from 'react'
import {
  uploadImage,
  uploadImages,
  uploadStoreLogo,
  uploadStoreBanner,
} from '../services/imageService'

/**
 * Custom hook for image uploads
 * @returns {object} { uploadImage, uploadImages, uploadLogo, uploadBanner, progress, loading, error }
 */
export const useImageUpload = () => {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const handleUpload = useCallback(async (uploadFn, fileOrFiles, onProgress = null) => {
    setLoading(true)
    setProgress(0)
    setError(null)
    
    try {
      const progressCallback = onProgress || ((percent) => setProgress(percent))
      const result = await uploadFn(fileOrFiles, progressCallback)
      setProgress(100)
      return result
    } catch (err) {
      console.error('Error uploading image:', err)
      const errorMessage = err.message || 'Failed to upload image'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 1000)
    }
  }, [])

  const uploadSingleImage = useCallback(
    async (file, onProgress = null) => {
      return handleUpload(uploadImage, file, onProgress)
    },
    [handleUpload]
  )

  const uploadMultipleImages = useCallback(
    async (files, onProgress = null) => {
      return handleUpload(uploadImages, files, onProgress)
    },
    [handleUpload]
  )

  const uploadLogo = useCallback(
    async (file, onProgress = null) => {
      return handleUpload(uploadStoreLogo, file, onProgress)
    },
    [handleUpload]
  )

  const uploadBanner = useCallback(
    async (file, onProgress = null) => {
      return handleUpload(uploadStoreBanner, file, onProgress)
    },
    [handleUpload]
  )

  return {
    uploadImage: uploadSingleImage,
    uploadImages: uploadMultipleImages,
    uploadLogo,
    uploadBanner,
    progress,
    loading,
    error,
  }
}


