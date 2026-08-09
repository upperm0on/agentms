/**
 * Simple Connection Test
 * Tests if the backend server is accessible
 */

import axios from 'axios'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8080'

async function testConnection() {
  console.log('🔍 Testing Backend Connection...')
  console.log(`📡 API Base URL: ${API_BASE}`)
  console.log('='.repeat(60))
  
  // Test 1: Server reachability
  try {
    console.log('\n1. Testing server reachability...')
    const response = await axios.get(`${API_BASE}/`, { timeout: 5000 })
    console.log('✅ Server is reachable')
    console.log(`   Status: ${response.status}`)
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running or not accessible')
      console.log(`   Error: Connection refused to ${API_BASE}`)
      console.log('\n💡 Make sure the backend server is running on port 8080')
      return false
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Server connection timeout')
      console.log(`   Error: Request timed out`)
      return false
    } else {
      console.log(`⚠️  Server responded with status: ${error.response?.status || 'unknown'}`)
      // Server exists but endpoint might not exist - that's okay
    }
  }
  
  // Test 2: Login endpoint
  try {
    console.log('\n2. Testing login endpoint...')
    const response = await axios.post(
      `${API_BASE}/hq/api/login/`,
      {
        email: 'barimahyawamponsah1844@gmail.com',
        password: 'password',
        is_ent: false,
      },
      { timeout: 10000 }
    )
    
    if (response.data?.token) {
      console.log('✅ Login endpoint is working')
      console.log(`   Token received: ${response.data.token.substring(0, 20)}...`)
      return true
    } else {
      console.log('⚠️  Login endpoint responded but no token received')
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`)
      return false
    }
  } catch (error) {
    if (error.response) {
      console.log(`❌ Login endpoint returned error: ${error.response.status}`)
      console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`)
    } else {
      console.log(`❌ Login endpoint failed: ${error.message}`)
    }
    return false
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('\n' + '='.repeat(60))
      console.log('✅ Connection test passed!')
      console.log('You can now run the full test suite: node test/manual-test.js')
    } else {
      console.log('\n' + '='.repeat(60))
      console.log('❌ Connection test failed!')
      console.log('Please check:')
      console.log('1. Backend server is running on port 8080')
      console.log('2. Database is accessible')
      console.log('3. API endpoints are configured correctly')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

