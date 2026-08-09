# Marketplace Test Suite

## Test Credentials
- Email: `barimahyawamponsah1844@gmail.com`
- Password: `spider*man13@`

## Test Categories

### 1. Authentication Tests
- [ ] Login as buyer
- [ ] Login as entrepreneur/seller
- [ ] Check entrepreneur status
- [ ] Token validation
- [ ] Logout functionality

### 2. Store Management Tests
- [ ] Fetch current user's store
- [ ] Create new store
- [ ] Update store settings
- [ ] Fetch store products
- [ ] Store visibility (public/private)

### 3. Product/Service Management Tests
- [ ] Create product listing
- [ ] Create service listing
- [ ] Update listing
- [ ] Delete listing
- [ ] Fetch listing by ID
- [ ] Product vs Service distinction

### 4. Marketplace Browsing Tests
- [ ] Fetch all listings
- [ ] Search listings by query
- [ ] Filter by category
- [ ] Filter by type (product/service)
- [ ] Filter by price range
- [ ] Sort listings (recent, price, popular)
- [ ] Pagination

### 5. Store Detail Tests
- [ ] View store profile
- [ ] View store listings
- [ ] View store about section
- [ ] View store contact info
- [ ] Favorite/unfavorite store

### 6. Product Detail Tests
- [ ] View product details
- [ ] View image gallery
- [ ] Contact seller
- [ ] Favorite/unfavorite product
- [ ] Place order for product
- [ ] Place order for service

### 7. Order Management Tests
- [ ] Fetch user orders
- [ ] View order details
- [ ] Filter orders by status
- [ ] Search orders
- [ ] Confirm service order (release escrow)
- [ ] Cancel order

### 8. Wallet Tests
- [ ] Fetch wallet balance
- [ ] View escrow balance
- [ ] View transaction history
- [ ] Request payout
- [ ] Withdraw funds

### 9. Favorites Tests
- [ ] Add product to favorites
- [ ] Remove product from favorites
- [ ] Add store to favorites
- [ ] Remove store from favorites
- [ ] View favorites page
- [ ] Clear all favorites

### 10. Image Upload Tests
- [ ] Upload single image
- [ ] Upload multiple images
- [ ] Upload store logo
- [ ] Upload store banner
- [ ] Image upload progress tracking
- [ ] Image upload error handling

### 11. Search Tests
- [ ] Search listings
- [ ] Search stores
- [ ] Search products
- [ ] Search with filters
- [ ] Search with category filter
- [ ] Search with price range

### 12. Category Tests
- [ ] Fetch all categories
- [ ] View category page
- [ ] Filter by category
- [ ] Category-specific stores
- [ ] Category-specific products

### 13. Delivery Tests (if applicable)
- [ ] Driver signup
- [ ] View delivery tracking
- [ ] Driver dashboard
- [ ] Delivery status updates

### 14. UI Component Tests
- [ ] Button component variants
- [ ] Modal component
- [ ] Input validation
- [ ] Card components
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

### 15. Service Integration Tests
- [ ] marketplaceService.js functions
- [ ] searchService.js functions
- [ ] imageService.js functions
- [ ] All hooks (useStoreData, useStoreSettings, etc.)

## Manual Testing Checklist

### Before Running Tests
1. Ensure backend server is running on `http://localhost:8080`
2. Verify database is accessible
3. Check API endpoints are configured correctly

### Running Tests
1. Run `node test/manual-test.js` to test API endpoints
2. Run development server: `npm run dev`
3. Manually test UI features in browser
4. Check browser console for errors
5. Verify Redux state updates

## Expected API Endpoints

### Authentication
- `POST /hq/api/login/` - Login user
- `GET /hq/api/entrepreneur/me/` - Check entrepreneur status

### Store Management
- `GET /hq/api/marketplace/store/me/` - Get current store
- `PUT /hq/api/marketplace/store/settings/` - Update store settings
- `POST /hq/api/store/create/` - Create store

### Listings
- `GET /hq/api/marketplace/listings/` - Get all listings
- `GET /hq/api/marketplace/listings/?q=query` - Search listings
- `GET /hq/api/products/:id` - Get product by ID
- `GET /hq/api/stores/:id` - Get store by ID
- `POST /hq/api/marketplace/listings/create/` - Create listing

### Products
- `GET /hq/api/marketplace/products/` - Get store products

### Orders
- `GET /hq/api/orders/` - Get user orders
- `POST /hq/api/orders` - Place order
- `POST /hq/api/orders/:id/release` - Release escrow

### Wallet
- `GET /hq/api/wallet/` - Get wallet balance
- `POST /hq/api/wallet/withdraw` - Withdraw funds

### Categories
- `GET /hq/api/marketplace/categories/` - Get categories

### Contact
- `POST /hq/api/marketplace/contact/` - Contact seller

### Image Upload
- `POST /hq/api/marketplace/upload/` - Upload image
- `POST /hq/api/marketplace/store/logo/` - Upload logo
- `POST /hq/api/marketplace/store/banner/` - Upload banner

## Test Results Template

```markdown
## Test Run: [Date]

### Authentication
- Login: ✅/❌
- Entrepreneur Check: ✅/❌

### Store Management
- Fetch Store: ✅/❌
- Update Settings: ✅/❌

### Listings
- Fetch Listings: ✅/❌
- Create Listing: ✅/❌
- Search: ✅/❌

### Orders
- Fetch Orders: ✅/❌
- Place Order: ✅/❌

### Wallet
- Fetch Wallet: ✅/❌
- Withdraw: ✅/❌

### Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Success Rate: XX%
```


