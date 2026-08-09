import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { Skeleton, SkeletonText } from '../components/ui/Skeleton'
import { fetchStore } from '../services/marketplaceService'
import { useStoreSettings } from '../hooks/useStoreSettings'
import { useToast } from '../contexts/ToastContext'
import { useDebounce } from '../hooks/useDebounce'
import { X, Save } from 'lucide-react'

const STORAGE_KEY = 'store_settings_draft'

function StoreSettings() {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const { entrepreneur } = useSelector(state => state.auth)
  const { saveSettings, loading: savingSettings, error: saveError } = useStoreSettings()
  const [fetching, setFetching] = useState(true)
  const [savedIndicator, setSavedIndicator] = useState(false)
  const autoSaveTimerRef = useRef(null)

  const [form, setForm] = useState(() => {
    // Try to restore from localStorage first
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (err) {
      console.error('Failed to restore form from localStorage:', err)
    }
    
    return {
      name: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      deliveryEnabled: true,
      pickupEnabled: true,
      visibility: 'public',
    }
  })
  
  // Debounce form data for auto-save
  const debouncedForm = useDebounce(form, 2000) // Auto-save after 2 seconds of inactivity

  // Auto-save to localStorage
  useEffect(() => {
    // Don't auto-save if form hasn't changed or is initial load
    if (fetching) return
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(debouncedForm))
      setSavedIndicator(true)
      
      // Clear saved indicator after 2 seconds
      const timer = setTimeout(() => {
        setSavedIndicator(false)
      }, 2000)
      
      return () => clearTimeout(timer)
    } catch (err) {
      console.error('Failed to save form to localStorage:', err)
    }
  }, [debouncedForm, fetching])

  // Fetch store settings on mount
  useEffect(() => {
    const loadStoreSettings = async () => {
      setFetching(true)
      try {
        const storeData = await fetchStore()
        if (storeData) {
          const newForm = {
            name: storeData.name || '',
            description: storeData.description || '',
            email: storeData.contact_email || storeData.email || '',
            phone: storeData.contact_phone || storeData.phone || '',
            address: storeData.address || storeData.location || '',
            deliveryEnabled: storeData.delivery_enabled !== false,
            pickupEnabled: storeData.pickup_enabled !== false,
            visibility: storeData.visibility || 'public',
          }
          setForm(newForm)
          // Clear localStorage draft when loading from server
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch (err) {
        console.error('Failed to fetch store settings:', err)
        // Fallback to entrepreneur store data
        if (entrepreneur?.store) {
          const newForm = {
            name: entrepreneur.store.name || '',
            description: entrepreneur.store.description || '',
            email: entrepreneur.store.contact_email || '',
            phone: entrepreneur.store.contact_phone || '',
            address: entrepreneur.store.address || entrepreneur.store.location || '',
            deliveryEnabled: true,
            pickupEnabled: true,
            visibility: 'public',
          }
          setForm(newForm)
        }
      } finally {
        setFetching(false)
      }
    }

    loadStoreSettings()
  }, [entrepreneur])

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    
    try {
      const settingsData = {
        name: form.name,
        description: form.description,
        contact_email: form.email,
        contact_phone: form.phone,
        address: form.address,
        delivery_enabled: form.deliveryEnabled,
        pickup_enabled: form.pickupEnabled,
        visibility: form.visibility,
      }
      
      await saveSettings(settingsData)
      
      // Clear localStorage draft on successful save
      localStorage.removeItem(STORAGE_KEY)
      
      success('Store settings saved successfully!')
      navigate('/my-store')
    } catch (error) {
      console.error('Failed to save settings:', error)
      showError(error.message || saveError || 'Failed to save store settings. Please try again.')
    }
  }

  if (fetching) {
    return (
      <div className="container" style={{ padding: '24px 0' }}>
        <div style={{ marginBottom: '24px' }}>
          <Skeleton variant="block" size="lg" width="200px" height="32px" />
          <Skeleton variant="block" size="md" width="300px" height="16px" style={{ marginTop: '8px' }} />
        </div>
        <div style={{ display: 'grid', gap: '16px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ 
              background: '#fff', 
              border: '1px solid rgba(15,23,42,0.06)', 
              borderRadius: 12, 
              padding: 16 
            }}>
              <Skeleton variant="block" size="md" width="120px" height="20px" style={{ marginBottom: '12px' }} />
              <SkeletonText lines={i === 0 ? 2 : 1} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ margin: 0 }}>Store Settings</h1>
            {savedIndicator && (
              <span style={{ 
                fontSize: '12px', 
                color: '#10b981', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px' 
              }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: '#10b981' 
                }} />
                Saved
              </span>
            )}
          </div>
          <p style={{ marginTop: 6, color: 'var(--color-muted-text)' }}>Manage your store profile and preferences.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" onClick={() => navigate('/my-store')} disabled={savingSettings} aria-label="Cancel" title="Cancel">
            <X size={18} />
            <span className="button-text">Cancel</span>
          </Button>
          <Button onClick={handleSave} disabled={savingSettings} aria-label="Save Changes" title="Save Changes">
            <Save size={18} />
            <span className="button-text">Save</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gap: 16 }}>
        <section style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Basic Info</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <Input
              label="Store Name"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Your store name"
              required
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="What do you sell?"
              rows={4}
            />
          </div>
        </section>

        <section style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Contact</h3>
          <div className="form-row">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => updateField('email', e.target.value)}
              placeholder="store@example.com"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={e => updateField('phone', e.target.value)}
              placeholder="e.g. +233 24 000 0000"
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <Input
              label="Address"
              type="text"
              value={form.address}
              onChange={e => updateField('address', e.target.value)}
              placeholder="Street, City, Region"
            />
          </div>
        </section>

        <section style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Fulfillment</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.deliveryEnabled}
                onChange={e => updateField('deliveryEnabled', e.target.checked)}
              />
              <span>Delivery enabled</span>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.pickupEnabled}
                onChange={e => updateField('pickupEnabled', e.target.checked)}
              />
              <span>Pickup enabled</span>
            </label>
          </div>
        </section>

        <section style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Visibility</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input
                type="radio"
                name="visibility"
                checked={form.visibility === 'public'}
                onChange={() => updateField('visibility', 'public')}
              />
              <span>Public</span>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input
                type="radio"
                name="visibility"
                checked={form.visibility === 'private'}
                onChange={() => updateField('visibility', 'private')}
              />
              <span>Private</span>
            </label>
          </div>
        </section>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type="button" variant="outline" onClick={() => navigate('/my-store')} disabled={savingSettings} aria-label="Cancel" title="Cancel">
            <X size={18} />
            <span className="button-text">Cancel</span>
          </Button>
          <Button type="submit" disabled={savingSettings} aria-label="Save Changes" title="Save Changes">
            <Save size={18} />
            <span className="button-text">Save</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StoreSettings


