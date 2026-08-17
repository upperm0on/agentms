import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './ui/Button'
import './ErrorBoundary.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Log to error reporting service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset)
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <AlertCircle size={48} />
            </div>
            <h2 className="error-boundary-title">
              {this.props.title || 'Something went wrong'}
            </h2>
            <p className="error-boundary-message">
              {this.props.message || 'An unexpected error occurred. Please try again.'}
            </p>
            
            {this.props.showDetails && this.state.error && (
              <details className="error-boundary-details">
                <summary>Error Details</summary>
                <pre className="error-boundary-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-boundary-actions">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw size={16} style={{ marginRight: '8px' }} />
                Try Again
              </Button>
              {this.props.onRetry && (
                <Button onClick={this.props.onRetry} variant="outline">
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary


