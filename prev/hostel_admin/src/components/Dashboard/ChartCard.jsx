import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import './ChartCard.css'

function ChartCard({ title, subtitle, type }) {
  // Mock data - in real app, this would come from Redux store
  const revenueData = [
    { month: 'Jan', revenue: 4000, bookings: 24 },
    { month: 'Feb', revenue: 3000, bookings: 13 },
    { month: 'Mar', revenue: 5000, bookings: 20 },
    { month: 'Apr', revenue: 4500, bookings: 18 },
    { month: 'May', revenue: 6000, bookings: 28 },
    { month: 'Jun', revenue: 5500, bookings: 25 },
  ]

  const occupancyData = [
    { month: 'Jan', occupancy: 65, capacity: 100 },
    { month: 'Feb', occupancy: 70, capacity: 100 },
    { month: 'Mar', occupancy: 80, capacity: 100 },
    { month: 'Apr', occupancy: 75, capacity: 100 },
    { month: 'May', occupancy: 85, capacity: 100 },
    { month: 'Jun', occupancy: 90, capacity: 100 },
  ]

  const data = type === 'revenue' ? revenueData : occupancyData

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">{title}</h3>
          <p className="chart-card-subtitle">{subtitle}</p>
        </div>
      </div>
      
      <div className="chart-card-content">
        <ResponsiveContainer width="100%" height={300}>
          {type === 'revenue' ? (
            <LineChart data={data}>
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
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
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
                dataKey="occupancy" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ChartCard
