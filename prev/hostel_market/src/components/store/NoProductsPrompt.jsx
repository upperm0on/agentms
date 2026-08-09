import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackagePlus } from 'lucide-react'
import { Button } from '../ui/Button'
import AddItemWizard from './AddItemWizard'

function NoProductsPrompt({ store }) {
  const navigate = useNavigate()
  const [openProduct, setOpenProduct] = useState(false)
  const [openService, setOpenService] = useState(false)
  return (
    <div className="container" style={{ padding: '32px 0' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', background: '#fff', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 14, boxShadow: '0 6px 18px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.04)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackagePlus size={20} color="#10b981" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{store?.name || 'Your Store'}</h1>
            <p style={{ margin: '6px 0 0 0', color: 'var(--color-muted-text)' }}>Add your first product or service to start selling.</p>
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <Button onClick={() => setOpenProduct(true)}>Add Product</Button>
          <Button variant="outline" onClick={() => setOpenService(true)}>Add Service</Button>
        </div>
      </div>
      <AddItemWizard open={openProduct} onClose={() => setOpenProduct(false)} mode="product" />
      <AddItemWizard open={openService} onClose={() => setOpenService(false)} mode="service" />
    </div>
  )
}

export default NoProductsPrompt


