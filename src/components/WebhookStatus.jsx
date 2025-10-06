import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';

const WebhookStatus = () => {
  const [status, setStatus] = useState('checking'); // checking, online, offline
  const [lastSent, setLastSent] = useState(null);

  useEffect(() => {
    // Check webhook connectivity on mount
    checkWebhookStatus();
    
    // Set up periodic health check
    const interval = setInterval(checkWebhookStatus, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const checkWebhookStatus = async () => {
    try {
      const response = await fetch('https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'health_check',
          timestamp: new Date().toISOString(),
          data: {
            type: 'ping',
            source: 'pingme_app'
          }
        })
      });
      
      if (response.ok) {
        setStatus('online');
        setLastSent(new Date());
      } else {
        setStatus('offline');
      }
    } catch (error) {
      console.error('Webhook health check failed:', error);
      setStatus('offline');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#34C759';
      case 'offline': return '#FF3B30';
      default: return '#FF9500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'Webhook Online';
      case 'offline': return 'Webhook Offline';
      default: return 'Checking...';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'online': return <Wifi size={12} />;
      case 'offline': return <WifiOff size={12} />;
      default: return <Activity size={12} />;
    }
  };

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="webhook-status">
      <div 
        className="status-indicator"
        style={{ backgroundColor: getStatusColor() }}
        title={`${getStatusText()}${lastSent ? ` - Last: ${lastSent.toLocaleTimeString()}` : ''}`}
      >
        {getStatusIcon()}
        <span className="status-text">{getStatusText()}</span>
      </div>
    </div>
  );
};

export default WebhookStatus;