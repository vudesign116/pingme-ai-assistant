import React from 'react';
import { webhookService } from '../services/webhookService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send error to webhook
    webhookService.sendErrorLog({
      message: error.message,
      stack: error.stack,
      component: errorInfo.componentStack,
      errorInfo
    }).catch(webhookError => {
      console.error('Failed to send error to webhook:', webhookError);
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Oops! Có lỗi xảy ra</h2>
            <p>Ứng dụng đã gặp lỗi không mong muốn. Vui lòng refresh trang hoặc liên hệ hỗ trợ.</p>
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Refresh trang
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Thử lại
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Chi tiết lỗi (Dev only)</summary>
                <pre>{this.state.error?.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;