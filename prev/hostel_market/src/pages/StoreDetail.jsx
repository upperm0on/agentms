import React, { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { MapPin, Phone, Mail, Globe, Heart, Info, Share2, LayoutGrid, MessageCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import ProductCard from '../components/marketplace/ProductCard'
import { Button } from '../components/ui/Button'
import StoreBanner from '../components/store/StoreBanner'
import StoreHeader from '../components/store/StoreHeader'
import './StoreDetail.css'
import { selectIsStoreFavorited, toggleStoreFavorite } from '../store/slices/storeFavoritesSlice'
import { fetchStoreById, fetchListings } from '../store/slices/marketplaceSlice'
import { apiClient } from '../utils/apiClient'

function StoreDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const isStoreFavorited = useSelector(selectIsStoreFavorited(id))
  const { stores, products, loading } = useSelector(state => state.marketplace)
  const [activeTab, setActiveTab] = useState('listings') // listings | about | contact
  const [filterType, setFilterType] = useState('all') // all | product | service
  const [sortKey, setSortKey] = useState('relevance') // relevance | price_asc | price_desc
  const [page, setPage] = useState(1)
  const [storeProducts, setStoreProducts] = useState([])
  const [storeProductsLoading, setStoreProductsLoading] = useState(false)
  const pageSize = 8

  // Fetch store data
  const store = stores.find(s => String(s.id) === String(id))

  // Fetch store and products on mount
  useEffect(() => {
    if (!store) {
      dispatch(fetchStoreById(id))
    }
  }, [id, store, dispatch])

  // Fetch store products
  useEffect(() => {
    const fetchStoreProducts = async () => {
      setStoreProductsLoading(true)
      try {
        const response = await apiClient.get(`/stores/${id}/products`)
        setStoreProducts(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error('Failed to fetch store products:', err)
        setStoreProducts([])
      } finally {
        setStoreProductsLoading(false)
      }
    }

    if (id) {
      fetchStoreProducts()
    }
  }, [id])

  // Use fetched store products or fallback to filtered marketplace products
  const listings = useMemo(() => {
    if (storeProducts.length > 0) {
      return storeProducts
    }
    // Fallback to filtering products from marketplace by store_id
    return products.filter(p => String(p.store_id) === String(id))
  }, [storeProducts, products, id])

  const filteredSorted = useMemo(() => {
    let result = listings
    if (filterType !== 'all') {
      result = result.filter(item => item.type === filterType)
    }
    if (sortKey === 'price_asc') {
      result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    } else if (sortKey === 'price_desc') {
      result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    }
    return result
  }, [listings, filterType, sortKey])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize))
  const pagedItems = filteredSorted.slice((page - 1) * pageSize, page * pageSize)

  // Loading state
  if (loading && !store) {
    return (
      <div className="container" style={{ padding: '32px 0', textAlign: 'center' }}>
        <div style={{ height: 8, width: 180, background: 'rgba(15,23,42,0.08)', borderRadius: 999, margin: '0 auto' }} />
        <div style={{ marginTop: 12, height: 8, width: 260, background: 'rgba(15,23,42,0.06)', borderRadius: 999, margin: '0 auto' }} />
      </div>
    )
  }

  // Store not found
  if (!store && !loading) {
    return (
      <div className="container" style={{ padding: '32px 0', textAlign: 'center' }}>
        <h2>Store not found</h2>
        <p style={{ color: '#475569' }}>This store may have been removed or the link is invalid.</p>
      </div>
    )
  }

  const headerActions = store ? (
    <>
      <Button variant="outline" size="sm" onClick={() => dispatch(toggleStoreFavorite(store))} aria-label={isStoreFavorited ? 'Remove from favorites' : 'Add to favorites'} title={isStoreFavorited ? 'Remove from favorites' : 'Add to favorites'}>
        <Heart size={18} fill={isStoreFavorited ? 'currentColor' : 'none'} />
        <span className="button-text">{isStoreFavorited ? 'Favorited' : 'Favorite'}</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href)
          alert('Store link copied')
        } catch {
          alert('Copy failed')
        }
      }} aria-label="Share" title="Share">
        <Share2 size={18} />
        <span className="button-text">Share</span>
      </Button>
    </>
  ) : null

  return (
    <div className="store-detail-page">
      <StoreBanner 
        bannerUrl={store?.banner_url || store?.banner || store?.cover_photo}
        banner={store?.banner || store?.cover_photo}
        alt={store?.name || 'Store banner'}
      />

      <div className="container">
        <StoreHeader 
          store={store} 
          actions={headerActions}
        />

        {/* Tabs */}
        <div className="store-tabs">
          <button className={`store-tab ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')} aria-label="Listings" title="Listings">
            <LayoutGrid size={20} />
            <span className="tab-text">Listings</span>
          </button>
          <button className={`store-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')} aria-label="About" title="About">
            <Info size={20} />
            <span className="tab-text">About</span>
          </button>
          <button className={`store-tab ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')} aria-label="Contact" title="Contact">
            <MessageCircle size={20} />
            <span className="tab-text">Contact</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'listings' && (
          <section className="store-section">
            <div className="section-header">
              <h2 className="section-title">All Listings</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    aria-label="Filter type"
                    style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(15,23,42,0.12)' }}
                  >
                    <option value="all">All</option>
                    <option value="product">Products</option>
                    <option value="service">Services</option>
                  </select>
                </div>
                <div>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    aria-label="Sort by"
                    style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(15,23,42,0.12)' }}
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
                <span className="item-count">{filteredSorted.length} {filteredSorted.length === 1 ? 'item' : 'items'}</span>
              </div>
            </div>
            {storeProductsLoading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ height: 8, width: 180, background: 'rgba(15,23,42,0.08)', borderRadius: 999, margin: '0 auto' }} />
              </div>
            ) : pagedItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
                <p>No listings found for this store.</p>
              </div>
            ) : (
              <div className="store-products-grid">
                {pagedItems.map(item => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} aria-label="Previous page" title="Previous page">
                <ArrowLeft size={16} />
                <span className="button-text">Prev</span>
              </Button>
              <span style={{ fontSize: 12, opacity: 0.7 }}>Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} aria-label="Next page" title="Next page">
                <span className="button-text">Next</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </section>
        )}

        {activeTab === 'about' && (
          <section className="store-section">
            <div className="about-card">
              {store?.description && (
                <div className="about-row">
                  <Info size={18} className="about-icon" />
                  <div>
                    <h3 className="about-title">About {store.name}</h3>
                    <p className="about-text">{store.description}</p>
                  </div>
                </div>
              )}
              {store?.address && (
                <div className="about-row">
                  <MapPin size={18} className="about-icon" />
                  <div>
                    <h4 className="about-subtitle">Address</h4>
                    <p className="about-text">{store.address}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'contact' && (
          <section className="store-section">
            <div className="contact-grid">
              {store?.contact_phone && (
                <a className="contact-card" href={`tel:${store.contact_phone}`}>
                  <Phone size={18} />
                  <div className="contact-text">
                    <span className="label">Phone</span>
                    <span className="value">{store.contact_phone}</span>
                  </div>
                </a>
              )}
              {store?.contact_email && (
                <a className="contact-card" href={`mailto:${store.contact_email}`}>
                  <Mail size={18} />
                  <div className="contact-text">
                    <span className="label">Email</span>
                    <span className="value">{store.contact_email}</span>
                  </div>
                </a>
              )}
              {store?.contact_social?.website && (
                <a className="contact-card" href={store.contact_social.website} target="_blank" rel="noreferrer">
                  <Globe size={18} />
                  <div className="contact-text">
                    <span className="label">Website</span>
                    <span className="value">Visit site</span>
                  </div>
                </a>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default StoreDetail


