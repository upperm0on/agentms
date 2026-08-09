import React, { useState } from 'react'
import OpenStore from '../../pages/OpenStore'

function CreateStorePrompt() {
  const [showSetup, setShowSetup] = useState(false)

  // When setup is shown, render THE EXACT SAME OpenStore component
  if (showSetup) {
    return <OpenStore />
  }

  // Initial prompt before setup
  return (
    <div className="container" style={{ padding: '32px 0' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', background: '#fff', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 14, boxShadow: '0 6px 18px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.04)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(210,105,30,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D2691E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Create your store</h1>
            <p style={{ margin: '6px 0 0 0', color: 'var(--color-muted-text)' }}>You don't have a store yet. Let's set it up in a few quick steps.</p>
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowSetup(true)}
            style={{
              padding: '10px 20px',
              background: '#D2691E',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Start Setup
          </button>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: 'var(--color-dark-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateStorePrompt


