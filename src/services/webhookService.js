import axios from 'axios';

// Webhook URL
const WEBHOOK_URL = 'https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d';

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

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

  // Send chat message to webhook
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
          userMessage: messageData.userMessage,
          aiResponse: messageData.aiResponse,
          attachments: messageData.attachments || [],
          sessionId: messageData.sessionId || `session-${Date.now()}`,
          conversationContext: messageData.context || {}
        }
      };

      const response = await apiClient.post(WEBHOOK_URL, payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to send chat message to webhook:', error);
      return {
        success: false,
        error: error.message
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
      console.error('Failed to send file upload to webhook:', error);
      return {
        success: false,
        error: error.message
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