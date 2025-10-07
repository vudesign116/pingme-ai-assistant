# PingMe - AI Assistant Platform

## 🚀 Tính năng Webhook Integration

Ứng dụng PingMe đã được tích hợp với webhook để gửi dữ liệu real-time đến hệ thống n8n của bạn.

### 📡 Webhook URL
```
https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d
```

### 📤 Các sự kiện được gửi lên webhook:

#### 1. **User Login** (`user_login`)
```json
{
  "action": "user_login",
  "timestamp": "2024-10-06T14:30:00.000Z",
  "data": {
    "employeeId": "EMP001",
    "name": "Nguyễn Văn A",
    "role": "Nhân viên",
    "loginTime": "2024-10-06T14:30:00.000Z",
    "userAgent": "Mozilla/5.0...",
    "platform": "MacIntel"
  }
}
```

#### 2. **Chat Message** (`chat_message`)
```json
{
  "action": "chat_message",
  "timestamp": "2024-10-06T14:35:00.000Z",
  "data": {
    "messageId": "chat-1696606500000",
    "userId": "EMP001",
    "userName": "Nguyễn Văn A",
    "userMessage": "Xin chào AI!",
    "aiResponse": "Xin chào! Tôi là AI assistant...",
    "attachments": [],
    "sessionId": "session-1696606500000",
    "conversationContext": {
      "messageLength": 12,
      "hasAttachments": false,
      "attachmentCount": 0
    }
  }
}
```

#### 3. **File Upload** (`file_upload`)
```json
{
  "action": "file_upload",
  "timestamp": "2024-10-06T14:40:00.000Z",
  "data": {
    "fileId": "file-1696606800000",
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "fileType": "application/pdf",
    "userId": "EMP001",
    "userName": "Nguyễn Văn A",
    "uploadTime": "2024-10-06T14:40:00.000Z"
  }
}
```

#### 4. **User Logout** (`user_logout`)
```json
{
  "action": "user_logout",
  "timestamp": "2024-10-06T15:00:00.000Z",
  "data": {
    "employeeId": "EMP001",
    "name": "Nguyễn Văn A",
    "logoutTime": "2024-10-06T15:00:00.000Z",
    "sessionDuration": 1800
  }
}
```

#### 5. **Login Failed** (`login_failed`)
```json
{
  "action": "login_failed",
  "timestamp": "2024-10-06T14:25:00.000Z",
  "data": {
    "userId": "EMP001",
    "userName": "Unknown",
    "employeeId": "EMP999",
    "attemptTime": "2024-10-06T14:25:00.000Z",
    "reason": "Invalid credentials"
  }
}
```

#### 6. **Error Log** (`error_log`)
```json
{
  "action": "error_log",
  "timestamp": "2024-10-06T14:45:00.000Z",
  "data": {
    "userId": "EMP001",
    "userName": "Nguyễn Văn A",
    "error": "Cannot read property 'data' of undefined",
    "stack": "TypeError: Cannot read property...",
    "component": "Chat.jsx",
    "url": "http://localhost:5173/chat",
    "userAgent": "Mozilla/5.0..."
  }
}
```

#### 7. **Health Check** (`health_check`)
```json
{
  "action": "health_check",
  "timestamp": "2024-10-06T14:50:00.000Z",
  "data": {
    "type": "ping",
    "source": "pingme_app"
  }
}
```

### 🔧 Cách hoạt động:

1. **Authentication Events**: Mỗi lần login/logout thành công hoặc thất bại đều được ghi lại
2. **Chat Tracking**: Tất cả tin nhắn và phản hồi AI được theo dõi với context
3. **File Management**: Upload file được log với thông tin chi tiết
4. **Error Monitoring**: Lỗi JavaScript được tự động gửi lên webhook
5. **Health Check**: Kiểm tra kết nối webhook định kỳ (chỉ trong dev mode)

### 📊 Webhook Status Indicator:

- 🟢 **Green**: Webhook online và hoạt động bình thường
- 🔴 **Red**: Webhook offline hoặc lỗi kết nối
- 🟡 **Yellow**: Đang kiểm tra kết nối

### ⚙️ Cấu hình:

File webhook service: `src/services/webhookService.js`
```javascript
const WEBHOOK_URL = 'https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d';
```

### 🔒 Bảo mật:

- Tất cả request đều có timeout 10 giây
- Auth token được gửi trong header nếu có
- Lỗi webhook không ảnh hưởng đến UX của user
- Sensitive data được filter trước khi gửi

### 🧪 Test Webhook:

1. Đăng nhập với tài khoản demo
2. Gửi tin nhắn chat
3. Upload file
4. Đăng xuất
5. Kiểm tra n8n workflow của bạn để xem dữ liệu

### 🚀 Chạy ứng dụng:

```bash
npm run dev
```

Truy cập: http://localhost:5173/

### 📝 Tài khoản demo:

```
Mã nhân viên: EMP001
Mật khẩu: password123

Mã nhân viên: EMP002
Mật khẩu: admin123
```

---

**Lưu ý**: Webhook chỉ gửi dữ liệu cần thiết và không chứa thông tin nhạy cảm như mật khẩu. Tất cả dữ liệu đều được timestamp và có thể trace được.