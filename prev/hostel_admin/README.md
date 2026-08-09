# Hostel Admin Dashboard

A comprehensive admin dashboard for managing hostels, users, reservations, and analytics. Built with React, Redux Toolkit, and modern UI components.

## 🚀 Features

### 📊 Dashboard
- **Overview Statistics**: Total hostels, users, reservations, and revenue
- **Interactive Charts**: Revenue trends, occupancy rates, and user growth
- **Recent Activity**: Real-time updates on system activities
- **Quick Actions**: Fast access to common tasks

### 🏢 Hostel Management
- **CRUD Operations**: Create, read, update, and delete hostels
- **Advanced Search**: Filter hostels by name, campus, or status
- **Image Management**: Upload and manage hostel images
- **Room Details**: Manage room types and pricing
- **Status Management**: Activate/deactivate hostels

### 👥 User Management
- **User Types**: Manage tenants, managers, and admins
- **Profile Management**: Complete user profiles with contact information
- **Role-based Access**: Different permissions for different user types
- **Bulk Operations**: Manage multiple users at once

### 📅 Reservation Management
- **Reservation Overview**: View all reservations with filtering options
- **Status Tracking**: Pending, confirmed, cancelled reservations
- **Payment Management**: Track payment status and confirmations
- **Date Range Filtering**: Filter by specific time periods

### 📈 Analytics & Reporting
- **Revenue Analytics**: Track income trends and patterns
- **Occupancy Reports**: Monitor hostel occupancy rates
- **User Growth**: Track user registration and activity
- **Interactive Charts**: Visualize data with Recharts
- **Export Options**: Download reports in various formats

### ⚙️ Settings & Configuration
- **General Settings**: Application configuration
- **Profile Management**: Admin profile settings
- **Security Settings**: Password management and 2FA
- **Notification Preferences**: Customize notification settings
- **Data & Privacy**: Privacy controls and data management

## 🛠️ Technology Stack

- **Frontend**: React 19.1.1
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **UI Components**: Custom components with Lucide React icons
- **Charts**: Recharts
- **Styling**: CSS3 with modern design patterns
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hostel_admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your API configuration:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Analytics/       # Analytics components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard components
│   ├── Hostels/        # Hostel management components
│   ├── Layout/         # Layout components (Sidebar, Header)
│   ├── Reservations/   # Reservation components
│   └── Users/          # User management components
├── pages/              # Page components
│   ├── Analytics/      # Analytics page
│   ├── Dashboard/      # Dashboard page
│   ├── Hostels/        # Hostels page
│   ├── Login/          # Login page
│   ├── Reservations/   # Reservations page
│   ├── Settings/       # Settings page
│   └── Users/          # Users page
├── services/           # API services
│   └── api.js         # API configuration and endpoints
├── store/             # Redux store
│   ├── slices/        # Redux slices
│   └── store.js       # Store configuration
└── utils/             # Utility functions
```

## 🔧 Configuration

### API Configuration
The app connects to a Django backend API. Configure the API base URL in your environment variables:

```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
```

### Redux Store
The app uses Redux Toolkit for state management with the following slices:
- `authSlice`: Authentication state
- `hostelsSlice`: Hostel management
- `usersSlice`: User management
- `reservationsSlice`: Reservation management
- `analyticsSlice`: Analytics data

## 🎨 Design System

### Color Palette
- **Primary**: #3b82f6 (Blue)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Orange)
- **Error**: #ef4444 (Red)
- **Neutral**: #64748b (Gray)

### Typography
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Font Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Components
- **Cards**: Rounded corners (12px), subtle shadows
- **Buttons**: Consistent padding, hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Sidebar with active states

## 📱 Responsive Design

The admin dashboard is fully responsive and works on:
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Mobile-first design with touch-friendly interfaces

## 🔐 Authentication

The app includes a complete authentication system:
- **Login/Logout**: Secure authentication flow
- **Protected Routes**: Route protection for authenticated users
- **Token Management**: Automatic token handling
- **Session Persistence**: Maintains login state across browser sessions

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set the following environment variables for production:
- `VITE_API_BASE_URL`: Your production API URL
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version

### Nginx Configuration
Example Nginx configuration for serving the built files:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://your-api-server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

### Version 1.0.0
- Initial release
- Complete admin dashboard
- All CRUD operations
- Analytics and reporting
- Responsive design
- Authentication system

---

**Built with ❤️ for efficient hostel management**