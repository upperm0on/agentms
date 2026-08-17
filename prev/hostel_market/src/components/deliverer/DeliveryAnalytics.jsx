import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { DollarSign, Package, TrendingUp, Calendar } from 'lucide-react'
import './DeliveryAnalytics.css'

function DeliveryAnalytics({ deliveries, totalEarnings }) {
  const totalDeliveries = deliveries.length
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  
  const thisMonthDeliveries = deliveries.filter(d => {
    const date = new Date(d.created_at || d.transaction_date)
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear
  }).length

  const thisMonthEarnings = deliveries
    .filter(d => {
      const date = new Date(d.created_at || d.transaction_date)
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear
    })
    .reduce((sum, d) => sum + Number(d.delivery_fee || 0), 0)

  const averageEarnings = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0

  return (
    <div className="delivery-analytics">
      <div className="analytics-grid">
        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">GHS {Number(totalEarnings).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}</h3>
              <p className="stat-label">Total Earnings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Package size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{totalDeliveries}</h3>
              <p className="stat-label">Total Deliveries</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{thisMonthDeliveries}</h3>
              <p className="stat-label">This Month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">GHS {Number(averageEarnings).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}</h3>
              <p className="stat-label">Average per Delivery</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="earnings-breakdown">
        <CardContent>
          <h2 className="section-title">Earnings Breakdown</h2>
          <div className="breakdown-item">
            <span className="breakdown-label">This Month Earnings:</span>
            <span className="breakdown-value">
              GHS {Number(thisMonthEarnings).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Total Earnings:</span>
            <span className="breakdown-value">
              GHS {Number(totalEarnings).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DeliveryAnalytics

