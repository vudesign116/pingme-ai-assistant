# Markdown Rendering Test

Đây là test để kiểm tra **markdown rendering** trong chat.

## Features được support:

### Text Formatting
- **Bold text**
- *Italic text*  
- `Inline code`
- ~~Strikethrough~~ (nếu support)

### Code Blocks
```javascript
function greetUser(name) {
  console.log(`Xin chào ${name}!`);
  return `Welcome to PingMe AI Assistant`;
}
```

```python
def process_message(message):
    """Process user message"""
    return f"AI Response: {message}"
```

### Lists

#### Unordered List:
- Feature 1: Real-time chat
- Feature 2: File upload
- Feature 3: Markdown support
  - Sub-item 1
  - Sub-item 2

#### Ordered List:
1. Đăng nhập vào hệ thống
2. Mở chat interface
3. Gửi tin nhắn
4. Nhận phản hồi từ AI

### Links
- [PingMe Documentation](https://example.com/docs)
- [GitHub Repository](https://github.com/example/pingme)

### Blockquotes
> Đây là một blockquote để test formatting.
> Nó có thể span multiple lines.

### Tables
| Feature | Status | Notes |
|---------|--------|-------|
| Chat | ✅ | Working |
| Upload | ✅ | Working |
| Markdown | 🔄 | Testing |
| Webhook | ✅ | Connected |

### Horizontal Rule
---

### Mixed Content
Bạn có thể combine **bold** với `code` và *italic* trong cùng một paragraph. Điều này rất hữu ích khi cần highlight các `function names` hoặc **important concepts**.

#### Technical Example:
Để gọi API, sử dụng:
```bash
curl -X POST https://api.example.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello AI"}'
```

Response sẽ có format:
```json
{
  "response": "Xin chào! Tôi có thể giúp gì cho bạn?",
  "status": "success"
}
```