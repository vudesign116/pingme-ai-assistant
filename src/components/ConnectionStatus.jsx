import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, CheckCircle } from 'lucide-react';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking'); // checking, online, offline
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'connection_check',
          timestamp: new Date().toISOString(),
          data: {
            type: 'ping',
            source: 'pingme_auth'
          }
        })
      });
      
      if (response.ok) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      setStatus('offline');
    }
    
    setLastCheck(new Date());
  };

  const getStatusConfig = () => {
    // Always show as disabled when webhook is temporarily disabled
    return {
      color: '#8E8E93',
      icon: <WifiOff size={14} />,
      text: 'Webhook Disabled',
      description: 'Sử dụng authentication cục bộ'
    };
    
    // Original logic commented out for when webhook is re-enabled
    /*
    switch (status) {
      case 'online':
        return {
          color: '#34C759',
          icon: <CheckCircle size={14} />,
          text: 'Webhook Online',
          description: 'Sẵn sàng xác thực'
        };
      case 'offline':
        return {
          color: '#FF9500',
          icon: <WifiOff size={14} />,
          text: 'Webhook Offline',
          description: 'Sử dụng chế độ fallback'
        };
      default:
        return {
          color: '#8E8E93',
          icon: <Activity size={14} />,
          text: 'Đang kiểm tra...',
          description: 'Connecting...'
        };
    }
    */
  };

  const config = getStatusConfig();

  return (
    <div className="connection-status">
      <div 
        className="status-badge"
        style={{ backgroundColor: config.color }}
        title={`${config.text} - ${config.description}${lastCheck ? ` (${lastCheck.toLocaleTimeString()})` : ''}`}
      >
        {config.icon}
        <span className="status-label">{config.text}</span>
      </div>
    </div>
  );
};

export default ConnectionStatus;