import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { TrendingUp, Package, ShoppingCart, Coins, AlertTriangle, CheckCircle2, Clock4 } from 'lucide-react'
import './StoreAnalytics.css'

function formatCurrency(amount, currency = 'GHS') {
  if (typeof amount !== 'number') return `${currency} 0`
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function getLastNDates(n) {
  const days = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push(key)
  }
  return days
}

export default function StoreAnalytics({ store, products = [] }) {
  const { orders } = useSelector(state => state.orders)

  const ownedProductIds = useMemo(() => {
    const storeId = store?.id
    return new Set(products.filter(p => String(p.store_id) === String(storeId)).map(p => String(p.id)))
  }, [store, products])

  const storeOrders = useMemo(() => {
    return Array.isArray(orders)
      ? orders.filter(o => ownedProductIds.has(String(o.product_id)))
      : []
  }, [orders, ownedProductIds])

  const metrics = useMemo(() => {
    const currency = products[0]?.currency || 'GHS'
    let totalOrders = 0
    let unitsSold = 0
    let revenue = 0
    const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
    const productUnits = new Map()
    const productRevenue = new Map()

    for (const o of storeOrders) {
      totalOrders += 1
      unitsSold += 1
      const price = Number(o.price) || 0
      revenue += price
      const status = o.status || 'pending'
      if (statusCounts[status] !== undefined) statusCounts[status] += 1

      const pid = String(o.product_id)
      productUnits.set(pid, (productUnits.get(pid) || 0) + 1)
      productRevenue.set(pid, (productRevenue.get(pid) || 0) + price)
    }

    const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0

    const topByUnits = [...productUnits.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pid, units]) => ({
        id: pid,
        name: products.find(p => String(p.id) === pid)?.name || `Item ${pid}`,
        units,
      }))

    const topByRevenue = [...productRevenue.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pid, amt]) => ({
        id: pid,
        name: products.find(p => String(p.id) === pid)?.name || `Item ${pid}`,
        revenue: amt,
      }))

    const lowStock = products
      .filter(p => p.type === 'product' && typeof p.stock_quantity === 'number' && p.stock_quantity <= 3)
      .slice(0, 5)

    // sales last 7 days (simple count + sum)
    const last7 = getLastNDates(7)
    const byDay = last7.map(day => {
      const dayOrders = storeOrders.filter(o => {
        const created = o.created_at || o.date || o.timestamp
        if (!created) return false
        const key = new Date(created).toISOString().slice(0, 10)
        return key === day
      })
      const dayUnits = dayOrders.length
      const dayRevenue = dayOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0)
      return { day, units: dayUnits, revenue: dayRevenue }
    })

    return {
      currency,
      totalOrders,
      unitsSold,
      revenue,
      avgOrderValue,
      statusCounts,
      topByUnits,
      topByRevenue,
      lowStock,
      byDay,
    }
  }, [storeOrders, products])

  return (
    <section className="store-analytics">
      <div className="analytics-header">
        <h2>Store analytics</h2>
        <div className="analytics-sub">Insights based on your orders and inventory</div>
      </div>

      <div className="analytics-kpis">
        <div className="kpi-card">
          <div className="kpi-icon kpi-primary"><TrendingUp size={18} /></div>
          <div className="kpi-meta">
            <div className="kpi-label">Gross revenue</div>
            <div className="kpi-value">{formatCurrency(metrics.revenue, metrics.currency)}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><ShoppingCart size={18} /></div>
          <div className="kpi-meta">
            <div className="kpi-label">Total orders</div>
            <div className="kpi-value">{metrics.totalOrders}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><Package size={18} /></div>
          <div className="kpi-meta">
            <div className="kpi-label">Units sold</div>
            <div className="kpi-value">{metrics.unitsSold}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><Coins size={18} /></div>
          <div className="kpi-meta">
            <div className="kpi-label">Avg. order value</div>
            <div className="kpi-value">{formatCurrency(metrics.avgOrderValue, metrics.currency)}</div>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="panel">
          <div className="panel-title">Sales last 7 days</div>
          <div className="mini-bars">
            {metrics.byDay.map(d => {
              const max = Math.max(1, ...metrics.byDay.map(x => x.revenue))
              const pct = Math.round((d.revenue / max) * 100)
              return (
                <div key={d.day} className="bar">
                  <div className="bar-fill" style={{ height: `${pct}%` }} />
                  <div className="bar-label">{d.day.slice(5)}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Order status</div>
          <div className="status-list">
            <div className="status-row">
              <Clock4 size={16} />
              <span>Pending</span>
              <b>{metrics.statusCounts.pending}</b>
            </div>
            <div className="status-row">
              <CheckCircle2 size={16} />
              <span>Confirmed</span>
              <b>{metrics.statusCounts.confirmed}</b>
            </div>
            <div className="status-row">
              <CheckCircle2 size={16} />
              <span>Completed</span>
              <b>{metrics.statusCounts.completed}</b>
            </div>
            <div className="status-row">
              <AlertTriangle size={16} />
              <span>Cancelled</span>
              <b>{metrics.statusCounts.cancelled}</b>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Top products by units</div>
          <div className="list">
            {metrics.topByUnits.length === 0 ? (
              <div className="empty">No sales yet</div>
            ) : metrics.topByUnits.map(item => (
              <div key={item.id} className="list-row">
                <span className="name">{item.name}</span>
                <span className="meta">{item.units} sold</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Top products by revenue</div>
          <div className="list">
            {metrics.topByRevenue.length === 0 ? (
              <div className="empty">No revenue yet</div>
            ) : metrics.topByRevenue.map(item => (
              <div key={item.id} className="list-row">
                <span className="name">{item.name}</span>
                <span className="meta">{formatCurrency(item.revenue, metrics.currency)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Low stock alerts</div>
          <div className="list">
            {metrics.lowStock.length === 0 ? (
              <div className="empty">All good. No low inventory.</div>
            ) : metrics.lowStock.map(p => (
              <div key={p.id} className="list-row">
                <span className="name">{p.name}</span>
                <span className="badge danger">{p.stock_quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


