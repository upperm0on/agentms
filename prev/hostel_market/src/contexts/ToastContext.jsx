import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { Toast, ToastContainer } from '../components/ui/Toast'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import './ToastContext.css'

const ToastContext = createContext(null)
const MAX_TOASTS = 5 // Maximum number of toasts to show at once

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const removeToast = useCallback((id) => {
    // Clear timer if exists
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      ...toast,
      duration: toast.duration !== undefined ? toast.duration : 5000,
      persistent: toast.persistent || false,
      actions: toast.actions || [],
    }
    
    setToasts((prev) => {
      // Limit number of toasts
      const newToasts = [...prev, newToast]
      if (newToasts.length > MAX_TOASTS) {
        // Remove oldest toast
        const oldest = newToasts.shift()
        const oldestTimer = timersRef.current.get(oldest.id)
        if (oldestTimer) {
          clearTimeout(oldestTimer)
          timersRef.current.delete(oldest.id)
        }
      }
      return newToasts
    })
    
    // Set auto-dismiss timer if duration > 0 and not persistent
    if (newToast.duration > 0 && !newToast.persistent) {
      const timer = setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
      timersRef.current.set(id, timer)
    }
    
    return id
  }, [removeToast])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  const success = useCallback((message, options = {}) => {
    const { title = 'Success', duration, persistent, actions } = options
    return addToast({ 
      variant: 'success', 
      title, 
      description: message, 
      icon: CheckCircle2,
      duration,
      persistent,
      actions,
    })
  }, [addToast])

  const error = useCallback((message, options = {}) => {
    const { title = 'Error', duration, persistent, actions } = options
    return addToast({ 
      variant: 'error', 
      title, 
      description: message, 
      icon: AlertCircle,
      duration,
      persistent,
      actions,
    })
  }, [addToast])

  const info = useCallback((message, options = {}) => {
    const { title = 'Info', duration, persistent, actions } = options
    return addToast({ 
      variant: 'info', 
      title, 
      description: message, 
      icon: Info,
      duration,
      persistent,
      actions,
    })
  }, [addToast])

  const warning = useCallback((message, options = {}) => {
    const { title = 'Warning', duration, persistent, actions } = options
    return addToast({ 
      variant: 'warning', 
      title, 
      description: message, 
      icon: AlertTriangle,
      duration,
      persistent,
      actions,
    })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ 
      addToast, 
      removeToast, 
      success, 
      error, 
      info, 
      warning,
      toasts, // Expose toasts for debugging
    }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

