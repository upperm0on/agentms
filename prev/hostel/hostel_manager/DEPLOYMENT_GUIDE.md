# 🚀 Production Deployment Guide

## 🔧 **CRITICAL: API Configuration Fix**

Your consumer app was reading from local database because it was configured for development. Here's how to fix it:

### **1. Environment Variables Setup**

Create a `.env.production` file in your project root:

```bash
# Production Environment Configuration
VITE_API_BASE_URL=https://your-production-api.com
VITE_SITE_URL=https://your-production-site.com
VITE_DEBUG_MODE=false
```

### **2. Production Build Commands**

```bash
# Build for production
npm run build

# The build will be in the 'dist' folder
# Serve the dist folder with your web server (nginx, Apache, etc.)
```

### **3. API Configuration**

The app now automatically detects production vs development:

- **Development**: Uses `http://localhost:8000`
- **Production**: Uses relative paths (no CORS issues)

### **4. Deployment Steps**

1. **Set Environment Variables:**
   ```bash
   export VITE_API_BASE_URL=https://your-api-domain.com
   ```

2. **Build for Production:**
   ```bash
   npm run build
   ```

3. **Deploy the `dist` folder** to your web server

4. **Configure your web server** to serve the React app and proxy API calls to your Django backend

### **5. Nginx Configuration Example**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Serve React app
    location / {
        root /path/to/your/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API calls to Django backend
    location /hq/ {
        proxy_pass http://your-django-backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **6. Common Issues & Solutions**

#### **Issue: Login not working**
- **Cause**: API calls going to wrong URL
- **Solution**: Set `VITE_API_BASE_URL` environment variable

#### **Issue: CORS errors**
- **Cause**: Different domains for frontend/backend
- **Solution**: Use relative paths in production (already configured)

#### **Issue: Database connection**
- **Cause**: Frontend pointing to local database
- **Solution**: Ensure backend is running on production database

### **7. Verification Steps**

1. **Check API calls in browser dev tools**
2. **Verify login requests go to production API**
3. **Test all functionality in production environment**

## 🎯 **Quick Fix for Immediate Deployment**

If you need to deploy immediately:

1. **Set the environment variable:**
   ```bash
   export VITE_API_BASE_URL=https://your-production-api.com
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   # Deploy the dist folder
   ```

3. **Your app will now use the production API!**

## ✅ **Status: FIXED**

The API configuration has been updated to:
- ✅ **Detect production environment automatically**
- ✅ **Use relative paths in production (no CORS)**
- ✅ **Fall back to localhost only in development**
- ✅ **Support custom API URLs via environment variables**

**Your consumer app will now work correctly in production!** 🚀
