# Hướng dẫn xử lý Webhook cho AI Assistant

## Tổng quan

Ứng dụng PingMe AI Assistant đã được cấu hình để gửi tin nhắn chat đến webhook n8n và nhận phản hồi từ AI. Dưới đây là cách thức hoạt động:

## URL Webhook
```
https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d
```

## Cấu trúc dữ liệu gửi đến webhook

### 1. Test Connection
```json
{
  "action": "test_connection",
  "timestamp": "2024-10-07T10:30:00.000Z",
  "data": {
    "message": "Testing webhook connection",
    "clientInfo": {
      "userAgent": "Mozilla/5.0...",
      "url": "http://localhost:5173/chat",
      "timestamp": "2024-10-07T10:30:00.000Z"
    }
  }
}
```

### 2. Chat Message
```json
{
  "action": "chat_message",
  "timestamp": "2024-10-07T10:30:00.000Z",
  "data": {
    "messageId": "chat-1696676200000",
    "userId": "EMP001",
    "userName": "Nguyễn Văn A",
    "userMessage": "Xin chào, tôi cần hỗ trợ",
    "attachments": [
      {
        "name": "document.pdf",
        "type": "application/pdf",
        "size": 1024000
      }
    ],
    "sessionId": "session-1696676200000",
    "conversationContext": {
      "messageLength": 25,
      "hasAttachments": true,
      "attachmentCount": 1
    }
  }
}
```

## Cấu trúc phản hồi từ webhook

Webhook cần trả về JSON với cấu trúc như sau:

### Thành công
```json
{
  "response": "Xin chào! Tôi có thể giúp gì cho bạn?",
  "status": "success",
  "messageId": "ai-response-1696676201000"
}
```

Hoặc có thể trả về các định dạng khác:
```json
{
  "message": "AI response here"
}
```

```json
{
  "answer": "AI response here"
}
```

```json
{
  "reply": "AI response here"
}
```

```json
{
  "data": {
    "response": "AI response here"
  }
}
```

### Lỗi
```json
{
  "error": "Error message",
  "status": "error"
}
```

## Cách code xử lý

### 1. Frontend (React)
File: `src/services/chatService.js`
- Gửi tin nhắn đến webhook
- Nhận phản hồi từ webhook
- Fallback về mock response nếu webhook lỗi

### 2. Webhook Service
File: `src/services/webhookService.js`
- Xử lý gọi API đến webhook
- Parse nhiều định dạng response khác nhau
- Error handling và retry logic

## Test webhook

1. Mở ứng dụng chat
2. Click vào menu người dùng (3 chấm)
3. Chọn "Webhook Debugger"
4. Click "Test Connection" để test kết nối
5. Click "Test Chat Message" để test tin nhắn chat

## Cấu hình n8n workflow

Workflow n8n nên có cấu trúc:

1. **Webhook Node**: Nhận dữ liệu từ frontend
2. **Switch Node**: Phân loại theo `action`
3. **AI Processing Node**: Xử lý tin nhắn (OpenAI, Claude, etc.)
4. **Response Node**: Trả về kết quả

### Ví dụ workflow n8n:

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.action}}",
              "value2": "chat_message"
            }
          ]
        }
      },
      "name": "Is Chat Message",
      "type": "n8n-nodes-base.if"
    },
    {
      "parameters": {
        "model": "gpt-3.5-turbo",
        "messages": {
          "messageValues": [
            {
              "role": "user",
              "content": "={{$json.data.userMessage}}"
            }
          ]
        }
      },
      "name": "OpenAI",
      "type": "@n8n/n8n-nodes-langchain.openAi"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": {
          "response": "={{$json.choices[0].message.content}}",
          "status": "success",
          "messageId": "ai-{{$now}}"
        }
      },
      "name": "Response",
      "type": "n8n-nodes-base.respondToWebhook"
    }
  ]
}
```

## Troubleshooting

### Lỗi thường gặp:

1. **Failed to fetch / CORS Error**: 
   - **Nguyên nhân**: Browser block cross-origin requests
   - **Giải pháp 1**: Sử dụng proxy trong development (đã cấu hình)
   - **Giải pháp 2**: Cấu hình CORS header trong n8n
   - **Giải pháp 3**: Ứng dụng tự động fallback từ Axios sang Fetch

2. **Timeout**: Webhook mất quá 30 giây để response
   - Giải pháp: Tăng timeout hoặc tối ưu workflow n8n

3. **Invalid JSON**: Response không phải JSON hợp lệ
   - Giải pháp: Đảm bảo n8n trả về JSON format

4. **Empty Response**: Webhook không trả về response
   - Giải pháp: Kiểm tra workflow n8n có Response node

5. **Network Error**: Không thể kết nối đến webhook
   - Giải pháp: Kiểm tra n8n instance có đang chạy không

### Debug steps:

1. **Sử dụng Webhook Debugger trong app**:
   - Mở menu người dùng → "Webhook Debugger"
   - Test "Connection" trước
   - Test "Chat (Axios)" để thử axios method
   - Test "Fetch API" để thử fetch method
   - Xem debug logs để hiểu lỗi

2. **Kiểm tra Browser DevTools**:
   - Console tab: Xem error messages chi tiết
   - Network tab: Kiểm tra HTTP requests/responses
   - Tìm request đến `/api/webhook` (proxy) hoặc `kpspa.app.n8n.cloud`

3. **Kiểm tra n8n workflow**:
   - Xem execution log trong n8n interface
   - Đảm bảo workflow có Response node
   - Kiểm tra data format được trả về

4. **Test các methods**:
   - Axios method (default)
   - Fetch method (fallback)
   - Proxy vs direct URL

## Tích hợp AI providers

### OpenAI
```javascript
// Trong n8n workflow
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "Bạn là AI assistant của PingMe. Trả lời bằng tiếng Việt."
    },
    {
      "role": "user", 
      "content": "{{$json.data.userMessage}}"
    }
  ]
}
```

### Claude (Anthropic)
```javascript
{
  "model": "claude-3-sonnet-20240229",
  "messages": [
    {
      "role": "user",
      "content": "{{$json.data.userMessage}}"
    }
  ]
}
```

### Gemini
```javascript
{
  "contents": [
    {
      "parts": [
        {
          "text": "{{$json.data.userMessage}}"
        }
      ]
    }
  ]
}
```

## Proxy Configuration (Development)

Để tránh CORS issues trong development, ứng dụng sử dụng Vite proxy:

### Cấu hình trong `vite.config.js`:
```javascript
server: {
  cors: true,
  proxy: {
    '/api/webhook': {
      target: 'https://kpspa.app.n8n.cloud',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/webhook/, '/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d')
    }
  }
}
```

### Cách hoạt động:
- **Development** (`localhost`): Sử dụng `/api/webhook` (proxy)
- **Production**: Sử dụng direct URL `https://kpspa.app.n8n.cloud/...`

### Ưu điểm của proxy:
- Tránh CORS errors trong development
- Che giấu webhook URL thực
- Dễ dàng switch giữa environments

## Security considerations

1. **API Keys**: Lưu trong environment variables của n8n
2. **Rate Limiting**: Giới hạn số request từ một user
3. **Input Validation**: Validate dữ liệu đầu vào
4. **Error Handling**: Không expose sensitive information
5. **Webhook URL**: Giấu URL thực trong production (sử dụng env vars)