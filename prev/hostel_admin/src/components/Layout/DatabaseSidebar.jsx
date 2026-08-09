import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Database,
  ChevronDown,
  ChevronRight,
  Table,
  X,
  Users,
  Building2,
  Calendar,
  CreditCard,
  Star,
  MessageSquare,
  MapPin,
  UserCheck,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react'
import { dynamicDbAPI } from '../../services/adminApi'
import './DatabaseSidebar.css'

function DatabaseSidebar({ isOpen, onClose, onTableSelect }) {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedApps, setExpandedApps] = useState(new Set())
  const [selectedTable, setSelectedTable] = useState(null)
  const [metrics, setMetrics] = useState({})
  const [loadingMetrics, setLoadingMetrics] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadTables()
      loadMetrics()
    }
  }, [isOpen])

  const loadTables = async () => {
    setLoading(true)
    try {
      const response = await dynamicDbAPI.getAllTables()
      if (response.data.success) {
        setTables(response.data.tables)
        // Auto-expand first app
        if (response.data.tables.length > 0) {
          const firstApp = response.data.tables[0].app_label
          setExpandedApps(new Set([firstApp]))
        }
      }
    } catch (error) {
      console.error('Error loading tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMetrics = async () => {
    setLoadingMetrics(true)
    try {
      const metricsData = {}
      
      // Load key metrics for important tables
      const keyTables = [
        { app: 'hq', model: 'hostel' },
        { app: 'consumers', model: 'consumer' },
        { app: 'reservations', model: 'reservation' },
        { app: 'managers', model: 'manager' },
        { app: 'reviews', model: 'reviews' },
        { app: 'payments', model: 'payment' }
      ]

      for (const table of keyTables) {
        try {
          const response = await dynamicDbAPI.getTableData(table.app, table.model, { page_size: 1 })
          if (response.data.success) {
            metricsData[`${table.app}_${table.model}`] = response.data.pagination.total_count
          }
        } catch (error) {
          console.error(`Error loading metrics for ${table.app}.${table.model}:`, error)
        }
      }
      
      setMetrics(metricsData)
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setLoadingMetrics(false)
    }
  }

  const getTableIcon = (table) => {
    const modelName = table.model_name.toLowerCase()
    const appLabel = table.app_label.toLowerCase()
    
    // Specific table icons
    if (modelName.includes('hostel')) return Building2
    if (modelName.includes('user') || modelName.includes('consumer')) return Users
    if (modelName.includes('manager')) return UserCheck
    if (modelName.includes('reservation')) return Calendar
    if (modelName.includes('payment')) return CreditCard
    if (modelName.includes('review')) return Star
    if (modelName.includes('location')) return MapPin
    if (modelName.includes('rating')) return Star
    if (modelName.includes('category')) return BarChart3
    
    // App-based icons
    if (appLabel === 'hq') return Building2
    if (appLabel === 'consumers') return Users
    if (appLabel === 'managers') return UserCheck
    if (appLabel === 'reservations') return Calendar
    if (appLabel === 'payments') return CreditCard
    if (appLabel === 'reviews') return MessageSquare
    if (appLabel === 'location') return MapPin
    if (appLabel === 'ratings') return Star
    
    return Table
  }

  const getAppIcon = (appLabel) => {
    switch (appLabel.toLowerCase()) {
      case 'hq': return Building2
      case 'consumers': return Users
      case 'managers': return UserCheck
      case 'reservations': return Calendar
      case 'payments': return CreditCard
      case 'reviews': return MessageSquare
      case 'location': return MapPin
      case 'ratings': return Star
      case 'category': return BarChart3
      case 'user_auth': return Users
      default: return Database
    }
  }

  const toggleApp = (appLabel) => {
    const newExpanded = new Set(expandedApps)
    if (newExpanded.has(appLabel)) {
      newExpanded.delete(appLabel)
    } else {
      newExpanded.add(appLabel)
    }
    setExpandedApps(newExpanded)
  }

  const handleTableClick = (table) => {
    setSelectedTable(table)
    onTableSelect(table)
  }

  const groupTablesByApp = () => {
    const grouped = {}
    tables.forEach(table => {
      if (!grouped[table.app_label]) {
        grouped[table.app_label] = []
      }
      grouped[table.app_label].push(table)
    })
    return grouped
  }

  const groupedTables = groupTablesByApp()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="database-sidebar-overlay" onClick={onClose} />}
      
      <aside className={`database-sidebar ${isOpen ? 'database-sidebar-open' : ''}`}>
        <div className="database-sidebar-header">
          <div className="database-sidebar-title">
            <Database size={20} />
            <span>Database Tables</span>
          </div>
          <button className="database-sidebar-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="database-sidebar-content">
          {loading ? (
            <div className="database-sidebar-loading">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading tables...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Metrics Section */}
              <div className="database-metrics">
                <div className="metrics-header">
                  <Activity size={16} />
                  <span>Key Metrics</span>
                </div>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <Building2 size={14} />
                    <span className="metric-label">Hostels</span>
                    <span className="metric-value">
                      {loadingMetrics ? '...' : metrics.hq_hostel || 0}
                    </span>
                  </div>
                  <div className="metric-item">
                    <Users size={14} />
                    <span className="metric-label">Users</span>
                    <span className="metric-value">
                      {loadingMetrics ? '...' : metrics.consumers_consumer || 0}
                    </span>
                  </div>
                  <div className="metric-item">
                    <Calendar size={14} />
                    <span className="metric-label">Reservations</span>
                    <span className="metric-value">
                      {loadingMetrics ? '...' : metrics.reservations_reservation || 0}
                    </span>
                  </div>
                  <div className="metric-item">
                    <UserCheck size={14} />
                    <span className="metric-label">Managers</span>
                    <span className="metric-value">
                      {loadingMetrics ? '...' : metrics.managers_manager || 0}
                    </span>
                  </div>
                  <div className="metric-item">
                    <Star size={14} />
                    <span className="metric-label">Reviews</span>
                    <span className="metric-value">
                      {loadingMetrics ? '...' : metrics.reviews_reviews || 0}
                    </span>
                  </div>
                  <div className="metric-item">
                    <CreditCard size={14} />
                    <span className="metric-label">Payments</span>
                    <span className="metric-value">
                      {loadingMetrics ? '...' : metrics.payments_payment || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tables Section */}
              <div className="database-tables">
                <div className="tables-header">
                  <Table size={16} />
                  <span>Database Tables</span>
                </div>
                {Object.entries(groupedTables).map(([appLabel, appTables]) => {
                  const AppIcon = getAppIcon(appLabel)
                  return (
                    <div key={appLabel} className="database-app">
                      <button
                        className="database-app-header"
                        onClick={() => toggleApp(appLabel)}
                      >
                        {expandedApps.has(appLabel) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        <AppIcon size={16} />
                        <span className="app-label">{appLabel}</span>
                        <span className="table-count">({appTables.length})</span>
                      </button>
                      
                      {expandedApps.has(appLabel) && (
                        <div className="database-tables-list">
                          {appTables.map((table) => {
                            const TableIcon = getTableIcon(table)
                            const recordCount = metrics[`${table.app_label}_${table.model_name}`]
                            return (
                              <button
                                key={`${table.app_label}.${table.model_name}`}
                                className={`database-table-item ${
                                  selectedTable?.app_label === table.app_label && 
                                  selectedTable?.model_name === table.model_name 
                                    ? 'selected' : ''
                                }`}
                                onClick={() => handleTableClick(table)}
                              >
                                <TableIcon size={14} />
                                <div className="table-info">
                                  <span className="table-name">{table.verbose_name}</span>
                                  <span className="table-model">({table.model_name})</span>
                                </div>
                                {recordCount !== undefined && (
                                  <span className="record-count">{recordCount}</span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="database-sidebar-footer">
          <div className="database-info">
            <p>Total Tables: {tables.length}</p>
            <p>Apps: {Object.keys(groupedTables).length}</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default DatabaseSidebar
