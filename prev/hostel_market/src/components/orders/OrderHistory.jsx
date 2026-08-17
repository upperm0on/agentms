import React, { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Package, Filter, Search } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchOrders, releaseEscrow, setOrderStatus } from '../../store/slices/orderSlice'
import OrderCard from './OrderCard'
import OrderDetail from './OrderDetail'
import { Select } from '../ui/Input'
import { Button } from '../ui/Button'
import './OrderHistory.css'

function OrderHistory({ userRole: propUserRole = 'buyer' }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const { orders } = useSelector(state => state.orders)
  const { products } = useSelector(state => state.marketplace)
  const { entrepreneur } = useSelector(state => state.auth)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const orderRefs = useRef({})
  const highlightOrderId = location.state?.highlightOrderId
  
  // Determine userRole: if user has a store, they can be both buyer and seller
  // Check if any order has user_role === 'seller' to determine if showing seller orders
  const hasSellerOrders = orders.some(o => o.user_role === 'seller')
  const hasStore = !!(entrepreneur && ((entrepreneur.store !== null && entrepreneur.store !== undefined) || entrepreneur?.store_id))
  const defaultUserRole = hasStore ? (hasSellerOrders ? 'seller' : 'buyer') : propUserRole
  
  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])
  
  // Auto-open and highlight order if redirected from purchase
  useEffect(() => {
    if (highlightOrderId && orders.length > 0) {
      const order = orders.find(o => String(o.id) === String(highlightOrderId))
      if (order) {
        setSelectedOrder(order)
        setShowDetail(true)
        // Scroll to order card
        setTimeout(() => {
          const ref = orderRefs.current[order.id]
          if (ref) {
            ref.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      }
    }
  }, [highlightOrderId, orders])

  // derive view models
  const displayOrders = orders.map(o => {
    const p = products.find(x => String(x.id) === String(o.product_id))
    return {
      ...o,
      item_name: p?.name || `Item ${o.product_id}`,
      store_name: p?.store_name || 'Store',
      currency: o.currency || p?.currency || 'GHS',
      total_amount: o.price,
      delivery_fee: 0,
      escrow_status: o.type === 'service' && o.status === 'escrow_held' ? 'held' : undefined,
    }
  })
  
  const filteredOrders = displayOrders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter
    const matchesSearch = searchQuery === '' || 
      order.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.store_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })
  
  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowDetail(true)
  }
  
  const handleConfirmOrder = (order) => {
    if (order.type === 'service' && order.status === 'escrow_held') {
      dispatch(releaseEscrow(order.id))
    }
  }
  
  const handleCancelOrder = (order) => {
    dispatch(setOrderStatus({ id: order.id, status: 'cancelled' }))
  }
  
  return (
    <div className="order-history">
      <div className="container">
        <div className="order-history-header">
          <h1 className="page-title">
            {hasStore ? 'My Orders (Buyer & Seller)' : 'My Orders'}
          </h1>
        </div>
        
        {/* Filters and Search */}
        <div className="order-controls">
          <div className="search-container">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Orders' },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            className="filter-select"
          />
        </div>
        
        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                ref={el => {
                  if (el) orderRefs.current[order.id] = el
                }}
                style={{
                  border: String(order.id) === String(highlightOrderId) ? '2px solid #3b82f6' : 'none',
                  borderRadius: String(order.id) === String(highlightOrderId) ? '12px' : '0',
                  padding: String(order.id) === String(highlightOrderId) ? '4px' : '0',
                  transition: 'all 0.3s ease'
                }}
              >
                <OrderCard
                  order={order}
                  onView={handleViewOrder}
                  onConfirm={handleConfirmOrder}
                  onCancel={handleCancelOrder}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Package size={48} />
            <h2>No orders found</h2>
            <p>
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your filters'
                : 'You haven\'t placed any orders yet'}
            </p>
          </div>
        )}
        
        {/* Order Detail Modal */}
        {selectedOrder && (
          <OrderDetail
            order={selectedOrder}
            isOpen={showDetail}
            onClose={() => {
              setShowDetail(false)
              setSelectedOrder(null)
            }}
            onConfirm={handleConfirmOrder}
            onCancel={handleCancelOrder}
            userRole={selectedOrder.user_role || defaultUserRole}
          />
        )}
      </div>
    </div>
  )
}

export default OrderHistory

