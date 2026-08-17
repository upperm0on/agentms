import React, { useEffect } from 'react'

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function ConfirmPopover({ open, anchor, message = 'Are you sure?', confirmText = 'Delete', cancelText = 'Cancel', onConfirm, onCancel }) {
  if (!open) return null

  const padding = 8
  const width = 220
  const height = 86
  const vpW = window.innerWidth
  const vpH = window.innerHeight

  const left = clamp((anchor?.x || 0) + 12, padding, vpW - width - padding)
  const top = clamp((anchor?.y || 0) + 12, padding, vpH - height - padding)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCancel?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          left,
          top,
          width,
          background: '#111827',
          color: '#fff',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
          padding: 12,
        }}
      >
        <div style={{ fontSize: 14, lineHeight: 1.3 }}>{message}</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              appearance: 'none',
              background: 'transparent',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              appearance: 'none',
              background: '#ef4444',
              color: '#fff',
              border: '1px solid #dc2626',
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmPopover


