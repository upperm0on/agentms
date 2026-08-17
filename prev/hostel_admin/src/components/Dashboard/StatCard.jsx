import { TrendingUp, TrendingDown } from 'lucide-react'
import './StatCard.css'

function StatCard({ title, value, icon: Icon, color, change, trend }) {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'stat-card-blue',
      green: 'stat-card-green',
      purple: 'stat-card-purple',
      orange: 'stat-card-orange',
    }
    return colors[color] || 'stat-card-blue'
  }

  return (
    <div className={`stat-card ${getColorClasses(color)}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon">
          <Icon size={24} />
        </div>
        <div className="stat-card-trend">
          {trend === 'up' ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span className={`trend-${trend}`}>{change}</span>
        </div>
      </div>
      <div className="stat-card-content">
        <h3 className="stat-card-title">{title}</h3>
        <p className="stat-card-value">{value}</p>
      </div>
    </div>
  )
}

export default StatCard
