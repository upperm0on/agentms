import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { isFeatureEnabled, safeApiCall } from '../../../config/features';
import { buildApiUrl } from '../../../config/api';
import './EnhancedAnalytics.css';

const EnhancedAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'occupancy', 'bookings']);
  const [isExporting, setIsExporting] = useState(false);
  
  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];
  
  const availableMetrics = [
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'occupancy', label: 'Occupancy Rate', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'cancellations', label: 'Cancellations', icon: TrendingUp },
    { id: 'reviews', label: 'Reviews', icon: BarChart3 }
  ];
  
  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (isFeatureEnabled('ENHANCED_ANALYTICS')) {
        // Try enhanced analytics API
        const response = await fetch(buildApiUrl('/hq/api/v2/analytics/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            date_range: dateRange,
            metrics: selectedMetrics
          })
        });
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Enhanced analytics failed');
        }
      } else {
        // Fallback to basic analytics
        const response = await fetch(buildApiUrl('/hq/api/analytics/'), {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Analytics fetch failed');
        }
      }
      
      setAnalytics(data);
      
    } catch (err) {
      setError('Failed to load analytics data');
      
      // Use cached data if available
      const cached = localStorage.getItem('analytics_cache');
      if (cached) {
        setAnalytics(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };
  
  const exportAnalytics = async (format = 'pdf') => {
    setIsExporting(true);
    
    try {
      const response = await fetch(buildApiUrl('/hq/api/analytics/export/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          format,
          date_range: dateRange,
          metrics: selectedMetrics
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const toggleMetric = (metricId) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };
  
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-GH').format(value);
  };
  
  if (loading) {
    return (
      <div className="analytics-loading">
        <RefreshCw className="spinning" size={24} />
        <p>Loading analytics...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={fetchAnalytics} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="analytics-empty">
        <BarChart3 size={48} />
        <h3>No Analytics Data</h3>
        <p>Analytics data will appear here once you have some activity.</p>
      </div>
    );
  }
  
  return (
    <div className="enhanced-analytics">
      <div className="analytics-header">
        <div className="analytics-title">
          <BarChart3 size={24} />
          <h2>Analytics Dashboard</h2>
        </div>
        
        <div className="analytics-controls">
          <div className="date-range-selector">
            <label>Date Range:</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="metrics-selector">
            <label>Metrics:</label>
            <div className="metrics-checkboxes">
              {availableMetrics.map(metric => (
                <label key={metric.id} className="metric-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric.id)}
                    onChange={() => toggleMetric(metric.id)}
                  />
                  <metric.icon size={16} />
                  {metric.label}
                </label>
              ))}
            </div>
          </div>
          
          <div className="export-controls">
            <button 
              onClick={() => exportAnalytics('pdf')}
              disabled={isExporting}
              className="export-btn"
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button 
              onClick={() => exportAnalytics('excel')}
              disabled={isExporting}
              className="export-btn"
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="analytics-content">
        {/* Key Metrics Cards */}
        <div className="metrics-grid">
          {selectedMetrics.includes('revenue') && (
            <div className="metric-card revenue">
              <div className="metric-icon">
                <DollarSign size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Revenue</h3>
                <div className="metric-value">
                  {formatCurrency(analytics.revenue?.total || 0)}
                </div>
                <div className="metric-change">
                  <TrendingUp size={16} />
                  {formatPercentage(analytics.revenue?.growth || 0)} vs last period
                </div>
              </div>
            </div>
          )}
          
          {selectedMetrics.includes('occupancy') && (
            <div className="metric-card occupancy">
              <div className="metric-icon">
                <Users size={24} />
              </div>
              <div className="metric-content">
                <h3>Occupancy Rate</h3>
                <div className="metric-value">
                  {formatPercentage(analytics.occupancy?.rate || 0)}
                </div>
                <div className="metric-change">
                  <TrendingUp size={16} />
                  {formatPercentage(analytics.occupancy?.growth || 0)} vs last period
                </div>
              </div>
            </div>
          )}
          
          {selectedMetrics.includes('bookings') && (
            <div className="metric-card bookings">
              <div className="metric-icon">
                <Calendar size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Bookings</h3>
                <div className="metric-value">
                  {formatNumber(analytics.bookings?.total || 0)}
                </div>
                <div className="metric-change">
                  <TrendingUp size={16} />
                  {formatNumber(analytics.bookings?.growth || 0)} vs last period
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h3>Revenue Trend</h3>
            <div className="chart-placeholder">
              <BarChart3 size={48} />
              <p>Revenue chart will be displayed here</p>
            </div>
          </div>
          
          <div className="chart-container">
            <h3>Occupancy Trend</h3>
            <div className="chart-placeholder">
              <TrendingUp size={48} />
              <p>Occupancy chart will be displayed here</p>
            </div>
          </div>
        </div>
        
        {/* Detailed Reports */}
        <div className="reports-section">
          <h3>Detailed Reports</h3>
          <div className="reports-grid">
            <div className="report-card">
              <h4>Top Performing Rooms</h4>
              <div className="report-content">
                {analytics.top_rooms?.map((room, index) => (
                  <div key={index} className="report-item">
                    <span>{room.name}</span>
                    <span>{formatCurrency(room.revenue)}</span>
                  </div>
                )) || <p>No data available</p>}
              </div>
            </div>
            
            <div className="report-card">
              <h4>Customer Demographics</h4>
              <div className="report-content">
                {analytics.demographics?.map((demo, index) => (
                  <div key={index} className="report-item">
                    <span>{demo.category}</span>
                    <span>{formatPercentage(demo.percentage)}</span>
                  </div>
                )) || <p>No data available</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalytics;

