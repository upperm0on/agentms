import React, { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { 
  TrendingUp, Package, ShoppingCart, Coins, DollarSign, Eye, 
  Calendar, BarChart3, Activity, Zap, ArrowUpRight
} from 'lucide-react'
import { apiClient } from '../../utils/apiClient'
import './StoreAnalyticsDashboard.css'

const SERVICE_FEE_PERCENTAGE = 1.5 // 1.5% service fee
const MONTHLY_FEE_PERCENTAGE = 5 // 5% monthly fee for sellers

function formatCurrency(amount, currency = 'GHS') {
  if (typeof amount !== 'number' && typeof amount !== 'string') return `${currency} 0.00`
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return `${currency} 0.00`
  return `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatNumber(num) {
  if (typeof num !== 'number' && typeof num !== 'string') return '0'
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(n)) return '0'
  return n.toLocaleString()
}

export default function StoreAnalyticsDashboard({ store, products = [] }) {
  const { isAuthenticated } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [transactions, setTransactions] = useState([])
  const timeRange = 'all' // Always use all-time data

  useEffect(() => {
    // Get store ID - check multiple sources
    const storeId = store?.id || store?.store?.id || null
    
    console.log('StoreAnalyticsDashboard: Fetching analytics', { 
      store, 
      storeId, 
      isAuthenticated, 
      hasStoreId: !!storeId 
    })
    
    if (!isAuthenticated || !storeId) {
      console.warn('StoreAnalyticsDashboard: Missing requirements', { isAuthenticated, storeId })
      setLoading(false)
      return
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        console.log('StoreAnalyticsDashboard: Fetching analytics for store', storeId)
        
        // Fetch analytics data
        const analyticsResponse = await apiClient.get(`/marketplace/store/${storeId}/analytics/`, {
          params: { time_range: timeRange }
        })
        console.log('StoreAnalyticsDashboard: Analytics response', analyticsResponse.data)
        setAnalytics(analyticsResponse.data)

        // Fetch transactions
        const transactionsResponse = await apiClient.get(`/marketplace/store/${storeId}/transactions/`, {
          params: { time_range: timeRange }
        })
        const transactionsData = transactionsResponse.data?.results || transactionsResponse.data || []
        console.log('StoreAnalyticsDashboard: Transactions response', transactionsData)
        setTransactions(transactionsData)
      } catch (error) {
        console.error('StoreAnalyticsDashboard: Failed to fetch analytics', error)
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          url: error.url,
          response: error.response
        })
        // Use empty data if API fails
        setAnalytics({
          total_revenue: 0,
          gross_profit: 0,
          net_profit: 0,
          final_net_profit: 0,
          total_transactions: 0,
          total_clicks: 0,
          service_fees: 0,
          monthly_fees: 0,
          monthly_fee_percentage: MONTHLY_FEE_PERCENTAGE,
          click_rates: {},
          top_products: [],
        })
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [isAuthenticated, store])

  // Calculate metrics from analytics data
  const metrics = useMemo(() => {
    if (analytics) {
      // Merge top_products from API with all products to show click rates for all
      const clickRates = analytics.click_rates || {}
      const topProductsFromAPI = analytics.top_products || []
      
      // Create a map of products with their click data
      const productsWithClicks = products.map(p => {
        const clickData = clickRates[p.id] || { clicks: 0, views: 0, rate: 0 }
        const apiProduct = topProductsFromAPI.find(tp => tp.id === p.id)
        return {
          id: p.id,
          name: p.name,
          clicks: clickData.clicks,
          views: clickData.views,
          rate: clickData.rate,
          revenue: apiProduct?.revenue || 0,
          transactionCount: apiProduct?.count || 0
        }
      })
      
      // Sort by clicks (descending) and take top 10
      const topProducts = productsWithClicks
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10)
      
      return {
        totalRevenue: parseFloat(analytics.total_revenue || 0),
        grossProfit: parseFloat(analytics.gross_profit || analytics.total_revenue || 0),
        netProfit: parseFloat(analytics.net_profit || 0),
        finalNetProfit: parseFloat(analytics.final_net_profit || analytics.net_profit || 0),
        totalTransactions: parseInt(analytics.total_transactions || 0),
        totalClicks: parseInt(analytics.total_clicks || 0),
        serviceFees: parseFloat(analytics.service_fees || 0),
        monthlyFees: parseFloat(analytics.monthly_fees || 0),
        monthlyFeePercentage: parseFloat(analytics.monthly_fee_percentage || MONTHLY_FEE_PERCENTAGE),
        clickRates: clickRates,
        topProducts: topProducts,
      }
    }

    // Fallback: calculate from transactions
    const completedTransactions = transactions.filter(t => t.status === 'completed')
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + parseFloat(t.price || 0), 0)
    const serviceFees = completedTransactions.reduce((sum, t) => sum + parseFloat(t.service_fee || 0), 0)
    const grossProfit = totalRevenue
    const netProfit = totalRevenue - serviceFees
    const monthlyFees = totalRevenue * (MONTHLY_FEE_PERCENTAGE / 100)
    const finalNetProfit = netProfit - monthlyFees

    // Calculate click rates from products
    const clickRates = {}
    products.forEach(p => {
      const clicks = parseInt(p.click_count || 0)
      const views = parseInt(p.view_count || 0)
      clickRates[p.id] = {
        clicks,
        views,
        rate: views > 0 ? (clicks / views * 100) : 0
      }
    })

    return {
      totalRevenue,
      grossProfit,
      netProfit,
      finalNetProfit,
      totalTransactions: completedTransactions.length,
      totalClicks: Object.values(clickRates).reduce((sum, r) => sum + r.clicks, 0),
      serviceFees,
      monthlyFees,
      monthlyFeePercentage: MONTHLY_FEE_PERCENTAGE,
      clickRates,
      topProducts: products.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        clicks: clickRates[p.id]?.clicks || 0,
        revenue: completedTransactions
          .filter(t => t.product_id === p.id)
          .reduce((sum, t) => sum + parseFloat(t.price || 0), 0)
      }))
    }
  }, [analytics, transactions, products])

  if (loading) {
    return (
      <div className="analytics-dashboard-loading">
        <div className="loading-skeleton" />
        <div className="loading-skeleton" />
      </div>
    )
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Store Analytics</h2>
          <p className="analytics-subtitle">Real-time insights into your store performance</p>
        </div>
      </div>

      {/* Single Unified Metrics Card */}
      <div className="analytics-metrics-card">
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-header">
              <DollarSign size={18} className="metric-icon" />
              <span className="metric-label">Total Revenue</span>
            </div>
            <div className="metric-value">
              <span className="currency-symbol">GHS</span>
              <span className="amount">{metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="metric-footer">All-time earnings</div>
          </div>

          <div className="metric-item">
            <div className="metric-header">
              <TrendingUp size={18} className="metric-icon" />
              <span className="metric-label">Gross Profit</span>
            </div>
            <div className="metric-value">
              <span className="currency-symbol">GHS</span>
              <span className="amount">{metrics.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="metric-footer">Before service fees</div>
          </div>

          <div className="metric-item">
            <div className="metric-header">
              <Coins size={18} className="metric-icon" />
              <span className="metric-label">Net Profit</span>
            </div>
            <div className="metric-value">
              <span className="currency-symbol">GHS</span>
              <span className="amount">{metrics.finalNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="metric-footer">After {SERVICE_FEE_PERCENTAGE}% service fee &amp; {MONTHLY_FEE_PERCENTAGE}% monthly fee</div>
          </div>

          <div className="metric-item">
            <div className="metric-header">
              <ShoppingCart size={18} className="metric-icon" />
              <span className="metric-label">Transactions</span>
            </div>
            <div className="metric-value number-value">{formatNumber(metrics.totalTransactions)}</div>
            <div className="metric-footer">Completed sales</div>
          </div>

          <div className="metric-item">
            <div className="metric-header">
              <Eye size={18} className="metric-icon" />
              <span className="metric-label">Total Clicks</span>
            </div>
            <div className="metric-value number-value">{formatNumber(metrics.totalClicks)}</div>
            <div className="metric-footer">Product views</div>
          </div>

          <div className="metric-item">
            <div className="metric-header">
              <Activity size={18} className="metric-icon" />
              <span className="metric-label">Conversion Rate</span>
            </div>
            <div className="metric-value number-value">
              {metrics.totalClicks > 0 
                ? ((metrics.totalTransactions / metrics.totalClicks) * 100).toFixed(2) 
                : '0.00'}%
            </div>
            <div className="metric-footer">Clicks to sales</div>
          </div>
        </div>

        {/* Fees Breakdown */}
        <div className="metrics-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">Service Fees ({SERVICE_FEE_PERCENTAGE}%)</span>
            <span className="breakdown-value">{formatCurrency(metrics.serviceFees)}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Monthly Fees ({MONTHLY_FEE_PERCENTAGE}%)</span>
            <span className="breakdown-value">{formatCurrency(metrics.monthlyFees)}</span>
          </div>
          <div className="breakdown-item total">
            <span className="breakdown-label">Total Fees</span>
            <span className="breakdown-value">{formatCurrency(metrics.serviceFees + metrics.monthlyFees)}</span>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="analytics-content">
        {/* Top Products by Click Rate */}
        <div className="analytics-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <Zap size={18} />
              Top Products by Click Rate
            </h3>
          </div>
          <div className="panel-content">
            {metrics.topProducts.length === 0 ? (
              <div className="empty-state">
                <Package size={32} />
                <p>No product clicks yet</p>
              </div>
            ) : (
              <div className="click-rates-list">
                {metrics.topProducts.length === 0 ? (
                  <div className="empty-state">
                    <Package size={32} />
                    <p>No products available</p>
                  </div>
                ) : (
                  metrics.topProducts.map(product => {
                    const clickData = {
                      clicks: product.clicks || 0,
                      views: product.views || 0,
                      rate: product.rate || 0
                    }
                    return (
                      <div key={product.id} className="click-rate-item">
                        <div className="click-rate-info">
                          <div className="product-name">{product.name}</div>
                          <div className="click-stats">
                            <span>{formatNumber(clickData.clicks)} clicks</span>
                            {clickData.views > 0 && (
                              <>
                                <span>•</span>
                                <span>{formatNumber(clickData.views)} views</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="click-rate-bar">
                          <div 
                            className="click-rate-fill" 
                            style={{ width: `${Math.min(clickData.rate, 100)}%` }}
                          />
                          <span className="click-rate-percentage">
                            {clickData.rate > 0 ? clickData.rate.toFixed(1) : '0.0'}%
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="analytics-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <Calendar size={18} />
              Recent Transactions
            </h3>
          </div>
          <div className="panel-content">
            {transactions.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={32} />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="transactions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Consumer</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Service Fee</th>
                      <th>Net Profit</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map(transaction => (
                      <tr key={transaction.id}>
                        <td>
                          {new Date(transaction.transaction_date || transaction.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          {transaction.consumer?.username || transaction.consumer?.email || 'N/A'}
                        </td>
                        <td>{transaction.product?.name || 'N/A'}</td>
                        <td className="amount">{formatCurrency(transaction.price)}</td>
                        <td className="amount fee">{formatCurrency(transaction.service_fee || 0)}</td>
                        <td className="amount profit">{formatCurrency(transaction.net_profit || transaction.price)}</td>
                        <td>
                          <span className={`status-badge ${transaction.status}`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
