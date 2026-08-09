import { TrendingUp, TrendingDown } from 'lucide-react'
import './AnalyticsCard.css'

function AnalyticsCard({ title, value, icon: Icon, color, change, trend }) {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'analytics-card-blue',
      green: 'analytics-card-green',
      purple: 'analytics-card-purple',
      orange: 'analytics-card-orange',
    }
    return colors[color] || 'analytics-card-blue'
  }

  return (
    <div className={`analytics-card ${getColorClasses(color)}`}>
      <div className="analytics-card-header">
        <div className="analytics-card-icon">
          <Icon size={24} />
        </div>
        <div className="analytics-card-trend">
          {trend === 'up' ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span className={`trend-${trend}`}>{change}</span>
        </div>
      </div>
      <div className="analytics-card-content">
        <h3 className="analytics-card-title">{title}</h3>
        <p className="analytics-card-value">{value}</p>
      </div>
    </div>
  )
}

export default AnalyticsCard
