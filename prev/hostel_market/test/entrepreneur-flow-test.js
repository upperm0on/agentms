#!/usr/bin/env node

/**
 * Test script for entrepreneur flow
 * Tests:
 * 1. Login as buyer
 * 2. Create store (becomes entrepreneur)
 * 3. Verify entrepreneur status
 * 4. Access MyStore
 * 5. Verify store data structure
 */

import axios from 'axios'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8080'
const TEST_EMAIL = 'barimahyawamponsah1844@gmail.com'
const TEST_PASSWORD = 'password'

let authToken = null
let entrepreneurData = null
let storeData = null

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(60))
  log(title, 'cyan')
  console.log('='.repeat(60))
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

async function testLoginAsBuyer() {
  logSection('Test 1: Login as Buyer')
  
  try {
    logInfo('Logging in as buyer (is_ent=false)...')
    const response = await axios.post(
      `${API_BASE}/hq/api/login/`,
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        is_ent: false,
      },
      { timeout: 10000 }
    )
    
    if (response.data.token) {
      authToken = response.data.token
      logSuccess(`Login successful! Token: ${authToken.substring(0, 20)}...`)
      logInfo(`is_entrepreneur: ${response.data.is_entrepreneur}`)
      logInfo(`has_entrepreneur: ${response.data.entrepreneur ? 'Yes' : 'No'}`)
      
      if (response.data.is_entrepreneur) {
        logWarning('User is already an entrepreneur!')
        entrepreneurData = response.data.entrepreneur
      } else {
        logSuccess('User is a buyer (not entrepreneur)')
      }
      
      return true
    } else {
      logError('Login failed: No token received')
      return false
    }
  } catch (error) {
    logError(`Login failed: ${error.message}`)
    if (error.response) {
      logError(`Status: ${error.response.status}`)
      logError(`Response: ${JSON.stringify(error.response.data, null, 2)}`)
    }
    return false
  }
}

async function testCheckEntrepreneurStatus() {
  logSection('Test 2: Check Entrepreneur Status')
  
  try {
    logInfo('Checking entrepreneur status (is_ent=true)...')
    const response = await axios.post(
      `${API_BASE}/hq/api/login/`,
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        is_ent: true,
      },
      { timeout: 10000 }
    )
    
    if (response.data.is_entrepreneur && response.data.entrepreneur) {
      logSuccess('User is an entrepreneur!')
      entrepreneurData = response.data.entrepreneur
      logInfo(`Entrepreneur ID: ${entrepreneurData.id}`)
      logInfo(`Has store: ${entrepreneurData.store ? 'Yes' : 'No'}`)
      logInfo(`Store ID: ${entrepreneurData.store_id || 'N/A'}`)
      
      if (entrepreneurData.store) {
        storeData = entrepreneurData.store
        logSuccess('Store data found in entrepreneur object!')
        logInfo(`Store Name: ${storeData.name}`)
        logInfo(`Store ID: ${storeData.id}`)
      } else if (entrepreneurData.store_id) {
        logWarning('Store ID found but store object missing')
      } else {
        logWarning('No store data found')
      }
      
      return true
    } else {
      logInfo('User is not an entrepreneur (expected for new users)')
      return true // This is expected for new users
    }
  } catch (error) {
    if (error.response && error.response.status === 403) {
      logInfo('User is not an entrepreneur (403 Forbidden)')
      return true // This is expected for new users
    } else {
      logError(`Check entrepreneur status failed: ${error.message}`)
      if (error.response) {
        logError(`Status: ${error.response.status}`)
        logError(`Response: ${JSON.stringify(error.response.data, null, 2)}`)
      }
      return false
    }
  }
}

