/**
 * Frontend UI Test Suite
 * Tests all marketplace frontend features
 * Run with: node test/frontend-test.js
 */

import axios from 'axios'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8080'
const FRONTEND_URL = 'http://localhost:5175'
const TEST_EMAIL = 'barimahyawamponsah1844@gmail.com'
const TEST_PASSWORD = 'password'

let authToken = null
let testResults = []

// Test results tracker
function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL'
  const result = { name, passed, message, timestamp: new Date().toISOString() }
  testResults.push(result)
  console.log(`${status} - ${name}${message ? `: ${message}` : ''}`)
  return passed
}

// Helper function to make authenticated requests
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    
    if (authToken) {
      config.headers.Authorization = `Token ${authToken}`
    }
    
    if (data) {
      config.data = data
    }
    
    const response = await axios(config)
    return { success: true, data: response.data, status: response.status }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    }
  }
}

// Test 1: Frontend Server Accessibility
async function testFrontendServer() {
  console.log('\n=== Testing Frontend Server ===')
  
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 })
    if (response.status === 200) {
      logTest('Frontend Server Accessibility', true, `HTTP ${response.status}`)
      return true
    } else {
      logTest('Frontend Server Accessibility', false, `HTTP ${response.status}`)
      return false
    }
  } catch (error) {
    logTest('Frontend Server Accessibility', false, error.message)
    return false
  }
}

// Test 2: Authentication
async function testAuthentication() {
  console.log('\n=== Testing Authentication ===')
  
  try {
    const response = await apiCall('POST', '/hq/api/login/', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      is_ent: false,
    })
    
    if (response.success && response.data.token) {
      authToken = response.data.token
      logTest('Login (Buyer)', true, 'Token received')
      return true
    } else {
      logTest('Login (Buyer)', false, response.error?.error || 'No token received')
      return false
    }
  } catch (error) {
    logTest('Login (Buyer)', false, error.message)
    return false
  }
}

// Test 3: Check Entrepreneur Status
async function testEntrepreneurStatus() {
  console.log('\n=== Testing Entrepreneur Status ===')
  
  const response = await apiCall('GET', '/hq/api/entrepreneur/me/')
  
  if (response.success) {
    logTest('Check Entrepreneur Status', true, `Is entrepreneur: ${!!response.data?.store}`)
    return response.data
  } else if (response.status === 404) {
    logTest('Check Entrepreneur Status', true, 'User is not an entrepreneur (buyer only)')
    return null
  } else {
    logTest('Check Entrepreneur Status', false, response.error?.error || 'Failed to check status')
    return null
  }
}

// Test 4: Fetch Store
async function testFetchStore() {
  console.log('\n=== Testing Fetch Store ===')
  
  const response = await apiCall('GET', '/hq/api/marketplace/store/me/')
  
  if (response.success) {
    logTest('Fetch Store', true, `Store: ${response.data?.name || 'N/A'}`)
    return response.data
  } else if (response.status === 404) {
    logTest('Fetch Store', true, 'No store found (expected for new entrepreneurs)')
    return null
  } else {
    logTest('Fetch Store', false, response.error?.error || 'Failed to fetch store')
    return null
  }
}

// Test 5: Fetch Store Products
async function testFetchStoreProducts() {
  console.log('\n=== Testing Fetch Store Products ===')
  
  const response = await apiCall('GET', '/hq/api/marketplace/products/')
  
  if (response.success) {
    const products = Array.isArray(response.data) ? response.data : response.data?.results || []
    logTest('Fetch Store Products', true, `Found ${products.length} products`)
    return products
  } else {
    logTest('Fetch Store Products', false, response.error?.error || 'Failed to fetch products')
    return []
  }
}

// Test 6: Fetch Listings
async function testFetchListings() {
  console.log('\n=== Testing Fetch Listings ===')
  
  const response = await apiCall('GET', '/hq/api/marketplace/listings/')
  
  if (response.success) {
    const listings = Array.isArray(response.data) 
      ? response.data 
      : response.data?.results || []
    logTest('Fetch Listings', true, `Found ${listings.length} listings`)
    return listings
  } else {
    logTest('Fetch Listings', false, response.error?.error || 'Failed to fetch listings')
    return []
  }
}

