# API Configuration Guide

This document explains how the API configuration system works in this React application and how to manage different environments.

## Overview

All API calls have been refactored to use relative paths instead of hardcoded IP addresses and ports. This makes the application more portable and easier to deploy across different environments.

## Configuration System

### API Configuration File

The main configuration is located in `src/config/api.js`. This file provides:

- Centralized API endpoint definitions
- Environment-aware URL building
- Helper functions for consistent API calls

### Environment Variables

You can control the API base URL using environment variables:

```bash
# For development with separate backend server
VITE_API_BASE_URL=http://localhost:8080

# For production (use relative paths)
VITE_API_BASE_URL=
```

### Usage Examples

#### Basic API Call
```javascript
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// Instead of: fetch("http://localhost:8080/hq/api/login/", ...)
fetch(buildApiUrl(API_ENDPOINTS.LOGIN), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
});
```

#### Media URLs
```javascript
import { buildMediaUrl } from '../config/api';

// Instead of: "http://localhost:8080/media/room_images"
const imageUrl = buildMediaUrl("/media/room_images");
```

## Updated Files

The following files have been updated to use relative paths:

1. **src/pages/Landingpage.jsx** - Landing page API call
2. **src/components/signup/SignUpForms.jsx** - Signup API call
3. **src/components/login/LoginForms.jsx** - Login API call
4. **src/pages/Dashboard.jsx** - Dashboard API call
5. **src/components/hostel/CategoryHostel.jsx** - Hostel listing API call
6. **src/components/hostel/DetailRoom.jsx** - Payment API calls
7. **src/components/hostel/DetailPopup.jsx** - Image URL
8. **src/components/hostel/HostelCard.jsx** - Image URL
9. **src/components/dashboard/HostelCard.jsx** - Image URL

## Environment Setup

### Development
For local development with a separate backend server:

1. Create a `.env.local` file in the project root
2. Add: `VITE_API_BASE_URL=http://localhost:8080`
3. Run `npm run dev`

### Production
For production deployment:

1. Ensure `VITE_API_BASE_URL` is empty or not set
2. The app will use relative paths automatically
3. Run `npm run build`

## Benefits

1. **Portability**: App works in any environment without code changes
2. **Security**: No hardcoded URLs in production builds
3. **Maintainability**: Centralized API configuration
4. **Flexibility**: Easy switching between environments

## Migration Notes

- All hardcoded `http://localhost:8080` and `http://127.0.0.1:8080` URLs have been removed
- API calls now use relative paths starting with `/hq/api/`
- Media URLs use relative paths starting with `/media/`
- The build process has been tested and works correctly

## Future Improvements

Consider implementing:
- API response caching
- Request/response interceptors
- Error handling middleware
- API versioning support
