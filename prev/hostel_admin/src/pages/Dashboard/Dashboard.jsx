import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react'
import { fetchAnalytics, fetchRevenueData, fetchOccupancyData, fetchUserGrowthData } from '../../store/slices/analyticsSlice'
import StatCard from '../../components/Dashboard/StatCard'
import ChartCard from '../../components/Dashboard/ChartCard'
import RecentActivity from '../../components/Dashboard/RecentActivity'
import './Dashboard.css'

function Dashboard() {
  const dispatch = useDispatch()
  const { overview, revenueData, occupancyData, userGrowthData, isLoading } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchAnalytics())
    dispatch(fetchRevenueData('30d'))
    dispatch(fetchOccupancyData('30d'))
    dispatch(fetchUserGrowthData('30d'))
  }, [dispatch])

  const statCards = [
    {
      title: 'Total Hostels',
      value: overview.totalHostels || 0,
      icon: Building2,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Users',
      value: overview.totalUsers || 0,
      icon: Users,
      color: 'green',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Reservations',
      value: overview.totalReservations || 0,
      icon: Calendar,
      color: 'purple',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: `$${overview.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'orange',
      change: '+22%',
      trend: 'up'
    }
  ]

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your hostels.</p>
      </div>

      <div className="dashboard-stats">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-charts">
          <ChartCard
            title="Revenue Overview"
            subtitle="Monthly revenue trends"
            type="revenue"
            data={revenueData}
          />
          <ChartCard
            title="Occupancy Rate"
            subtitle="Hostel occupancy statistics"
            type="occupancy"
            data={occupancyData}
          />
        </div>

        <div className="dashboard-sidebar">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
