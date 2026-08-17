// Debug script to test API endpoints
// Run this in the browser console to test the API calls

const testAPI = async () => {
  const token = localStorage.getItem('token');
  const baseURL = 'http://localhost:8000';
  
  
  // Test consumer request
  try {
    const consumerResponse = await fetch(`${baseURL}/hq/api/payments/consumer_request/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    
    const consumerData = await consumerResponse.json();
  } catch (error) {
  }
  
  // Test reservations list
  try {
    const reservationsResponse = await fetch(`${baseURL}/hq/api/reservations/list/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    
    const reservationsData = await reservationsResponse.json();
  } catch (error) {
  }
};

// Run the test
testAPI();
