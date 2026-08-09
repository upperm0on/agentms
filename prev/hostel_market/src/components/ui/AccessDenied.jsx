import React from 'react'
import img from '../../javascript.svg'

function AccessDenied({
  title = "You're not a seller",
  subtitle = 'Switch to a seller account to access this page.',
  imageSrc = img,
  action,
}) {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{
        background: '#fff',
        border: '1px solid rgba(15,23,42,0.06)',
        borderRadius: 12,
        padding: 24,
        display: 'flex',
        gap: 24,
        alignItems: 'center',
      }}>
        <div style={{ flexShrink: 0 }}>
          <img src={imageSrc} alt="Not allowed" style={{ width: 140, height: 140, objectFit: 'contain', opacity: 0.9 }} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 6px 0' }}>{title}</h2>
          <p style={{ margin: 0, color: 'var(--color-muted-text)' }}>{subtitle}</p>
          {action && (<div style={{ marginTop: 14 }}>{action}</div>)}
        </div>
      </div>
    </div>
  )
}

export default AccessDenied


