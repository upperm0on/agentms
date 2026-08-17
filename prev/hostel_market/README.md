# StayPal Marketplace

A comprehensive student marketplace UI/UX application built with React 19, matching the design system of hostel_react.

## Features

### Core Marketplace Features
- ✅ Store creation and management
- ✅ Product and Service listings
- ✅ Product vs Service distinction (Products: no escrow, Services: escrow with dual confirmation)
- ✅ Store browsing with categories
- ✅ Trending stores visibility algorithm
- ✅ Search and filtering
- ✅ Responsive design

### Components Built

#### UI Components (Reusable)
- `Button` - Multiple variants (default, outline, ghost, success, destructive)
- `Card` - CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `Modal` - Flexible modal with different sizes
- `Input` - Text input, Textarea, Select with validation

#### Marketplace Components
- `StoreCard` - Store preview card with engagement metrics
- `ProductCard` - Product/Service card with badges and actions
- `CreateStoreModal` - Complete store creation form
- `CreateListingModal` - Product/Service creation with type selection

#### Layout Components
- `NavBar` - Responsive navigation with mobile menu

#### Pages
- `MarketplaceHome` - Hero section, trending stores, featured listings, categories
- `BrowsePage` - Full browsing with filters, grid/list view, sorting

### Redux Store
- `marketplaceSlice` - Stores, products, services, categories, filters
- `authSlice` - Authentication state
- `orderSlice` - Order management
- `walletSlice` - Wallet balance, escrow, transactions, payouts

## Design System

Matches `hostel_react` design:
- Colors: Primary (#2563EB), Secondary (#1E3A8A), Success, Warning, etc.
- Fonts: Poppins (headings), Inter (body), Jost, Cabin
- Responsive breakpoints: Mobile (480px), Tablet (768px), Desktop (1024px)
- Shadows, spacing, and design patterns consistent with hostel_react

## Installation

```bash
npm install
npm run dev
```

The app runs on port 5174 (to avoid conflicts with hostel_react on 5173).

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── marketplace/     # Marketplace-specific components
│   └── layout/          # Layout components (NavBar, Footer)
├── pages/               # Page components
├── store/               # Redux store and slices
├── utils/               # Utility functions
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Next Steps (To Complete)

### Remaining Components Needed
1. **Order Management**
   - OrderCard
   - OrderDetail
   - OrderHistory
   - OrderConfirmation (for services)

2. **Wallet & Payout**
   - WalletBalance display
   - TransactionHistory
   - PayoutRequest form
   - Escrow display

3. **Delivery**
   - DriverSignup form
   - DeliveryTracking
   - DriverDashboard

4. **Store Management**
   - StoreDetail page
   - StoreProducts list
   - EditStore functionality

5. **Product/Service Detail**
   - ProductDetail page
   - ServiceDetail page
   - Image gallery
   - Contact seller

6. **Additional Pages**
   - Login/Signup pages
   - Profile page
   - Orders page
   - Wallet page
   - My Store page (seller dashboard)

### Features to Implement
- Search functionality
- Filter integration with Redux
- Image upload handling
- Form validation
- API integration ready (endpoints structured but not connected)
- Real-time updates (when backend ready)

## Notes

- All components are UI-only (no backend integration)
- Mock data used for demonstration
- Fully responsive design
- Matches hostel_react design patterns
- Ready for backend API integration

# hostel_market
