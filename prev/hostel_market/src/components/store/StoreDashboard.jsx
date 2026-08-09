import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../marketplace/ProductCard'
import { Button } from '../ui/Button'
import AddItemWizard from './AddItemWizard'
import ConfirmPopover from '../ui/ConfirmPopover'
import CreateStoreModal from '../marketplace/CreateStoreModal'
import StoreBanner from './StoreBanner'
import StoreLogo from './StoreLogo'
import './StoreDashboard.css'
import StoreAnalytics from './StoreAnalytics'
import StoreAnalyticsDashboard from './StoreAnalyticsDashboard'
import { LayoutGrid, ClipboardList, LineChart, Settings, PackagePlus, Wrench } from 'lucide-react'
import { updateStoreSettings } from '../../services/marketplaceService'
import { useDispatch } from 'react-redux'
import { setEntrepreneur } from '../../store/slices/authSlice'

function StoreDashboard({ store, products = [], isSeller, onCreateItem, onUpdateItem, onDeleteItem, onUpdateStore }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [openProduct, setOpenProduct] = useState(false)
  const [openService, setOpenService] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editStore, setEditStore] = useState(false)
  const [deleteCtx, setDeleteCtx] = useState(null) // { id, x, y }
  const [activeTab, setActiveTab] = useState('analytics') // analytics | products | services

  // Debug: Log store and products data
  React.useEffect(() => {
    console.log('StoreDashboard: Store and products data', {
      store,
      storeId: store?.id,
      productsCount: products.length,
      products: products
    })
  }, [store, products])

  const productItems = useMemo(() => products.filter(p => p.type === 'product'), [products])
  const serviceItems = useMemo(() => products.filter(p => p.type === 'service'), [products])
  const heroActions = isSeller ? (
    <div className="store-hero-actions">
      <Button variant="outline" onClick={() => setOpenProduct(true)} aria-label="Add Product" title="Add Product">
        <PackagePlus size={18} />
        <span className="button-text">Add Product</span>
      </Button>
      <Button variant="outline" onClick={() => setOpenService(true)} aria-label="Add Service" title="Add Service">
        <Wrench size={18} />
        <span className="button-text">Add Service</span>
      </Button>
      <Button variant="outline" onClick={() => setEditStore(true)} aria-label="Edit Store" title="Edit Store">
        <Settings size={18} />
        <span className="button-text">Edit Store</span>
      </Button>
    </div>
  ) : null

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <section className="store-hero">
        <StoreBanner 
          bannerUrl={store?.banner_url || store?.banner || store?.cover_photo}
          banner={store?.banner || store?.cover_photo}
          alt={store?.name || 'Store banner'}
          height={180}
          className="store-hero-banner"
        />
        <div className="store-hero-content">
          <StoreLogo 
            logoUrl={store?.logo_url || store?.logo}
            logo={store?.logo}
            alt={store?.name || 'Store logo'}
            size={80}
            className="store-hero-logo"
          />
          <div className="store-meta">
            <h1 className="store-name">{store?.name || 'My Store'}</h1>
            {store?.description && (
              <p className="store-desc">{store.description}</p>
            )}
          </div>
          {heroActions}
        </div>
      </section>

      <div className="store-layout">
        <aside className="store-sidebar">
          <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')} aria-label="Analytics" title="Analytics">
            <LineChart size={20} />
            <span className="nav-item-text">Analytics</span>
          </div>
          <div className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')} aria-label="Products" title="Products">
            <LayoutGrid size={20} />
            <span className="nav-item-text">Products</span>
          </div>
          <div className={`nav-item ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')} aria-label="Services" title="Services">
            <ClipboardList size={20} />
            <span className="nav-item-text">Services</span>
          </div>
        </aside>

        <main className="store-content">
          {activeTab === 'analytics' && (
            <StoreAnalyticsDashboard store={store} products={products} />
          )}

          {activeTab === 'products' && (
            productItems.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 12, padding: 16 }}>
                <p style={{ margin: 0, color: 'var(--color-muted-text)' }}>No products yet. Add a product to get started.</p>
              </div>
            ) : (
              <div className="store-products-grid">
                {productItems.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isOwner={isSeller}
                    onEdit={(item) => setEditItem(item)}
                    onDeleteRequest={(item, e) => setDeleteCtx({ id: item.id, x: e.clientX, y: e.clientY })}
                  />
                ))}
              </div>
            )
          )}

          {activeTab === 'services' && (
            serviceItems.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 12, padding: 16 }}>
                <p style={{ margin: 0, color: 'var(--color-muted-text)' }}>No services yet. Add a service to get started.</p>
              </div>
            ) : (
              <div className="store-products-grid">
                {serviceItems.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isOwner={isSeller}
                    onEdit={(item) => setEditItem(item)}
                    onDeleteRequest={(item, e) => setDeleteCtx({ id: item.id, x: e.clientX, y: e.clientY })}
                  />
                ))}
              </div>
            )
          )}
        </main>
      </div>

      <AddItemWizard
        open={openProduct}
        onClose={() => setOpenProduct(false)}
        mode="product"
        onComplete={(item) => onCreateItem?.(item)}
      />
      <AddItemWizard
        open={openService}
        onClose={() => setOpenService(false)}
        mode="service"
        onComplete={(item) => onCreateItem?.(item)}
      />
      <AddItemWizard
        open={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        mode={editItem?.type || 'product'}
        initialItem={editItem || undefined}
        onComplete={(updated) => {
          onUpdateItem?.(updated)
        }}
      />

      <ConfirmPopover
        open={Boolean(deleteCtx)}
        anchor={deleteCtx ? { x: deleteCtx.x, y: deleteCtx.y } : null}
        message="Delete this item? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setDeleteCtx(null)}
        onConfirm={() => {
          if (deleteCtx?.id) onDeleteItem?.(deleteCtx.id)
          setDeleteCtx(null)
        }}
      />

      <CreateStoreModal
        isOpen={editStore}
        onClose={() => setEditStore(false)}
        store={store}
        onSubmit={async (formData) => {
          try {
            const updatedStore = await updateStoreSettings({
              name: formData.name,
              description: formData.description,
              location: formData.location || '',
            })
            
            // Update Redux state with updated store
            dispatch(setEntrepreneur({
              ...store,
              store: updatedStore.store || updatedStore
            }))
            
            // Call parent callback if provided
            onUpdateStore?.(updatedStore.store || updatedStore)
            
            setEditStore(false)
          } catch (error) {
            console.error('Failed to update store:', error)
          }
        }}
      />
    </div>
  )
}

export default StoreDashboard


