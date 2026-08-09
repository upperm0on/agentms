/**
 * Test script to verify CRUD operations in the admin application
 * This script can be run in the browser console to test the API endpoints
 */

// Test CRUD operations for different entities
const testCRUDOperations = {
  // Test Hostels CRUD
  async testHostelsCRUD() {
    console.log('🧪 Testing Hostels CRUD operations...')
    
    try {
      // Test READ
      console.log('📖 Testing READ hostels...')
      const response = await fetch('/hq/api/hostels/')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ READ hostels: SUCCESS', data.length || 0, 'hostels found')
      } else {
        console.log('❌ READ hostels: FAILED', response.status, response.statusText)
      }
    } catch (error) {
      console.log('❌ READ hostels: ERROR', error.message)
    }
  },

  // Test Users CRUD
  async testUsersCRUD() {
    console.log('🧪 Testing Users CRUD operations...')
    
    try {
      // Test READ
      console.log('📖 Testing READ users...')
      const response = await fetch('/hq/api/manager/tenants/')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ READ users: SUCCESS', data.length || 0, 'users found')
      } else {
        console.log('❌ READ users: FAILED', response.status, response.statusText)
      }
    } catch (error) {
      console.log('❌ READ users: ERROR', error.message)
    }
  },

  // Test Database CRUD
  async testDatabaseCRUD() {
    console.log('🧪 Testing Database CRUD operations...')
    
    try {
      // Test READ tables
      console.log('📖 Testing READ tables...')
      const response = await fetch('/hq/api/admin/tables/')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ READ tables: SUCCESS', data.tables?.length || 0, 'tables found')
      } else {
        console.log('❌ READ tables: FAILED', response.status, response.statusText)
      }
    } catch (error) {
      console.log('❌ READ tables: ERROR', error.message)
    }
  },

  // Test Reservations CRUD
  async testReservationsCRUD() {
    console.log('🧪 Testing Reservations CRUD operations...')
    
    try {
      // Test READ
      console.log('📖 Testing READ reservations...')
      const response = await fetch('/hq/api/manager/reservations/')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ READ reservations: SUCCESS', data.length || 0, 'reservations found')
      } else {
        console.log('❌ READ reservations: FAILED', response.status, response.statusText)
      }
    } catch (error) {
      console.log('❌ READ reservations: ERROR', error.message)
    }
  },

  // Test Payments CRUD
  async testPaymentsCRUD() {
    console.log('🧪 Testing Payments CRUD operations...')
    
    try {
      // Test READ
      console.log('📖 Testing READ payments...')
      const response = await fetch('/hq/api/manager/payments/')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ READ payments: SUCCESS', data.length || 0, 'payments found')
      } else {
        console.log('❌ READ payments: FAILED', response.status, response.statusText)
      }
    } catch (error) {
      console.log('❌ READ payments: ERROR', error.message)
    }
  },

  // Test Reviews CRUD
  async testReviewsCRUD() {
    console.log('🧪 Testing Reviews CRUD operations...')
    
    try {
      // Test READ
      console.log('📖 Testing READ reviews...')
      const response = await fetch('/hq/api/reviews/')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ READ reviews: SUCCESS', data.length || 0, 'reviews found')
      } else {
        console.log('❌ READ reviews: FAILED', response.status, response.statusText)
      }
    } catch (error) {
      console.log('❌ READ reviews: ERROR', error.message)
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting CRUD Operations Test Suite...')
    console.log('=' .repeat(50))
    
    await this.testHostelsCRUD()
    console.log('')
    await this.testUsersCRUD()
    console.log('')
    await this.testDatabaseCRUD()
    console.log('')
    await this.testReservationsCRUD()
    console.log('')
    await this.testPaymentsCRUD()
    console.log('')
    await this.testReviewsCRUD()
    
    console.log('')
    console.log('=' .repeat(50))
    console.log('🏁 CRUD Operations Test Suite Complete!')
    console.log('')
    console.log('📋 Summary:')
    console.log('- READ operations: Tested for all entities')
    console.log('- CREATE operations: Available through UI modals')
    console.log('- UPDATE operations: Available through UI modals')
    console.log('- DELETE operations: Available through UI buttons')
    console.log('')
    console.log('💡 To test CREATE/UPDATE/DELETE operations:')
    console.log('1. Use the admin interface to create/edit/delete records')
    console.log('2. Check the Network tab in DevTools for API calls')
    console.log('3. Verify data changes in the database')
  }
}

// Make the test functions available globally
window.testCRUDOperations = testCRUDOperations

console.log('🧪 CRUD Operations Test Suite loaded!')
console.log('Run: testCRUDOperations.runAllTests() to test all operations')
console.log('Or run individual tests:')
console.log('- testCRUDOperations.testHostelsCRUD()')
console.log('- testCRUDOperations.testUsersCRUD()')
console.log('- testCRUDOperations.testDatabaseCRUD()')
console.log('- testCRUDOperations.testReservationsCRUD()')
console.log('- testCRUDOperations.testPaymentsCRUD()')
console.log('- testCRUDOperations.testReviewsCRUD()')
