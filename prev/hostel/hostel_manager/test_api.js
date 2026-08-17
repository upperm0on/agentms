// Test script to check API endpoints
// Run this in browser console on the dashboard page

const testAPI = async () => {
  const token = localStorage.getItem('token');
  const baseURL = 'http://localhost:8000';
  
  
  if (!token) {
    return;
  }

  // Test 1: Consumer Request
  try {
    const consumerResponse = await fetch(`${baseURL}/hq/api/payments/consumer_request/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    
    const consumerData = await consumerResponse.json();
    
    if (consumerResponse.ok) {
    } else {
    }
  } catch (error) {
  }

  // Test 2: Reservations List
  try {
    const reservationsResponse = await fetch(`${baseURL}/hq/api/reservations/list/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    
    const reservationsData = await reservationsResponse.json();
    
    if (reservationsResponse.ok) {
    } else {
    }
  } catch (error) {
  }

  // Test 3: Basic connectivity
  try {
    const basicResponse = await fetch(`${baseURL}/hq/api/landing_page/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    
    const basicData = await basicResponse.json();
    
    if (basicResponse.ok) {
    } else {
    }
  } catch (error) {
  }
};

// Run the test
testAPI();
