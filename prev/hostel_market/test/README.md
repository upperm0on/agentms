# Marketplace Test Suite

## Overview

This directory contains comprehensive tests for the marketplace application, including unit tests, integration tests, and manual testing scripts.

## Test Credentials

- **Email:** `barimahyawamponsah1844@gmail.com`
- **Password:** `spider*man13@`

## Test Files

### Unit Tests
- `test/services/marketplaceService.test.js` - Tests for marketplace API service
- `test/services/searchService.test.js` - Tests for search service

### Integration Tests
- `test/manual-test.js` - Full API integration tests (requires backend server)
- `test/connection-test.js` - Backend connection test

### Documentation
- `test/test-suite.md` - Comprehensive test checklist
- `test/TEST_REPORT.md` - Test results and status report

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

### Integration Tests

#### 1. Test Backend Connection
```bash
npm run test:connection
```

This will:
- Check if backend server is running on port 8080
- Test login endpoint
- Verify API accessibility

#### 2. Run Full Manual Test Suite
```bash
npm run test:manual
```

This will test:
- Authentication
- Store management
- Product/Service management
- Marketplace browsing
- Order management
- Wallet operations
- Image upload
- Search functionality

**Note:** These tests require the backend server to be running.

## Test Results

### Unit Tests ✅
- ✅ All marketplace service tests passing (10/10)
- ✅ All search service tests passing (5/5)
- **Total:** 15/15 tests passing

### Integration Tests ⏳
- ⏳ Requires backend server to be running
- ⏳ Connection test shows server is not accessible

## Test Coverage

### Services Tested
- ✅ `marketplaceService.js` - All functions tested
- ✅ `searchService.js` - All functions tested
- ⏳ `imageService.js` - Tests pending

### Hooks Tested
- ⏳ `useStoreData.js` - Tests pending
- ⏳ `useStoreSettings.js` - Tests pending
- ⏳ `useCreateListing.js` - Tests pending
- ⏳ `useContactSeller.js` - Tests pending
- ⏳ `useSearch.js` - Tests pending
- ⏳ `useImageUpload.js` - Tests pending

## Features Tested

### ✅ Implemented and Tested
1. **Service Functions**
   - Fetch store
   - Fetch store products
   - Update store settings
   - Create listing
   - Contact seller
   - Search listings
   - Search stores
   - Search products

### ⏳ Pending Backend Integration
1. **API Integration**
   - All endpoints require backend server
   - Authentication flow
   - Store operations
   - Order management
   - Wallet operations
   - Image upload

## Testing Checklist

### Before Running Tests
- [ ] Backend server is running on port 8080
- [ ] Database is accessible
- [ ] API endpoints are configured correctly
- [ ] Test credentials are valid

### Running Tests
1. [ ] Run connection test: `npm run test:connection`
2. [ ] If connection successful, run manual tests: `npm run test:manual`
3. [ ] Check test results in console
4. [ ] Review any failures
5. [ ] Fix issues and re-run tests

### Manual Testing
1. [ ] Start dev server: `npm run dev`
2. [ ] Navigate to http://localhost:5175
3. [ ] Test login with credentials
4. [ ] Test all marketplace features manually
5. [ ] Check browser console for errors
6. [ ] Verify Redux state updates

## Known Issues

1. **Backend Server Not Running**
   - Integration tests cannot run without backend
   - Connection test shows server is not accessible
   - Solution: Start Django development server

2. **API Endpoint Verification**
   - Some endpoints may need adjustment
   - Response formats may vary
   - Error handling needs verification

## Next Steps

1. **Start Backend Server**
   ```bash
   # In backend project directory
   python manage.py runserver 8080
   ```

2. **Run Connection Test**
   ```bash
   npm run test:connection
   ```

3. **Run Full Test Suite**
   ```bash
   npm run test:manual
   ```

4. **Manual Testing**
   - Start dev server
   - Test all features in browser
   - Verify functionality

## Test Results Summary

### Unit Tests
- **Total Tests:** 15
- **Passed:** 15 ✅
- **Failed:** 0
- **Success Rate:** 100%

### Integration Tests
- **Status:** ⏳ Pending Backend Server
- **Connection:** ❌ Server Not Running

## Conclusion

All unit tests are passing. Integration tests require the backend server to be running. All service files, hooks, and components have been created and are ready for testing.

**Status:** ✅ Unit Tests Complete | ⏳ Integration Tests Pending


