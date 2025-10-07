# 🔐 Webhook Authentication Integration

## 📋 Overview

Ứng dụng PingMe đã được tích hợp với webhook authentication để xác thực người dùng thông qua hệ thống backend.

## 🌐 Webhook Endpoint

```
URL: https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d
Method: POST
Content-Type: application/json
```

## 📤 Login Verification Request

### Request Format:
```json
{
  "action": "login_verify",
  "timestamp": "2024-10-06T14:30:00.000Z",
  "data": {
    "employeeId": "EMP001",
    "password": "password123",
    "userAgent": "Mozilla/5.0...",
    "platform": "MacIntel",
    "loginAttemptTime": "2024-10-06T14:30:00.000Z"
  }
}
```

### Expected Response (Success):
```json
{
  "success": true,
  "data": {
    "employeeId": "EMP001",
    "name": "Nguyễn Văn A",
    "fullName": "Nguyễn Văn A",
    "role": "Nhân viên",
    "position": "Developer",
    "department": "IT",
    "avatar": "https://example.com/avatar.jpg"
  },
  "message": "Login successful"
}
```

### Expected Response (Failure):
```json
{
  "success": false,
  "message": "Mã nhân viên hoặc mật khẩu không đúng"
}
```

## 📨 Other Webhook Events

### 1. **Login Success Notification**
```json
{
  "action": "login_success",
  "timestamp": "2024-10-06T14:30:00.000Z",
  "data": {
    "employeeId": "EMP001",
    "name": "Nguyễn Văn A",
    "role": "Nhân viên",
    "department": "IT",
    "loginTime": "2024-10-06T14:30:00.000Z",
    "userAgent": "Mozilla/5.0...",
    "platform": "MacIntel",
    "sessionId": "session-1696606500000"
  }
}
```

### 2. **Login Failed Notification**
```json
{
  "action": "login_failed",
  "timestamp": "2024-10-06T14:25:00.000Z",
  "data": {
    "employeeId": "EMP999",
    "reason": "Invalid credentials",
    "attemptTime": "2024-10-06T14:25:00.000Z",
    "userAgent": "Mozilla/5.0...",
    "platform": "MacIntel",
    "ipAddress": "client-side"
  }
}
```

### 3. **User Logout**
```json
{
  "action": "user_logout",
  "timestamp": "2024-10-06T15:00:00.000Z",
  "data": {
    "employeeId": "EMP001",
    "name": "Nguyễn Văn A",
    "logoutTime": "2024-10-06T15:00:00.000Z",
    "sessionDuration": 1800,
    "reason": "user_initiated"
  }
}
```

### 4. **Password Reset Request**
```json
{
  "action": "password_reset_request",
  "timestamp": "2024-10-06T14:35:00.000Z",
  "data": {
    "employeeId": "EMP001",
    "requestTime": "2024-10-06T14:35:00.000Z",
    "userAgent": "Mozilla/5.0...",
    "platform": "MacIntel"
  }
}
```

### 5. **Connection Health Check**
```json
{
  "action": "connection_check",
  "timestamp": "2024-10-06T14:40:00.000Z",
  "data": {
    "type": "ping",
    "source": "pingme_auth"
  }
}
```

## 🔄 Authentication Flow

### 1. **Primary Flow (Webhook)**
1. User enters credentials
2. App sends `login_verify` request to webhook
3. Webhook validates credentials against database
4. Returns user data if valid, error if invalid
5. App stores user info and proceeds to chat

### 2. **Fallback Flow (Offline)**
1. If webhook is unavailable (network/server error)
2. App falls back to local mock authentication
3. Shows warning message about offline mode
4. User gets limited functionality

## 🛡️ Security Features

- ✅ **Timeout Protection**: 15-second timeout for auth requests
- ✅ **Fallback Authentication**: Local fallback when webhook fails
- ✅ **Session Tracking**: Login/logout tracking with session duration
- ✅ **Error Logging**: Failed attempts are logged
- ✅ **Connection Status**: Real-time webhook availability indicator

## 🔧 Configuration

### File: `src/services/authService.js`
```javascript
const AUTH_WEBHOOK_URL = 'https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d';
```

### Timeout Settings:
```javascript
const authClient = axios.create({
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
```

## 🎯 Testing

### Test Scenarios:

1. **Valid Credentials**: Webhook should return success with user data
2. **Invalid Credentials**: Webhook should return failure with error message
3. **Webhook Offline**: App should fallback to local authentication
4. **Network Timeout**: App should handle gracefully with fallback
5. **Password Reset**: Should send reset request and handle response

### Fallback Accounts (when webhook offline):
```
EMP001 / password123
EMP002 / admin123
```

## 🎨 UI Features

- **Connection Status**: Green/Orange indicator showing webhook availability
- **Loading States**: Spinner during authentication
- **Error Messages**: Clear feedback for failed attempts
- **Warning Messages**: Notification when using fallback mode
- **Toast Notifications**: Success/error feedback

## 📊 Monitoring

The app sends various events to webhook for monitoring:
- Login attempts (successful/failed)
- Session duration tracking
- Connection health checks
- Password reset requests
- User logout events

## 🔍 Debugging

Console logs are available for debugging:
- `Sending login request to webhook...`
- `Login successful via webhook:`
- `Login failed via webhook:`
- `Using fallback authentication...`
- `Fallback login successful:`

---

**Webhook endpoint sẽ nhận tất cả các events trên để xử lý authentication và logging!** 🚀