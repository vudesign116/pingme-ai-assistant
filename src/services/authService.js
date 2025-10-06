import axios from 'axios';

// Webhook URL for authentication
const AUTH_WEBHOOK_URL = 'https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d';

// Create axios instance for auth requests
const authClient = axios.create({
  timeout: 15000, // 15 seconds timeout for auth
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Default user accounts (webhook authentication temporarily disabled)
const DEFAULT_USERS = [
  {
    employeeId: 'MR2593',
    password: 'abc123',
    name: 'Trần Thiện Toàn',
    role: 'Nhân viên',
    avatar: null
  },
  {
    employeeId: 'MR1674', 
    password: 'abc123',
    name: 'Phạm Nhật Vinh',
    role: 'Nhân viên',
    avatar: null
  }
];

export const authService = {
  // Login function - Using local authentication (webhook temporarily disabled)
  async login(employeeId, password) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Using local authentication (webhook disabled)...', { employeeId });
    
    // Check against default users
    const user = DEFAULT_USERS.find(
      u => u.employeeId === employeeId.trim() && u.password === password.trim()
    );
    
    if (user) {
      const token = `local-token-${Date.now()}`;
      const loginTime = Date.now().toString();
      const userInfo = {
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        token,
        isLocal: true // Flag to indicate local authentication
      };
      
      // Store in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      localStorage.setItem('loginTime', loginTime);
      
      console.log('Local login successful:', userInfo);
      
      // Optional: Send login notification to webhook (for logging purposes)
      try {
        await this.sendLoginSuccessNotification(userInfo);
      } catch (error) {
        console.error('Failed to send login notification:', error);
        // Don't fail login if webhook logging fails
      }
      
      return {
        success: true,
        data: userInfo
      };
    } else {
      console.log('Local login failed: Invalid credentials');
      
      // Optional: Send failed login notification
      try {
        await this.sendLoginFailedNotification(employeeId, 'Invalid credentials');
      } catch (error) {
        console.error('Failed to send failed login notification:', error);
      }
      
      return {
        success: false,
        message: 'Mã nhân viên hoặc mật khẩu không đúng'
      };
    }
  },

  // Legacy fallback authentication (kept for future use)
  async fallbackLogin(employeeId, password, originalError) {
    console.log('Using legacy fallback authentication...');
    
    // Check against default users (same as main login now)
    const user = DEFAULT_USERS.find(
      u => u.employeeId === employeeId && u.password === password
    );
    
    if (user) {
      const token = `fallback-token-${Date.now()}`;
      const loginTime = Date.now().toString();
      const userInfo = {
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        token,
        isFallback: true // Flag to indicate fallback mode
      };
      
      // Store in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      localStorage.setItem('loginTime', loginTime);
      
      console.log('Fallback login successful:', userInfo);
      
      return {
        success: true,
        data: userInfo,
        warning: 'Đang sử dụng chế độ offline. Một số tính năng có thể bị hạn chế.'
      };
    } else {
      return {
        success: false,
        message: 'Mã nhân viên hoặc mật khẩu không đúng. Vui lòng kiểm tra kết nối mạng và thử lại.'
      };
    }
  },

  // Send successful login notification
  async sendLoginSuccessNotification(userInfo) {
    const payload = {
      action: 'login_success',
      timestamp: new Date().toISOString(),
      data: {
        employeeId: userInfo.employeeId,
        name: userInfo.name,
        role: userInfo.role,
        department: userInfo.department,
        loginTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        sessionId: `session-${Date.now()}`
      }
    };

    await authClient.post(AUTH_WEBHOOK_URL, payload);
  },

  // Send failed login notification
  async sendLoginFailedNotification(employeeId, reason) {
    const payload = {
      action: 'login_failed',
      timestamp: new Date().toISOString(),
      data: {
        employeeId,
        reason,
        attemptTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        ipAddress: 'client-side' // Client can't get real IP
      }
    };

    await authClient.post(AUTH_WEBHOOK_URL, payload);
  },

  // Logout function
  async logout() {
    try {
      const userInfo = this.getCurrentUser();
      if (userInfo) {
        // Send logout notification to webhook
        const payload = {
          action: 'user_logout',
          timestamp: new Date().toISOString(),
          data: {
            employeeId: userInfo.employeeId,
            name: userInfo.name,
            logoutTime: new Date().toISOString(),
            sessionDuration: this.calculateSessionDuration(),
            reason: 'user_initiated'
          }
        };
        
        await authClient.post(AUTH_WEBHOOK_URL, payload);
      }
    } catch (error) {
      console.error('Failed to send logout data to webhook:', error);
    }
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('loginTime');
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get current user info
  getCurrentUser() {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // Reset password via webhook
  async resetPassword(employeeId) {
    try {
      const payload = {
        action: 'password_reset_request',
        timestamp: new Date().toISOString(),
        data: {
          employeeId: employeeId.trim(),
          requestTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      };

      const response = await authClient.post(AUTH_WEBHOOK_URL, payload);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã gửi hướng dẫn reset mật khẩu đến email của bạn'
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Không tìm thấy mã nhân viên trong hệ thống'
        };
      }
    } catch (error) {
      console.error('Password reset webhook error:', error);
      
      // Fallback response
      return {
        success: false,
        message: 'Không thể kết nối đến hệ thống. Vui lòng liên hệ IT để được hỗ trợ.'
      };
    }
  },

  // Calculate session duration in seconds
  calculateSessionDuration() {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
      const duration = Date.now() - parseInt(loginTime);
      return Math.floor(duration / 1000);
    }
    return 0;
  }
};