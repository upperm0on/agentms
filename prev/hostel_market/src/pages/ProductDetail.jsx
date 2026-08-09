import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '../components/ui/Button'
import { Heart, Star, Package, Wrench, Tag, ShieldCheck, Info, ClipboardCheck, Truck, CreditCard, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import TrustBadges from '../components/marketplace/TrustBadges'
import SellerInfo from '../components/marketplace/SellerInfo'
import TermsBlocks from '../components/marketplace/TermsBlocks'
import StoreBanner from '../components/store/StoreBanner'
import StoreHeader from '../components/store/StoreHeader'
import { toggleFavorite, selectIsFavorited } from '../store/slices/favoritesSlice'
import { fetchListings, fetchProductById, fetchStoreById } from '../store/slices/marketplaceSlice'
import { placeOrder, fetchOrders } from '../store/slices/orderSlice'
import { fetchWallet } from '../store/slices/walletSlice'
import { useToast } from '../contexts/ToastContext'
import { useVerificationError } from '../hooks/useVerificationError'
import { Skeleton, SkeletonText } from '../components/ui/Skeleton'
import './ProductDetail.css'
import Gallery from '../components/marketplace/Gallery'
import StickyCTA from '../components/marketplace/StickyCTA'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()
  const { handleVerificationError } = useVerificationError()
  const { products, stores, loading } = useSelector(state => state.marketplace)
  const product = products.find(p => String(p.id) === String(id))
  const store = product?.store_id ? stores.find(s => String(s.id) === String(product.store_id)) : null
  const isFavorited = useSelector(product ? selectIsFavorited(product.id) : () => false)
  const [mainImage, setMainImage] = React.useState(product?.primary_image || '/placeholder-product.jpg')
  
  // Debug: Log product state
  React.useEffect(() => {
    console.log('ProductDetail Debug:', {
      id,
      productFound: !!product,
      productId: product?.id,
      productName: product?.name,
      productsCount: products.length,
      loading
    })
  }, [id, product, products.length, loading])

  React.useEffect(() => {
    // Always try to fetch if product not found
    if (!product) {
      dispatch(fetchProductById(id))
    }
  }, [id, product, dispatch])
  
  // Also fetch from listings if product not found
  React.useEffect(() => {
    if (!product && !loading) {
      dispatch(fetchListings({ pageSize: 1000 }))
    }
  }, [product, loading, dispatch])

  // Fetch store data if we have store_id but no store object
  React.useEffect(() => {
    if (product?.store_id && !store) {
      dispatch(fetchStoreById(product.store_id))
    }
  }, [product?.store_id, store, dispatch])

  // Track commodity click for analytics
  React.useEffect(() => {
    if (product?.id) {
      const trackClick = async () => {
        try {
          // Placeholder endpoint for development - remove in production to use relative paths
          const placeholder_endpoint = import.meta.env.DEV ? 'http://localhost:8000' : ''
          await fetch(`${placeholder_endpoint}/hq/api/marketplace/commodities/${product.id}/click/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        } catch (error) {
          // Silently fail - analytics tracking shouldn't break the page
          console.debug('Failed to track click:', error)
        }
      }
      trackClick()
    }
  }, [product?.id])
  async function handlePrimaryAction() {
    if (!product) return
    try {
      const order = await dispatch(placeOrder({ productId: product.id })).unwrap()
      await Promise.all([
        dispatch(fetchOrders()),
        dispatch(fetchWallet()),
        dispatch(fetchProductById(product.id)),
      ])
      // Show success toast with action
      toast.success(
        `Order #${order.id} placed successfully! You purchased ${product.name} for ${product.currency || 'GHS'} ${Number(product.price).toLocaleString()}. Redirecting to your orders...`,
        'Order Placed'
      )
      // Redirect to orders page after a short delay
      setTimeout(() => {
        navigate('/orders', { state: { highlightOrderId: order.id } })
      }, 2000)
    } catch (err) {
      // Check if it's a verification error first
      const isVerificationError = handleVerificationError(err)
      if (!isVerificationError) {
        // Show error toast for other errors
        toast.error(
          err?.message || 'Failed to place order. Please try again.',
          'Order Failed'
        )
      }
    }
  }

  // Ensure main image syncs when product loads after initial render
  React.useEffect(() => {
    if (product?.primary_image) {
      setMainImage(product.primary_image)
    }
  }, [product?.primary_image])

  // Show loading state
  if (loading && !product) {
    return (
      <div className="container pd-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
          <Skeleton variant="block" className="skeleton-product-image" style={{ height: '400px', borderRadius: '12px' }} />
          <div>
            <Skeleton variant="block" size="lg" width="60%" height="32px" style={{ marginBottom: '16px' }} />
            <SkeletonText lines={3} style={{ marginBottom: '16px' }} />
            <Skeleton variant="block" size="xl" width="40%" height="40px" style={{ marginBottom: '24px' }} />
            <Skeleton variant="block" size="md" width="200px" height="48px" />
          </div>
        </div>
      </div>
    )
  }
  
  // Show not found only after loading is done
  if (!product && !loading) {
    return (
      <div className="container pd-container">
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center'
        }}>
          <h2 style={{ marginTop: 0 }}>Item not found</h2>
          <p style={{ color: '#475569' }}>This product may have been removed or the link is invalid.</p>
          <div style={{ marginTop: 12 }}>
            <Link to="/browse">
              <Button variant="outline" aria-label="Back to Browse" title="Back to Browse">
                <ArrowLeft size={18} />
                <span className="button-text">Back to Browse</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  // Don't render if no product
  if (!product) {
    return null
  }

  const isService = product.type === 'service'
  // Calculate delivery fee (8.5% of price) and total
  const productPrice = Number(product.price) || 0
  const deliveryFee = productPrice * 0.085
  const totalPrice = productPrice + deliveryFee
  const priceText = `${product.currency || 'GHS'} ${productPrice.toLocaleString()}`
  const deliveryFeeText = `${product.currency || 'GHS'} ${deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const totalPriceText = `${product.currency || 'GHS'} ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="pd-page">
      {/* Store Banner and Header - Show when viewing product from a store */}
      {store && product.store_id && (
        <>
          <StoreBanner 
            bannerUrl={store.banner_url || store.banner || store.cover_photo}
            banner={store.banner || store.cover_photo}
            alt={store.name || 'Store banner'}
            height={160}
          />
          <div className="container">
            <StoreHeader 
              store={store}
              logoSize={60}
            />
          </div>
        </>
      )}

      <div className="container pd-container">
      <div className="pd-grid">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-main-image">
            <Gallery
              images={[product.primary_image, product.primary_image, product.primary_image].filter(Boolean)}
              alt={product.name}
              value={mainImage}
              onChange={setMainImage}
            />
            <div className={`pd-type-badge ${isService ? 'service' : 'product'}`}>
              {isService ? <Wrench size={14} /> : <Package size={14} />}
              <span>{isService ? 'Service' : 'Product'}</span>
            </div>
          </div>
        </div>

        {/* Main details */}
        <div className="pd-details">
          <h1 className="pd-title">{product.name}</h1>
          <div className="pd-meta">
            {product.store_id && (
              <Link to={`/stores/${product.store_id}`} className="pd-store">
                <SellerInfo 
                  name={product.store_name || store?.name || 'Store'} 
                  rating={product.store_rating || store?.rating}
                  logoUrl={store?.logo_url || store?.logo || product.store?.logo_url || product.store?.logo}
                  logo={store?.logo || product.store?.logo}
                  storeId={product.store_id}
                  showLink={false}
                />
              </Link>
            )}
          </div>
          <TrustBadges />

          {product.description && (
            <p className="pd-description">{product.description}</p>
          )}

          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="pd-tags">
              {product.tags.slice(0, 6).map((t, i) => (
                <span key={i} className="pd-tag"><Tag size={12} />{t}</span>
              ))}
            </div>
          )}

          <div className="pd-price-card">
            <StickyCTA
              priceText={priceText}
              isService={isService}
              stockQuantity={!isService ? product.stock_quantity : undefined}
              isFavorited={isFavorited}
              onToggleFavorite={() => dispatch(toggleFavorite(product))}
              onPrimary={handlePrimaryAction}
            />
          </div>
        </div>
      </div>

      {/* Additional info grid */}
      <div className="pd-info-grid">
        <div className="pd-info-card">
          <div className="card-head">
            <div className="icon-circle"><Info size={18} /></div>
            <h3>About this {isService ? 'service' : 'product'}</h3>
          </div>
          <div className="kv-list">
            <div className="kv">
              <span className="k">Type</span>
              <span className="v">
                <span className={`badge ${isService ? 'primary' : 'neutral'}`}>
                  {isService ? 'Service' : 'Product'}
                </span>
              </span>
            </div>
            {product.category_slug && (
              <div className="kv">
                <span className="k">Category</span>
                <span className="v">
                  {product.category?.name || product.category_slug}
                </span>
              </div>
            )}
            {product.store_name && (
              <div className="kv">
                <span className="k">Seller</span>
                <span className="v">
                  <SellerInfo 
                    name={product.store_name} 
                    rating={product.store_rating}
                    logoUrl={product.store?.logo_url || product.store?.logo}
                    logo={product.store?.logo}
                    storeId={product.store_id || product.store?.id}
                  />
                </span>
              </div>
            )}
          </div>
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="chip-row">
              {product.tags.slice(0, 6).map((t, i) => (
                <span key={i} className="chip">
                  <Tag size={12} />
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="pd-info-card">
          <div className="card-head">
            <div className="icon-circle"><ClipboardCheck size={18} /></div>
            <h3>Policies & Details</h3>
          </div>
          <TermsBlocks isService={isService} />
        </div>
      </div>
      </div>
    </div>
  )
}

export default ProductDetail


