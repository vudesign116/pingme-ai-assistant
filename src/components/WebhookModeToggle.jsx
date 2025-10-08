import React, { useState, useEffect } from 'react';
import { webhookService } from '../services/webhookService';
import './WebhookModeToggle.css';

const WebhookModeToggle = () => {
  const [currentMode, setCurrentMode] = useState('production');
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    console.log('🔧 WebhookModeToggle component mounted');
    // Get current mode from localStorage
    const mode = webhookService.getWebhookMode();
    console.log('🔧 Current webhook mode:', mode);
    setCurrentMode(mode);
  }, []);

  const handleModeChange = async (newMode) => {
    if (newMode === currentMode || isChanging) return;
    
    setIsChanging(true);
    
    try {
      // Change webhook mode
      webhookService.setWebhookMode(newMode);
      setCurrentMode(newMode);
      
      // Show feedback
      const currentUrl = webhookService.getCurrentWebhookUrl();
      console.log(`🔄 Switched to ${newMode} mode`);
      console.log(`📡 Current webhook URL: ${currentUrl}`);
      
      // Optional: Show toast notification
      // Note: Toast will be handled by parent component if available
      
    } catch (error) {
      console.error('Failed to change webhook mode:', error);
      // Error handling without toast dependency
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="webhook-mode-toggle">
      <div className="toggle-label">
        <span className="toggle-icon">🔗</span>
        <span>Webhook Mode</span>
      </div>
      
      <div className="toggle-switch">
        <button 
          className={`toggle-option ${currentMode === 'test' ? 'active' : ''}`}
          onClick={() => handleModeChange('test')}
          disabled={isChanging}
          title="Switch to test webhook"
        >
          <span className="option-icon">🧪</span>
          <span>Test</span>
        </button>
        
        <button 
          className={`toggle-option ${currentMode === 'production' ? 'active' : ''}`}
          onClick={() => handleModeChange('production')}
          disabled={isChanging}
          title="Switch to production webhook"
        >
          <span className="option-icon">🚀</span>
          <span>Production</span>
        </button>
      </div>
      
      {isChanging && (
        <div className="changing-indicator">
          <span className="spinner">⚡</span>
          <span>Switching...</span>
        </div>
      )}
      
      <div className="current-mode-info">
        <span className="mode-indicator">
          {currentMode === 'test' ? '🧪' : '🚀'} {currentMode.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default WebhookModeToggle;