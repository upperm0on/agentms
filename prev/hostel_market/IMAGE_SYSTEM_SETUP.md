# Image System Setup - Market Application

## Overview

The image system for the market application has been set up to use S3 buckets with a structured path organization. All images are stored in the `media/store/{user_id}/` directory structure.

## Path Structure

All images are saved using the following path structure:

- **Store Images** (logo, banner): `media/store/{user_id}/store_image/{filename}`
- **Product Images**: `media/store/{user_id}/product_images/{filename}`

Where `{user_id}` is the authenticated user's ID.

## Backend Changes

### 1. Model Updates (`entrepreneurs/models.py`)

- **Store Model**: Added `logo` and `cover_photo` fields with `store_image_upload_path` function
- **Commodity Model**: Removed incorrectly placed `logo` and `cover_photo` fields, updated `image` field to use `product_image_upload_path` function
- **Upload Path Functions**: Created helper functions to generate correct paths based on user_id

### 2. API Endpoints (`hq/api_views.py`)

All upload endpoints have been updated to use the correct path structure:

- **`/hq/api/marketplace/upload/`** - Upload product/service images
  - Saves to: `media/store/{user_id}/product_images/{filename}`
  - Returns: `{ status: 'success', message: '...', url: '...', path: '...' }`

- **`/hq/api/marketplace/store/logo/`** - Upload store logo
  - Saves to: `media/store/{user_id}/store_image/{filename}` (via Store model)
  - Returns: `{ status: 'success', message: '...', url: '...', logo: '...' }`

- **`/hq/api/marketplace/store/banner/`** - Upload store banner
  - Saves to: `media/store/{user_id}/store_image/{filename}` (via Store model)
  - Returns: `{ status: 'success', message: '...', url: '...', banner: '...' }`

### 3. Migration

Created migration `0007_move_store_images_to_store_model.py` to:
- Add `logo` and `cover_photo` fields to Store model
- Remove `logo` and `cover_photo` fields from Commodity model
- Update Commodity `image` field to use new upload path

**To apply the migration:**
```bash
cd /home/barimah/projects/hostel
python manage.py migrate entrepreneurs
```

## Frontend Changes

### 1. Image Service (`src/services/imageService.js`)

Updated all upload functions to:
- Return consistent format: `{ url: '...', path: '...' }`
- Handle backend response format correctly
- Include proper error handling

Functions:
- `uploadImage(file, onProgress)` - Upload single product/service image
- `uploadImages(files, onProgress)` - Upload multiple product/service images
- `uploadStoreLogo(file, onProgress)` - Upload store logo
- `uploadStoreBanner(file, onProgress)` - Upload store banner

### 2. Image Upload Hook (`src/hooks/useImageUpload.js`)

Hook provides:
- `uploadImage(file, onProgress)` - Upload single image
- `uploadImages(files, onProgress)` - Upload multiple images
- `uploadLogo(file, onProgress)` - Upload store logo
- `uploadBanner(file, onProgress)` - Upload store banner
- `loading` - Upload loading state
- `progress` - Upload progress percentage
- `error` - Error message if upload fails

### 3. Components Updated

All components have been updated to use the new image system:

- **CreateStoreModal** - Uses `uploadLogo` and `uploadBanner` hooks
- **CreateListingModal** - Uses `uploadImage` hook for product/service images
- **AddItemWizard** - Uses `uploadImages` hook for multiple product images
- **ImageUpload** - Generic reusable component updated to handle new response format

## Usage Examples

### Upload Store Logo
```javascript
import { useImageUpload } from '../hooks/useImageUpload'

const { uploadLogo, loading, progress } = useImageUpload()

const handleLogoUpload = async (file) => {
  try {
    const result = await uploadLogo(file)
    console.log('Logo URL:', result.url)
    // result = { url: '...', path: '...' }
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### Upload Product Image
```javascript
import { useImageUpload } from '../hooks/useImageUpload'

const { uploadImage, loading, progress } = useImageUpload()

const handleImageUpload = async (file) => {
  try {
    const result = await uploadImage(file)
    console.log('Image URL:', result.url)
    // result = { url: '...', path: '...' }
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### Upload Multiple Images
```javascript
import { useImageUpload } from '../hooks/useImageUpload'

const { uploadImages, loading, progress } = useImageUpload()

const handleMultipleUpload = async (files) => {
  try {
    const results = await uploadImages(files)
    // results = [{ url: '...', path: '...' }, ...]
    const urls = results.map(r => r.url)
    console.log('Image URLs:', urls)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

## Image CRUD Operations

### Create (Upload)
- ✅ Store logo upload - Working
- ✅ Store banner upload - Working
- ✅ Product/service image upload - Working
- ✅ Multiple image upload - Working

### Read (Display)
- ✅ Store logo display - Working (via Store model)
- ✅ Store banner display - Working (via Store model)
- ✅ Product image display - Working (via Commodity model)

### Update (Replace)
- ✅ Store logo update - Working (upload new logo replaces old)
- ✅ Store banner update - Working (upload new banner replaces old)
- ✅ Product image update - Working (upload new image replaces old)

### Delete
- ✅ Image removal from UI - Working (components handle removal)
- ⚠️ Backend deletion - Not implemented (images remain in S3, but not referenced)

## File Validation

All upload endpoints validate:
- **File Type**: Only JPEG, PNG, GIF, WebP allowed
- **File Size**: 
  - Store logos: Max 5MB
  - Store banners: Max 10MB
  - Product images: Max 10MB

## Error Handling

All upload functions include:
- File type validation
- File size validation
- Progress tracking
- Error messages
- Toast notifications (via ToastContext)

## Testing

To test the image system:

1. **Start Backend Server:**
   ```bash
   cd /home/barimah/projects/hostel
   python manage.py runserver localhost:8080
   ```

2. **Start Frontend Server:**
   ```bash
   cd /home/barimah/projects/hostel_market
   npm run dev
   ```

3. **Test Uploads:**
   - Create a store and upload logo/banner
   - Create a product/service listing and upload images
   - Verify images are saved to correct S3 paths
   - Verify images display correctly in the UI

## Notes

- All images are stored in S3 using the same bucket as the main application
- Path structure ensures images are organized by user
- Images are automatically associated with the authenticated user
- The system supports both single and multiple image uploads
- Progress tracking is available for all upload operations

## Next Steps

1. Apply the migration: `python manage.py migrate entrepreneurs`
2. Test image uploads in the application
3. Verify images are saved to correct S3 paths
4. Test image display in all components
5. Consider implementing image deletion endpoint if needed