async function testCreateStore() {
  logSection('Test 3: Create Store')
  
  if (!authToken) {
    logError('No auth token available')
    return false
  }
  
  // Check if user already has a store
  if (entrepreneurData && entrepreneurData.store) {
    logWarning('User already has a store! Skipping store creation.')
    logInfo(`Existing store: ${entrepreneurData.store.name}`)
    return true
  }
  
  try {
    logInfo('Creating store...')
    const storePayload = {
      name: `Test Store ${Date.now()}`,
      description: 'Test store created by entrepreneur flow test',
      location: 'Test Location',
      commodities: [
        {
          name: 'Test Product',
          description: 'A test product',
          type: 'product',
          price: 10.00
        }
      ]
    }
    
    logInfo(`Store name: ${storePayload.name}`)
    logInfo(`Commodities: ${storePayload.commodities.length}`)
    
    const response = await axios.post(
      `${API_BASE}/hq/api/store/create/`,
      storePayload,
      {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      }
    )
    
    if (response.data.status === 'success') {
      logSuccess('Store created successfully!')
      
      // Verify response structure
      if (response.data.entrepreneur) {
        logSuccess('Entrepreneur data found in response')
        entrepreneurData = response.data.entrepreneur
        
        // Check store in entrepreneur object
        if (entrepreneurData.store) {
          logSuccess('Store object found in entrepreneur data!')
          storeData = entrepreneurData.store
          logInfo(`Store Name: ${storeData.name}`)
          logInfo(`Store ID: ${storeData.id}`)
          logInfo(`Store Description: ${storeData.description}`)
        } else if (entrepreneurData.store_id) {
          logWarning('Store ID found but store object missing')
          logInfo(`Store ID: ${entrepreneurData.store_id}`)
        } else {
          logError('No store data found in entrepreneur object!')
          logError(`Entrepreneur data: ${JSON.stringify(entrepreneurData, null, 2)}`)
          return false
        }
        
        // Check store in response
        if (response.data.store) {
          logSuccess('Store data also found in response.store')
          logInfo(`Response store name: ${response.data.store.name}`)
        }
      } else {
        logError('No entrepreneur data in response!')
        logError(`Response: ${JSON.stringify(response.data, null, 2)}`)
        return false
      }
      
      return true
    } else {
      logError('Store creation failed: Invalid response')
      logError(`Response: ${JSON.stringify(response.data, null, 2)}`)
      return false
    }
  } catch (error) {
    logError(`Store creation failed: ${error.message}`)
    if (error.response) {
      logError(`Status: ${error.response.status}`)
      logError(`Response: ${JSON.stringify(error.response.data, null, 2)}`)
    }
    return false
  }
}

async function testVerifyEntrepreneurStatus() {
  logSection('Test 4: Verify Entrepreneur Status After Store Creation')
  
  if (!authToken) {
    logError('No auth token available')
    return false
  }
  
  try {
    logInfo('Verifying entrepreneur status after store creation...')
    const response = await axios.post(
      `${API_BASE}/hq/api/login/`,
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        is_ent: true,
      },
      { timeout: 10000 }
    )
    
    if (response.data.is_entrepreneur && response.data.entrepreneur) {
      logSuccess('User is confirmed as entrepreneur!')
      const freshEntrepreneurData = response.data.entrepreneur
      
      logInfo(`Entrepreneur ID: ${freshEntrepreneurData.id}`)
      logInfo(`Has store: ${freshEntrepreneurData.store ? 'Yes' : 'No'}`)
      logInfo(`Store ID: ${freshEntrepreneurData.store_id || 'N/A'}`)
      
      if (freshEntrepreneurData.store) {
        logSuccess('Store data found in fresh entrepreneur data!')
        logInfo(`Store Name: ${freshEntrepreneurData.store.name}`)
        logInfo(`Store ID: ${freshEntrepreneurData.store.id}`)
        
        // Verify store matches
        if (storeData && freshEntrepreneurData.store.id === storeData.id) {
          logSuccess('Store IDs match!')
        }
      } else if (freshEntrepreneurData.store_id) {
        logWarning('Store ID found but store object missing in fresh data')
        if (storeData && freshEntrepreneurData.store_id === storeData.id) {
          logSuccess('Store IDs match!')
        }
      } else {
        logError('No store data found in fresh entrepreneur data!')
        return false
      }
      
      return true
    } else {
      logError('User is not recognized as entrepreneur after store creation!')
      return false
    }
  } catch (error) {
    logError(`Verify entrepreneur status failed: ${error.message}`)
    if (error.response) {
      logError(`Status: ${error.response.status}`)
      logError(`Response: ${JSON.stringify(error.response.data, null, 2)}`)
    }
    return false
  }
}