// Test 7: Search Listings
async function testSearchListings() {
  console.log('\n=== Testing Search Functionality ===')
  
  const searchResponse = await apiCall('GET', '/hq/api/marketplace/listings/?q=test')
  
  if (searchResponse.success) {
    const results = Array.isArray(searchResponse.data) 
      ? searchResponse.data 
      : searchResponse.data?.results || []
    logTest('Search Listings', true, `Found ${results.length} results for query "test"`)
    return results
  } else {
    logTest('Search Listings', false, searchResponse.error?.error || 'Search failed')
    return []
  }
}

// Test 8: Fetch Categories
async function testFetchCategories() {
  console.log('\n=== Testing Categories ===')
  
  const response = await apiCall('GET', '/hq/api/marketplace/categories/')
  
  if (response.success) {
    const categories = Array.isArray(response.data) 
      ? response.data 
      : response.data?.results || []
    logTest('Fetch Categories', true, `Found ${categories.length} categories`)
    return categories
  } else {
    logTest('Fetch Categories', false, response.error?.error || 'Failed to fetch categories')
    return []
  }
}

// Test 9: Fetch Wallet
async function testFetchWallet() {
  console.log('\n=== Testing Wallet ===')
  
  const response = await apiCall('GET', '/hq/api/wallet/')
  
  if (response.success) {
    logTest('Fetch Wallet', true, `Balance: ${response.data?.balance || 0}, Escrow: ${response.data?.escrow_balance || 0}`)
    return response.data
  } else {
    logTest('Fetch Wallet', false, response.error?.error || 'Failed to fetch wallet')
    return null
  }
}

// Test 10: Fetch Orders
async function testFetchOrders() {
  console.log('\n=== Testing Orders ===')
  
  const response = await apiCall('GET', '/hq/api/orders/')
  
  if (response.success) {
    const orders = Array.isArray(response.data) 
      ? response.data 
      : response.data?.results || []
    logTest('Fetch Orders', true, `Found ${orders.length} orders`)
    return orders
  } else {
    logTest('Fetch Orders', false, response.error?.error || 'Failed to fetch orders')
    return []
  }
}

// Test 11: Frontend Pages Accessibility
async function testFrontendPages() {
  console.log('\n=== Testing Frontend Pages ===')
  
  const pages = [
    { path: '/', name: 'Home Page' },
    { path: '/browse', name: 'Browse Page' },
    { path: '/categories', name: 'Categories Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/favorites', name: 'Favorites Page' },
    { path: '/wallet', name: 'Wallet Page' },
    { path: '/orders', name: 'Orders Page' },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const page of pages) {
    try {
      const response = await axios.get(`${FRONTEND_URL}${page.path}`, { timeout: 5000 })
      if (response.status === 200) {
        logTest(`Frontend: ${page.name}`, true, `HTTP ${response.status}`)
        passed++
      } else {
        logTest(`Frontend: ${page.name}`, false, `HTTP ${response.status}`)
        failed++
      }
    } catch (error) {
      logTest(`Frontend: ${page.name}`, false, error.message)
      failed++
    }
  }
  
  return { passed, failed, total: pages.length }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Complete Marketplace Tests')
  console.log(`📡 Backend API: ${API_BASE}`)
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`)
  console.log(`👤 Test User: ${TEST_EMAIL}`)
  console.log('='.repeat(60))
  
  // Test frontend server
  await testFrontendServer()
  
  // Test authentication
  const loginSuccess = await testAuthentication()
  
  if (!loginSuccess) {
    console.log('\n❌ Authentication failed. Cannot proceed with other tests.')
    printSummary()
    return
  }
  
  // Run all tests
  await testEntrepreneurStatus()
  await testFetchStore()
  await testFetchStoreProducts()
  await testFetchListings()
  await testSearchListings()
  await testFetchCategories()
  await testFetchWallet()
  await testFetchOrders()
  await testFrontendPages()
  
  printSummary()
}

function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Summary')
  console.log('='.repeat(60))
  
  const passed = testResults.filter(r => r.passed).length
  const failed = testResults.filter(r => !r.passed).length
  const total = testResults.length
  
  console.log(`Total Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    testResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.message || 'No error message'}`)
      })
  }
  
  console.log('\n' + '='.repeat(60))
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})


