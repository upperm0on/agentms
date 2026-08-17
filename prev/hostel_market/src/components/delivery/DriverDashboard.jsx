import React, { useState } from 'react'
import { Truck, Package, MapPin, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import DeliveryTracking from './DeliveryTracking'
import OrderCard from '../orders/OrderCard'
import './DriverDashboard.css'
import { driverStats, activeDeliveries as getActiveDeliveries, recentDeliveries as defaultRecent } from '../../data/driver'

function DriverDashboard({ driver }) {
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  
  // Centralized mock data
  const stats = driverStats
  const activeDeliveries = getActiveDeliveries(driver)
  const recentDeliveries = defaultRecent
  
  return (
    <div className="driver-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="driver-welcome">
            <Truck size={32} />
            <div>
              <h1 className="dashboard-title">Driver Dashboard</h1>
              <p className="driver-name">Welcome back, {driver?.name || 'Driver'}!</p>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="stats-grid">
          <Card className="stat-card">
            <CardContent>
              <div className="stat-header">
                <Package size={24} className="stat-icon deliveries" />
                <span className="stat-value">{stats.totalDeliveries}</span>
              </div>
              <p className="stat-label">Total Deliveries</p>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardContent>
              <div className="stat-header">
                <CheckCircle size={24} className="stat-icon completed" />
                <span className="stat-value">{stats.completedDeliveries}</span>
              </div>
              <p className="stat-label">Completed</p>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardContent>
              <div className="stat-header">
                <Clock size={24} className="stat-icon pending" />
                <span className="stat-value">{stats.pendingDeliveries}</span>
              </div>
              <p className="stat-label">Pending</p>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardContent>
              <div className="stat-header">
                <DollarSign size={24} className="stat-icon earnings" />
                <span className="stat-value">GHS {stats.totalEarnings}</span>
              </div>
              <p className="stat-label">Total Earnings</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Active Deliveries */}
        {activeDeliveries.length > 0 && (
          <section className="dashboard-section">
            <h2 className="section-title">Active Deliveries</h2>
            <div className="deliveries-list">
              {activeDeliveries.map(delivery => (
                <div key={delivery.id} className="delivery-card-wrapper">
                  <DeliveryTracking delivery={delivery} />
                  <div className="delivery-actions">
                    {delivery.status === 'picked_up' && (
                      <button className="action-button primary">
                        Mark as In Transit
                      </button>
                    )}
                    {delivery.status === 'in_transit' && (
                      <button className="action-button success">
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Recent Deliveries */}
        <section className="dashboard-section">
          <h2 className="section-title">Recent Deliveries</h2>
          <div className="orders-list">
            {recentDeliveries.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onView={(order) => setSelectedDelivery(order)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DriverDashboard

