import React, { useState } from 'react';
import { webhookService } from '../services/webhookService';
import './WebhookDebugger.css';

const WebhookDebugger = ({ isVisible, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [logs, setLogs] = useState([]);

  const testWebhookConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    const startTime = Date.now();
    addLog('🔄 Testing webhook connection...');
    
    try {
      const result = await webhookService.testConnection();
      const duration = Date.now() - startTime;
      
      setTestResult(result);
      
      if (result.success) {
        addLog(`✅ Connection successful (${duration}ms)`);
        addLog(`📥 Response: ${JSON.stringify(result.data, null, 2)}`);
      } else {
        addLog(`❌ Connection failed: ${result.error}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      addLog(`❌ Connection error (${duration}ms): ${error.message}`);
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const testChatMessage = async () => {
    setTesting(true);
    const startTime = Date.now();
    addLog('🔄 Testing chat message with Axios...');
    
    try {
      const testMessage = {
        id: `test-${Date.now()}`,
        userMessage: 'This is a test message from WebhookDebugger',
        attachments: [],
        sessionId: `test-session-${Date.now()}`,
        context: {
          messageLength: 42,
          hasAttachments: false,
          attachmentCount: 0,
          isTest: true
        }
      };
      
      const result = await webhookService.sendChatMessage(testMessage);
      const duration = Date.now() - startTime;
      
      if (result.success) {
        addLog(`✅ Axios: Chat message sent successfully (${duration}ms)`);
        addLog(`📥 AI Response: ${result.data?.response || 'No response received'}`);
        addLog(`📋 Full Response: ${JSON.stringify(result.data, null, 2)}`);
      } else {
        addLog(`❌ Axios failed: ${result.error}`);
        
        // Try fetch method
        addLog('🔄 Trying Fetch method...');
        const fetchStartTime = Date.now();
        const fetchResult = await webhookService.testWithFetch(testMessage);
        const fetchDuration = Date.now() - fetchStartTime;
        
        if (fetchResult.success) {
          addLog(`✅ Fetch: Chat message sent successfully (${fetchDuration}ms)`);
          addLog(`📥 AI Response: ${fetchResult.data?.response || 'No response received'}`);
          addLog(`📋 Full Response: ${JSON.stringify(fetchResult.data, null, 2)}`);
        } else {
          addLog(`❌ Fetch also failed: ${fetchResult.error}`);
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      addLog(`❌ Chat message error (${duration}ms): ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testFetchMethod = async () => {
    setTesting(true);
    const startTime = Date.now();
    addLog('🧪 Testing with Fetch API only...');
    
    try {
      const testMessage = {
        id: `fetch-test-${Date.now()}`,
        userMessage: 'Testing Fetch API method',
        attachments: [],
        sessionId: `fetch-session-${Date.now()}`,
        context: {
          messageLength: 25,
          hasAttachments: false,
          attachmentCount: 0,
          isTest: true,
          method: 'fetch'
        }
      };
      
      const result = await webhookService.testWithFetch(testMessage);
      const duration = Date.now() - startTime;
      
      if (result.success) {
        addLog(`✅ Fetch method successful (${duration}ms)`);
        addLog(`📥 AI Response: ${result.data?.response || 'No response received'}`);
        addLog(`📋 Full Response: ${JSON.stringify(result.data, null, 2)}`);
      } else {
        addLog(`❌ Fetch method failed: ${result.error}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      addLog(`❌ Fetch method error (${duration}ms): ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const debugRawResponse = async () => {
    setTesting(true);
    const startTime = Date.now();
    addLog('🐛 Debugging raw webhook response...');
    
    try {
      const testMessage = {
        id: `debug-${Date.now()}`,
        userMessage: 'Debug raw response test'
      };
      
      const result = await webhookService.debugWebhookResponse(testMessage);
      const duration = Date.now() - startTime;
      
      if (result.success) {
        addLog(`✅ Debug successful (${duration}ms)`);
        addLog(`📄 Raw response text: ${result.rawText}`);
        addLog(`📋 Parsed data: ${JSON.stringify(result.data, null, 2)}`);
      } else {
        addLog(`❌ Debug failed: ${result.error}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      addLog(`❌ Debug error (${duration}ms): ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testMarkdownResponse = async () => {
    setTesting(true);
    const startTime = Date.now();
    addLog('📝 Testing Markdown response parsing...');
    
    try {
      const testMessage = {
        id: `markdown-test-${Date.now()}`,
        userMessage: 'Please respond with markdown formatting including **bold**, *italic*, `code`, and a list'
      };
      
      const result = await webhookService.sendChatMessage(testMessage);
      const duration = Date.now() - startTime;
      
      if (result.success) {
        addLog(`✅ Markdown test successful (${duration}ms)`);
        addLog(`📝 Response content: ${result.data?.response || 'No response'}`);
        
        // Check if response contains markdown elements
        const response = result.data?.response || '';
        const hasMarkdown = /(\*\*|\*|`|#|\-|\d\.)/.test(response);
        addLog(`📊 Contains markdown syntax: ${hasMarkdown ? 'Yes' : 'No'}`);
        
        if (hasMarkdown) {
          addLog('🎨 Markdown elements detected - should render properly in chat');
        }
      } else {
        addLog(`❌ Markdown test failed: ${result.error}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      addLog(`❌ Markdown test error (${duration}ms): ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testTextFormatting = () => {
    setTesting(true);
    addLog('🎨 Testing text formatting...');
    
    // Sample text from user's issue
    const sampleText = `Dưới đây là thông tin tuyến bán hàng của bạn hôm nay:\\n\\nThứ 3\\n* NT Phương Mai - Nhà Bè - HCM (Mã tuyến: HCM_22)\\n* NT Thủy Tiên 2 - Nhà Bè - HCM (Mã tuyến: HCM_22)\\n* NT Minh Châu - Nhà Bè - HCM (Mã tuyến: HCM_22)\\n* NT Minh Khang - Nhà Bè - HCM (Mã tuyến: HCM_22)\\n* NT Diễm Trinh - Nhà Bè - HCM (Mã tuyến: HCM_22)`;
    
    addLog('📝 Original sample text:');
    addLog(sampleText);
    
    const formatted = webhookService.testFormatting(sampleText);
    
    addLog('✨ Formatted result:');
    addLog(formatted);
    
    addLog('🎯 This is how it will appear in chat with markdown rendering');
    
    setTesting(false);
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResult(null);
  };

  if (!isVisible) return null;

  return (
    <div className="webhook-debugger-overlay">
      <div className="webhook-debugger">
        <div className="webhook-debugger-header">
          <h3>🔧 Webhook Debugger</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="webhook-debugger-content">
          <div className="webhook-info">
            <p><strong>Webhook URL:</strong></p>
            <code>https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d</code>
          </div>
          
          <div className="webhook-actions">
            <button 
              onClick={testWebhookConnection}
              disabled={testing}
              className="test-btn primary"
            >
              {testing ? '🔄 Testing...' : '🔗 Test Connection'}
            </button>
            
            <button 
              onClick={testChatMessage}
              disabled={testing}
              className="test-btn secondary"
            >
              {testing ? '🔄 Testing...' : '💬 Test Chat (Axios)'}
            </button>
            
            <button 
              onClick={testFetchMethod}
              disabled={testing}
              className="test-btn tertiary"
            >
              {testing ? '🔄 Testing...' : '🧪 Test Fetch API'}
            </button>
            
            <button 
              onClick={debugRawResponse}
              disabled={testing}
              className="test-btn debug"
            >
              {testing ? '🔄 Debugging...' : '🐛 Debug Raw Response'}
            </button>
            
            <button 
              onClick={testMarkdownResponse}
              disabled={testing}
              className="test-btn markdown"
            >
              {testing ? '🔄 Testing...' : '📝 Test Markdown'}
            </button>
            
            <button 
              onClick={testTextFormatting}
              disabled={testing}
              className="test-btn format"
            >
              {testing ? '🔄 Testing...' : '🎨 Test Formatting'}
            </button>
            
            <button 
              onClick={clearLogs}
              disabled={testing}
              className="test-btn clear"
            >
              🗑️ Clear Logs
            </button>
          </div>
          
          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              <h4>{testResult.success ? '✅ Success' : '❌ Failed'}</h4>
              <p>{testResult.message || testResult.error}</p>
            </div>
          )}
          
          <div className="webhook-logs">
            <h4>📋 Debug Logs</h4>
            <div className="logs-container">
              {logs.length === 0 ? (
                <p className="no-logs">No logs yet. Click a test button to see debug information.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="log-entry">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookDebugger;