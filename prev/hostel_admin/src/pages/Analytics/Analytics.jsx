import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { TrendingUp, Users as UsersIcon, Building2, DollarSign, Calendar, Activity, BarChart3, PieChart as PieChartIcon, RefreshCw } from 'lucide-react'
import { fetchAnalytics, fetchRevenueData, fetchOccupancyData, fetchUserGrowthData } from '../../store/slices/analyticsSlice'
import './Analytics.css'

function Analytics() {
  const dispatch = useDispatch()
  const { overview, revenueData, occupancyData, userGrowthData, isLoading } = useSelector((state) => state.analytics)
  const [dateRange, setDateRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    dispatch(fetchAnalytics())
    dispatch(fetchRevenueData(dateRange))
    dispatch(fetchOccupancyData(dateRange))
    dispatch(fetchUserGrowthData(dateRange))
  }, [dispatch, dateRange])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      dispatch(fetchAnalytics()),
      dispatch(fetchRevenueData(dateRange)),
      dispatch(fetchOccupancyData(dateRange)),
      dispatch(fetchUserGrowthData(dateRange))
    ])
    setRefreshing(false)
  }

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange)
  }

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Analytics</h1>
          <p className="analytics-subtitle">Comprehensive insights and performance metrics</p>
        </div>
        <div className="analytics-filters">
          <select 
            className="filter-select" 
            value={dateRange} 
            onChange={(e) => handleDateRangeChange(e.target.value)}
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button 
            className="refresh-btn" 
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh Data"
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="analytics-overview">
        <div className="overview-card">
          <div className="card-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="card-value">${overview.totalRevenue?.toLocaleString() || 0}</p>
            <span className="card-change positive">
              <TrendingUp size={16} />
              +12.5%
            </span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon bookings">
            <Calendar size={24} />
          </div>
          <div className="card-content">
            <h3>Total Bookings</h3>
            <p className="card-value">{overview.totalReservations || 0}</p>
            <span className="card-change positive">
              <TrendingUp size={16} />
              +8.2%
            </span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon occupancy">
            <Building2 size={24} />
          </div>
          <div className="card-content">
            <h3>Occupancy Rate</h3>
            <p className="card-value">{overview.occupancyRate || 0}%</p>
            <span className="card-change positive">
              <TrendingUp size={16} />
              +5.1%
            </span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon users">
            <UsersIcon size={24} />
          </div>
          <div className="card-content">
            <h3>Total Users</h3>
            <p className="card-value">{overview.totalUsers || 0}</p>
            <span className="card-change positive">
              <TrendingUp size={16} />
              +15.3%
            </span>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-container">
          <div className="chart-header">
            <h3><DollarSign size={20} /> Revenue Trend</h3>
            <span className="chart-subtitle">Monthly revenue performance</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3><Building2 size={20} /> Occupancy Rate</h3>
            <span className="chart-subtitle">Monthly occupancy trends</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupancyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Bar dataKey="occupancy" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-container">
          <div className="chart-header">
            <h3><UsersIcon size={20} /> User Growth</h3>
            <span className="chart-subtitle">New user registrations</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3><Activity size={20} /> System Activity</h3>
            <span className="chart-subtitle">Overall platform metrics</span>
          </div>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-icon">
                <Building2 size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Active Hostels</span>
                <span className="metric-value">{overview.totalHostels || 0}</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon">
                <Calendar size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Bookings</span>
                <span className="metric-value">{overview.totalReservations || 0}</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon">
                <UsersIcon size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Users</span>
                <span className="metric-value">{overview.totalUsers || 0}</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon">
                <DollarSign size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Revenue</span>
                <span className="metric-value">${overview.totalRevenue?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics