import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import './AnalyticsChart.css'

function AnalyticsChart({ type, data }) {
  // Mock data - in real app, this would come from props
  const mockData = [
    { month: 'Jan', revenue: 4000, occupancy: 65, users: 120 },
    { month: 'Feb', revenue: 3000, occupancy: 70, users: 135 },
    { month: 'Mar', revenue: 5000, occupancy: 80, users: 150 },
    { month: 'Apr', revenue: 4500, occupancy: 75, users: 165 },
    { month: 'May', revenue: 6000, occupancy: 85, users: 180 },
    { month: 'Jun', revenue: 5500, occupancy: 90, users: 195 },
  ]

  const chartData = data || mockData

  const getChartConfig = () => {
    switch (type) {
      case 'revenue':
        return {
          dataKey: 'revenue',
          color: '#3b82f6',
          name: 'Revenue'
        }
      case 'occupancy':
        return {
          dataKey: 'occupancy',
          color: '#10b981',
          name: 'Occupancy %'
        }
      case 'users':
        return {
          dataKey: 'users',
          color: '#8b5cf6',
          name: 'Users'
        }
      default:
        return {
          dataKey: 'revenue',
          color: '#3b82f6',
          name: 'Revenue'
        }
    }
  }

  const config = getChartConfig()

  return (
    <div className="analytics-chart">
      <ResponsiveContainer width="100%" height={300}>
        {type === 'revenue' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={3}
              dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey={config.dataKey}
              fill={config.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export default AnalyticsChart