async function testStoreDataStructure() {
  logSection('Test 5: Verify Store Data Structure')
  
  if (!entrepreneurData) {
    logError('No entrepreneur data available')
    return false
  }
  
  logInfo('Checking store data structure...')
  
  // Check 1: Store object exists
  const hasStoreObject = entrepreneurData.store !== null && entrepreneurData.store !== undefined
  if (hasStoreObject) {
    logSuccess('✅ Store object exists in entrepreneur data')
    logInfo(`   Store ID: ${entrepreneurData.store.id}`)
    logInfo(`   Store Name: ${entrepreneurData.store.name}`)
  } else {
    logWarning('⚠️  Store object missing in entrepreneur data')
  }
  
  // Check 2: Store ID exists
  const hasStoreId = entrepreneurData.store_id !== null && entrepreneurData.store_id !== undefined
  if (hasStoreId) {
    logSuccess('✅ Store ID exists in entrepreneur data')
    logInfo(`   Store ID: ${entrepreneurData.store_id}`)
  } else {
    logWarning('⚠️  Store ID missing in entrepreneur data')
  }
  
  // Check 3: At least one exists
  const hasStore = hasStoreObject || hasStoreId
  if (hasStore) {
    logSuccess('✅ User has a store (object or ID)')
  } else {
    logError('❌ User has no store data!')
    return false
  }
  
  // Check 4: Both exist and match
  if (hasStoreObject && hasStoreId) {
    if (entrepreneurData.store.id === entrepreneurData.store_id) {
      logSuccess('✅ Store object ID matches store_id')
    } else {
      logError('❌ Store object ID does not match store_id!')
      logError(`   Store object ID: ${entrepreneurData.store.id}`)
      logError(`   Store ID: ${entrepreneurData.store_id}`)
      return false
    }
  }
  
  return true
}

async function runAllTests() {
  logSection('Entrepreneur Flow Test Suite')
  logInfo(`API Base: ${API_BASE}`)
  logInfo(`Test Email: ${TEST_EMAIL}`)
  console.log('')
  
  const results = {
    login: false,
    checkStatus: false,
    createStore: false,
    verifyStatus: false,
    dataStructure: false,
  }
  
  // Test 1: Login as buyer
  results.login = await testLoginAsBuyer()
  if (!results.login) {
    logError('Login failed. Cannot continue tests.')
    return results
  }
  
  // Test 2: Check entrepreneur status
  results.checkStatus = await testCheckEntrepreneurStatus()
  
  // Test 3: Create store (if not already entrepreneur)
  if (!entrepreneurData || !entrepreneurData.store) {
    results.createStore = await testCreateStore()
  } else {
    logInfo('Skipping store creation (user already has store)')
    results.createStore = true
  }
  
  // Test 4: Verify entrepreneur status after store creation
  if (results.createStore) {
    results.verifyStatus = await testVerifyEntrepreneurStatus()
  }
  
  // Test 5: Verify store data structure
  if (entrepreneurData) {
    results.dataStructure = await testStoreDataStructure()
  }
  
  // Summary
  logSection('Test Summary')
  const totalTests = Object.keys(results).length
  const passedTests = Object.values(results).filter(r => r).length
  
  logInfo(`Total Tests: ${totalTests}`)
  logInfo(`Passed: ${passedTests}`)
  logInfo(`Failed: ${totalTests - passedTests}`)
  console.log('')
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      logSuccess(`${test}: PASSED`)
    } else {
      logError(`${test}: FAILED`)
    }
  })
  
  console.log('')
  if (passedTests === totalTests) {
    logSuccess('All tests passed! 🎉')
  } else {
    logError('Some tests failed. Please review the output above.')
  }
  
  return results
}

// Run tests
runAllTests()
  .then((results) => {
    const exitCode = Object.values(results).every(r => r) ? 0 : 1
    process.exit(exitCode)
  })
  .catch((error) => {
    logError(`Test suite error: ${error.message}`)
    process.exit(1)
  })

export { runAllTests }

