import React, { useState } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

const DashboardDebug = () => {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoint = async (name, endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: body ? JSON.stringify(body) : null,
      });

      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        data = { error: 'Could not parse JSON response' };
      }

      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          ok: response.ok,
          data,
          error: null
        }
      }));

      return { status: response.status, ok: response.ok, data };
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'Network Error',
          ok: false,
          data: null,
          error: error.message
        }
      }));
      return { status: 'Network Error', ok: false, data: null, error: error.message };
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setResults({});

    // Test 1: Consumer Request
    await testEndpoint(
      'Consumer Request',
      buildApiUrl(API_ENDPOINTS.CONSUMER_REQUEST),
      'POST'
    );

    // Test 2: Reservations List
    await testEndpoint(
      'Reservations List',
      buildApiUrl(API_ENDPOINTS.RESERVATIONS_LIST),
      'GET'
    );

    // Test 3: Basic connectivity
    await testEndpoint(
      'Basic Connectivity',
      buildApiUrl('/hq/api/landing_page/'),
      'GET'
    );

    setIsLoading(false);
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f5f5f5', 
      margin: '20px',
      borderRadius: '8px',
      fontFamily: 'monospace'
    }}>
      <h2>Dashboard API Debug</h2>
      <button 
        onClick={runAllTests}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Testing...' : 'Run All Tests'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Test Results:</h3>
        {Object.entries(results).map(([name, result]) => (
          <div key={name} style={{ 
            margin: '10px 0', 
            padding: '10px', 
            background: result.ok ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.ok ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            <strong>{name}:</strong>
            <div>Status: {result.status}</div>
            <div>OK: {result.ok ? 'Yes' : 'No'}</div>
            {result.error && <div>Error: {result.error}</div>}
            {result.data && (
              <div>
                <details>
                  <summary>Response Data</summary>
                  <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Current Configuration:</h3>
        <div>Base URL: {buildApiUrl('')}</div>
        <div>Consumer Endpoint: {buildApiUrl(API_ENDPOINTS.CONSUMER_REQUEST)}</div>
        <div>Reservations Endpoint: {buildApiUrl(API_ENDPOINTS.RESERVATIONS_LIST)}</div>
        <div>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
        <div>Email: {localStorage.getItem('email') || 'Missing'}</div>
      </div>
    </div>
  );
};

export default DashboardDebug;
