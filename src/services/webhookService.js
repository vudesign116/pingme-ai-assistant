import axios from 'axios';

// Webhook URL - Production version
const WEBHOOK_URL = 'https://kpspa.app.n8n.cloud/webhook/e9bbd901-ec61-424a-963f-8b63a7f9b17d';
const PROXY_WEBHOOK_URL = '/api/webhook'; // Use proxy to avoid CORS in development

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 30000, // 30 seconds timeout for AI processing
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Handle CORS and cross-origin requests
  withCredentials: false,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept 4xx errors as valid responses
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get webhook URL
const getWebhookUrl = () => {
  // Use proxy for localhost to avoid CORS issues
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocalhost) {
    console.log('🧪 Using proxy URL for localhost (TEST mode)');
    return PROXY_WEBHOOK_URL;
  } else {
    console.log('🧪 Using direct webhook URL (TEST mode)');
    return WEBHOOK_URL;  
  }
};

// Helper function to format and clean AI response text
const formatAIResponse = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Clean up escaped newlines and format properly
  let formatted = text
    // Replace \n with actual newlines
    .replace(/\\n/g, '\n')
    // Clean up multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
  
  // Convert to better markdown formatting
  if (formatted.includes('*') && formatted.includes('\n')) {
    // Split into lines for processing
    const lines = formatted.split('\n');
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // If it's a header line (ends with colon and next line starts with *)
      if (line.endsWith(':') && i + 1 < lines.length && lines[i + 1].trim().startsWith('*')) {
        processedLines.push(`## ${line}`);
        processedLines.push(''); // Add empty line after header
      }
      // If it's a list item starting with *
      else if (line.startsWith('* ')) {
        // Convert to markdown list format and clean up
        const listItem = line.substring(2).trim();
        processedLines.push(`- ${listItem}`);
      }
      // If it's a regular line
      else if (line.length > 0) {
        processedLines.push(line);
      }
      // Empty line
      else {
        // Only add empty line if previous line wasn't empty
        if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
          processedLines.push('');
        }
      }
    }
    
    formatted = processedLines.join('\n');
    
    // Clean up any remaining formatting issues
    formatted = formatted
      // Remove excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Ensure proper spacing after headers
      .replace(/##([^\n]+)\n-/g, '##$1\n\n-')
      .trim();
  }
  
  return formatted;
};

