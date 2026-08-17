import { apiClient } from '../utils/apiClient'

/**
 * Upload a single image file
 * @param {File} file - Image file to upload
 * @param {Function} onProgress - Optional progress callback
 * @param {number} productId - Optional product ID (for editing)
 * @param {number} storeId - Optional store ID
 * @returns {Promise} Uploaded image URL
 */
export const uploadImage = async (file, onProgress = null, productId = null, storeId = null) => {
  try {
    const formData = new FormData()
    formData.append('image', file)
    
    // Include product_id if provided (for editing)
    if (productId) {
      formData.append('product_id', productId)
    }
    
    // Include store_id if provided
    if (storeId) {
      formData.append('store_id', storeId)
    }
    
    // Use axios config for progress tracking
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    }
    
    // Upload to marketplace endpoint
    // For new products: saves to media/store/{user_id}/{store_id}/product_images/temp_{timestamp}_{filename}
    // For editing: saves to media/store/{user_id}/{store_id}/product_images/{product_id}_{timestamp}_{filename}
    const response = await apiClient.post('/marketplace/upload/', formData, config)
    
    // Return consistent format: { url: '...', path: '...' }
    // Backend returns: { status: 'success', message: '...', url: '...', path: '...' }
    const url = response.data?.url || response.data?.image || response.data?.data?.url
    const path = response.data?.path || url
    
    if (!url) {
      throw new Error('No URL returned from server')
    }
    
    return { url, path }
  } catch (error) {
    console.error('Failed to upload image:', error)
    throw error
  }
}

/**
 * Upload multiple image files
 * @param {File[]} files - Array of image files to upload
 * @param {Function} onProgress - Optional progress callback
 * @param {number} productId - Optional product ID (for editing)
 * @param {number} storeId - Optional store ID
 * @returns {Promise} Array of uploaded image URLs
 */
export const uploadImages = async (files, onProgress = null, productId = null, storeId = null) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      // Create individual progress callback if provided
      const fileProgress = onProgress
        ? (percent) => {
            // Calculate overall progress across all files
            // This is a simplified version - could be enhanced
            onProgress(percent)
          }
        : null
      
      return uploadImage(file, fileProgress, productId, storeId)
    })
    
    const uploadedUrls = await Promise.all(uploadPromises)
    return uploadedUrls
  } catch (error) {
    console.error('Failed to upload images:', error)
    throw error
  }
}

/**
 * Upload store logo
 * @param {File} file - Logo image file
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise} Uploaded logo URL
 */
export const uploadStoreLogo = async (file, onProgress = null) => {
  try {
    const formData = new FormData()
    formData.append('logo', file)
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    }
    
    // Upload store logo
    // Saves to: media/store/{user_id}/store_image/{filename}
    const response = await apiClient.post('/marketplace/store/logo/', formData, config)
    
    // Backend returns: { status: 'success', message: '...', url: '...', logo: '...' }
    const url = response.data?.url || response.data?.logo
    
    if (!url) {
      throw new Error('No URL returned from server')
    }
    
    return { url, path: url }
  } catch (error) {
    console.error('Failed to upload store logo:', error)
    throw error
  }
}

/**
 * Upload store banner
 * @param {File} file - Banner image file
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise} Uploaded banner URL
 */
export const uploadStoreBanner = async (file, onProgress = null) => {
  try {
    const formData = new FormData()
    formData.append('banner', file)
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    }
    
    // Upload store banner
    // Saves to: media/store/{user_id}/store_image/{filename}
    const response = await apiClient.post('/marketplace/store/banner/', formData, config)
    
    // Backend returns: { status: 'success', message: '...', url: '...', banner: '...' }
    const url = response.data?.url || response.data?.banner
    
    if (!url) {
      throw new Error('No URL returned from server')
    }
    
    return { url, path: url }
  } catch (error) {
    console.error('Failed to upload store banner:', error)
    throw error
  }
}


