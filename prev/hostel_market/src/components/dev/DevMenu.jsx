import React from 'react'
import { Link } from 'react-router-dom'

function DevMenu() {
  // Role toggler removed as requested
  return (
    <div style={{
      position: 'fixed',
      right: '16px',
      bottom: '16px',
      zIndex: 2000,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      borderRadius: '12px',
      padding: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: 'var(--font-body, system-ui)',
    }}>
      <Link to="/delivery/tracking" style={{ fontSize: 12 }}>Tracking</Link>
      <Link to="/delivery/driver" style={{ fontSize: 12 }}>Driver</Link>
      <Link to="/delivery/signup" style={{ fontSize: 12 }}>Signup</Link>
    </div>
  )
}

export default DevMenu