export const webhookService = {
  // Send login data to webhook
  async sendLoginData(loginData) {
    try {
      const payload = {
        action: 'user_login',
        timestamp: new Date().toISOString(),
        data: {
          employeeId: loginData.employeeId,
          name: loginData.name,
          role: loginData.role,
          loginTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      };

      const response = await apiClient.post(WEBHOOK_URL, payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to send login data to webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send chat message to webhook and get AI response
  async sendChatMessage(messageData) {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      const payload = {
        action: 'chat_message',
        timestamp: new Date().toISOString(),
        data: {
          messageId: messageData.id,
          userId: user.employeeId,
          userName: user.name,
          userMessage: messageData.message || messageData.userMessage,
          attachments: messageData.files || messageData.attachments || [],
          sessionId: messageData.sessionId || `session-${Date.now()}`,
          conversationContext: messageData.context || {}
        }
      };

      const webhookUrl = getWebhookUrl();
      
      // Log image attachments for debugging
      const imageAttachments = payload.data.attachments.filter(att => att.isImage);
      if (imageAttachments.length > 0) {
        console.log('�️ Sending images to webhook:', imageAttachments.map(img => ({
          name: img.name,
          type: img.type,
          size: img.size,
          hasBase64: !!img.base64,
          base64Length: img.base64 ? img.base64.length : 0
        })));
      }
      
      console.log('�🚀 Sending to webhook:', webhookUrl, {
        ...payload,
        data: {
          ...payload.data,
          attachments: payload.data.attachments.map(att => att.isImage ? 
            { ...att, base64: `[BASE64_DATA_${att.base64?.length || 0}_CHARS]` } : att
          )
        }
      });
      
      const response = await apiClient.post(webhookUrl, payload);
      
      console.log('✅ Webhook response status:', response.status);
      console.log('📥 Webhook response data:', response.data);
      console.log('📊 Response data type:', typeof response.data);
      console.log('📊 Response data keys:', response.data ? Object.keys(response.data) : 'null');
      console.log('📊 Full response object:', JSON.stringify(response.data, null, 2));
      
      // Check if response is successful
      if (response.status >= 400) {
        const errorText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        
        // Handle specific "ip not local" error
        if (errorText.includes('ip not local')) {
          console.warn('🚫 n8n webhook blocked IP - not local/allowed IP address');
          console.warn('💡 This might be due to n8n cloud IP restrictions');
          throw new Error('Webhook IP restriction: Access denied from current IP address');
        }
        
        throw new Error(`Webhook returned status ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
      }
      
      // Process the response from n8n webhook
      let aiResponse = null;
      
      if (response.data) {
        console.log('🔍 Checking response formats...');
        
        // Check for different possible response formats from n8n
        if (typeof response.data === 'string') {
          console.log('✅ Found string response');
          aiResponse = response.data;
        } else if (response.data.response) {
          console.log('✅ Found response.response');
          aiResponse = response.data.response;
        } else if (response.data.message) {
          console.log('✅ Found response.message');
          aiResponse = response.data.message;
        } else if (response.data.answer) {
          console.log('✅ Found response.answer');
          aiResponse = response.data.answer;
        } else if (response.data.reply) {
          console.log('✅ Found response.reply');
          aiResponse = response.data.reply;
        } else if (response.data.data && response.data.data.response) {
          console.log('✅ Found response.data.response');
          aiResponse = response.data.data.response;
        } else if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
          console.log('✅ Found OpenAI format');
          aiResponse = response.data.choices[0].message.content;
        } else if (response.data.content) {
          console.log('✅ Found response.content');
          aiResponse = response.data.content;
        } else if (response.data.text) {
          console.log('✅ Found response.text');
          aiResponse = response.data.text;
        } else if (response.data.output) {
          console.log('✅ Found response.output');
          aiResponse = response.data.output;
        } else if (response.data.result) {
          console.log('✅ Found response.result');
          aiResponse = response.data.result;
        } else if (response.data.messages && Array.isArray(response.data.messages) && response.data.messages.length > 0) {
          console.log('✅ Found response.messages array');
          // Handle messages array format (common in n8n)
          const firstMessage = response.data.messages[0];
          if (firstMessage.text) {
            aiResponse = firstMessage.text;
          } else if (firstMessage.content) {
            aiResponse = firstMessage.content;
          } else if (typeof firstMessage === 'string') {
            aiResponse = firstMessage;
          }
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          console.log('✅ Found array response, using first item');
          const firstItem = response.data[0];
          if (typeof firstItem === 'string') {
            aiResponse = firstItem;
          } else if (firstItem.response) {
            aiResponse = firstItem.response;
          } else if (firstItem.message) {
            aiResponse = firstItem.message;
          } else if (firstItem.content) {
            aiResponse = firstItem.content;
          } else if (firstItem.text) {
            aiResponse = firstItem.text;
          } else if (firstItem.output) {
            aiResponse = firstItem.output;
          } else if (firstItem.result) {
            aiResponse = firstItem.result;
          }
        }
        
        console.log('🎯 Raw aiResponse:', aiResponse);
        
        // Format the response for better display
        if (aiResponse) {
          aiResponse = formatAIResponse(aiResponse);
          console.log('✨ Formatted aiResponse:', aiResponse);
        }
      }
      
      if (!aiResponse) {
        console.warn('⚠️ No standard AI response found, trying to extract any text content...');
        
        // Try to extract any meaningful text from the response
        if (response.data && typeof response.data === 'object') {
          // Look for any field that contains text content
          const textFields = Object.values(response.data).filter(value => 
            typeof value === 'string' && value.length > 0
          );
          
          if (textFields.length > 0) {
            aiResponse = textFields[0]; // Use first non-empty string
            console.log('✅ Found text content in response:', aiResponse);
          } else {
            // If it's an object, try to stringify it nicely
            aiResponse = `Webhook Response: ${JSON.stringify(response.data, null, 2)}`;
            console.log('✅ Using formatted JSON as response');
          }
        } else if (typeof response.data === 'string') {
          aiResponse = response.data;
          console.log('✅ Using string response directly');
        } else {
          aiResponse = 'Debug: Webhook responded but no readable content found. Check n8n workflow output format.';
        }
      }
      
      return {
        success: true,
        data: {
          ...response.data,
          response: aiResponse
        }
      };
    } catch (error) {
      console.error('❌ Failed to send chat message to webhook:', error);
      
      // More detailed error information
      let errorMessage = error.message;
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error: Unable to connect to webhook. Check internet connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout: Webhook took too long to respond.';
      } else if (error.response) {
        errorMessage = `Webhook error ${error.response.status}: ${error.response.statusText}`;
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        errorMessage = 'No response received from webhook. Check webhook URL and CORS settings.';
      }
      
      return {
        success: false,
        error: errorMessage,
        details: {
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText
        }
      };
    }
  },

  // Send file upload info to webhook
  async sendFileUpload(fileData) {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      const payload = {
        action: 'file_upload',
        timestamp: new Date().toISOString(),
        data: {
          fileId: fileData.id,
          fileName: fileData.name,
          fileSize: fileData.size,
          fileType: fileData.type,
          userId: user.employeeId,
          userName: user.name,
          uploadTime: new Date().toISOString()
        }
      };

      const response = await apiClient.post(WEBHOOK_URL, payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to send file upload to webhook:', {
        message: error.message || 'Unknown error',
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code
      });
      
      // Handle specific error cases
      if (error.response?.status === 500) {
        console.warn('🚫 Webhook server error (500) - webhook may not support file uploads');
        return {
          success: false,
          error: 'Webhook không hỗ trợ upload file (server error 500)',
          skipWebhook: true // Flag to indicate webhook should be skipped
        };
      }
      
      if (error.response?.status === 400 && error.response?.data?.status === 'ip not local') {
        console.warn('🌐 IP restriction detected for file upload');
        return {
          success: false,
          error: 'IP restriction - file upload not available',
          skipWebhook: true
        };
      }
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  },

  // Send user logout to webhook
  async sendLogoutData() {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      const payload = {
        action: 'user_logout',
        timestamp: new Date().toISOString(),
        data: {
          employeeId: user.employeeId,
          name: user.name,
          logoutTime: new Date().toISOString(),
          sessionDuration: this.calculateSessionDuration()
        }
      };

      const response = await apiClient.post(WEBHOOK_URL, payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to send logout data to webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send error/exception to webhook
  async sendErrorLog(errorData) {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      const payload = {
        action: 'error_log',
        timestamp: new Date().toISOString(),
        data: {
          userId: user.employeeId,
          userName: user.name,
          error: errorData.message,
          stack: errorData.stack,
          component: errorData.component,
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      };

      const response = await apiClient.post(WEBHOOK_URL, payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to send error log to webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Calculate session duration
  calculateSessionDuration() {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
      const duration = Date.now() - parseInt(loginTime);
      return Math.floor(duration / 1000); // duration in seconds
    }
    return 0;
  },

  // Alternative fetch method for testing
  async testWithFetch(messageData) {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      const payload = {
        action: 'chat_message',
        timestamp: new Date().toISOString(),
        data: {
          messageId: messageData.id,
          userId: user.employeeId,
          userName: user.name,
          userMessage: messageData.userMessage,
          attachments: messageData.attachments || [],
          sessionId: messageData.sessionId || `session-${Date.now()}`,
          conversationContext: messageData.context || {}
        }
      };

      const webhookUrl = getWebhookUrl();
      console.log('🧪 Testing with native fetch:', webhookUrl);
      console.log('📤 Payload:', payload);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      });
      
      console.log('📊 Fetch response status:', response.status);
      console.log('📊 Fetch response ok:', response.ok);
      
      if (!response.ok) {
        // Try to read error response body
        let errorText = '';
        try {
          errorText = await response.text();
          console.log('❌ Error response body:', errorText);
          
          // Handle specific "ip not local" error
          if (errorText.includes('ip not local')) {
            console.warn('🚫 n8n webhook blocked IP via fetch - not local/allowed IP address');
            console.warn('💡 Consider using a proxy server or VPN with allowed IP');
            throw new Error('Webhook IP restriction: Access denied from current IP address (fetch)');
          }
        } catch (readError) {
          console.warn('Could not read error response body:', readError);
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
      }
      
      const data = await response.json();
      console.log('📥 Fetch response data:', data);
      
      // Process the response
      let aiResponse = null;
      if (typeof data === 'string') {
        aiResponse = data;
      } else if (data.response) {
        aiResponse = data.response;
      } else if (data.message) {
        aiResponse = data.message;
      } else if (data.answer) {
        aiResponse = data.answer;
      } else if (data.reply) {
        aiResponse = data.reply;
      } else if (data.data && data.data.response) {
        aiResponse = data.data.response;
      }
      
      return {
        success: true,
        data: {
          ...data,
          response: aiResponse
        },
        method: 'fetch'
      };
      
    } catch (error) {
      console.error('❌ Fetch method failed:', error);
      return {
        success: false,
        error: error.message,
        method: 'fetch'
      };
    }
  },

  // Test webhook connection
  async testConnection() {
    try {
      const payload = {
        action: 'test_connection',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Testing webhook connection',
          clientInfo: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
          }
        }
      };

      const webhookUrl = getWebhookUrl();
      console.log('🔍 Testing webhook connection:', webhookUrl);
      console.log('📤 Test payload:', payload);
      
      const startTime = Date.now();
      const response = await apiClient.post(webhookUrl, payload);
      const duration = Date.now() - startTime;
      
      console.log('✅ Webhook test completed in', duration, 'ms');
      console.log('📊 Response status:', response.status);
      console.log('📥 Response data:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: `Webhook connection successful (${duration}ms)`,
        status: response.status,
        duration
      };
    } catch (error) {
      console.error('❌ Webhook connection test failed:', error);
      
      let errorMessage = error.message;
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error: Cannot reach webhook URL. Check if n8n is running.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout: Webhook took too long to respond.';
      } else if (error.response) {
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
      }
      
      return {
        success: false,
        error: errorMessage,
        message: 'Webhook connection failed',
        details: {
          code: error.code,
          status: error.response?.status,
          url: getWebhookUrl()
        }
      };
    }
  },

  // Test formatting function
  testFormatting(sampleText) {
    console.log('🧪 Testing formatting function...');
    console.log('📝 Original text:', sampleText);
    const formatted = formatAIResponse(sampleText);
    console.log('✨ Formatted text:', formatted);
    return formatted;
  },

  // Debug method to inspect raw response
  async debugWebhookResponse(messageData) {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      const payload = {
        action: 'debug_test',
        timestamp: new Date().toISOString(),
        data: {
          messageId: messageData.id,
          userId: user.employeeId,
          userName: user.name,
          userMessage: messageData.userMessage,
          debug: true
        }
      };

      console.log('🐛 Debug webhook call with payload:', payload);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      });
      
      console.log('🐛 Debug response status:', response.status, response.statusText);
      console.log('🐛 Debug response headers:', [...response.headers.entries()]);
      
      const text = await response.text();
      console.log('🐛 Debug response text:', text);
      
      try {
        const json = JSON.parse(text);
        console.log('🐛 Debug response JSON:', json);
        return { success: true, data: json, rawText: text };
      } catch (e) {
        console.log('🐛 Response is not JSON, returning text');
        return { success: true, data: text, rawText: text };
      }
      
    } catch (error) {
      console.error('🐛 Debug webhook error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get chat history from webhook
  async getChatHistory(userId) {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      const payload = {
        action: 'getChatHistory',
        method: 'GET',
        timestamp: new Date().toISOString(),
        userId: userId || user.employeeId,
        userName: user.name,
        data: {
          userId: userId || user.employeeId,
          limit: 100, // Limit số lượng tin nhắn
          offset: 0
        }
      };

      console.log('📚 Getting chat history for userId:', userId || user.employeeId);

      // Try with axios first
      try {
        const response = await apiClient.post(WEBHOOK_URL, payload);
        
        if (response.data) {
          console.log('✅ Chat history received from webhook');
          return {
            success: true,
            data: response.data
          };
        }
      } catch (axiosError) {
        console.warn('⚠️ Axios failed for getChatHistory, trying fetch...');
      }

      // Fallback to fetch
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Chat history received via fetch');
        return {
          success: true,
          data: data
        };
      }

      // Handle error responses, especially IP restrictions
      let errorText = '';
      try {
        errorText = await response.text();
        console.log('❌ getChatHistory error response:', errorText);
        
        // Handle specific "ip not local" error
        if (errorText.includes('ip not local')) {
          console.warn('🚫 n8n webhook blocked IP for getChatHistory - not local/allowed IP address');
          throw new Error('Webhook IP restriction: Cannot access chat history from current IP address');
        }
      } catch (readError) {
        console.warn('Could not read getChatHistory error response:', readError);
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`);

    } catch (error) {
      console.error('❌ Failed to get chat history from webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Generic webhook call
  async sendCustomData(action, data) {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      const payload = {
        action,
        timestamp: new Date().toISOString(),
        data: {
          userId: user.employeeId,
          userName: user.name,
          ...data
        }
      };

      const response = await apiClient.post(WEBHOOK_URL, payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Failed to send ${action} to webhook:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};