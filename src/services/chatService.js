import { webhookService } from './webhookService';

// Mock AI responses - replace with real AI API later
const MOCK_AI_RESPONSES = [
  'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?',
  'Tôi hiểu rồi. Để hỗ trợ bạn tốt hơn, bạn có thể cung cấp thêm thông tin không?',
  'Đây là một câu hỏi hay! Hãy để tôi suy nghĩ một chút...',
  'Cảm ơn bạn đã chia sẻ. Tôi sẽ cố gắng hỗ trợ bạn tốt nhất có thể.',
  'Tôi đã hiểu vấn đề của bạn. Đây là gợi ý của tôi...'
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const chatService = {
  // Send message to AI
  async sendMessage(message, attachments = []) {
    await delay(1500); // Simulate AI thinking time
    
    // Mock AI response based on message content
    let response;
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello')) {
      response = 'Xin chào! Tôi là AI assistant của PingMe. Tôi có thể giúp gì cho bạn?';
    } else if (lowerMessage.includes('cảm ơn')) {
      response = 'Không có gì! Tôi luôn sẵn sàng hỗ trợ bạn.';
    } else if (lowerMessage.includes('tạm biệt')) {
      response = 'Tạm biệt! Hẹn gặp lại bạn sớm nhé!';
    } else {
      // Random response
      response = MOCK_AI_RESPONSES[Math.floor(Math.random() * MOCK_AI_RESPONSES.length)];
    }
    
    // Handle attachments
    if (attachments.length > 0) {
      const fileTypes = attachments.map(file => {
        if (file.type.startsWith('image/')) return 'hình ảnh';
        if (file.type.includes('pdf')) return 'PDF';
        return 'file';
      });
      response += `\n\nTôi đã nhận được ${fileTypes.join(', ')} từ bạn. Tôi sẽ phân tích và phản hồi sớm nhất.`;
    }
    
    const aiMessage = {
      id: `msg-${Date.now()}`,
      content: response,
      timestamp: new Date().toISOString(),
      sender: 'ai'
    };
    
    // Send chat data to webhook
    try {
      const chatData = {
        id: `chat-${Date.now()}`,
        userMessage: message,
        aiResponse: response,
        attachments: attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        })),
        sessionId: localStorage.getItem('sessionId') || `session-${Date.now()}`,
        context: {
          messageLength: message.length,
          hasAttachments: attachments.length > 0,
          attachmentCount: attachments.length
        }
      };
      
      await webhookService.sendChatMessage(chatData);
    } catch (error) {
      console.error('Failed to send chat message to webhook:', error);
      // Don't fail the chat if webhook fails
    }
    
    return {
      success: true,
      data: aiMessage
    };
  },

  // Upload file (mock)
  async uploadFile(file) {
    await delay(500);
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        message: 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.'
      };
    }
    
    const fileData = {
      id: `file-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file) // For preview
    };
    
    // Send file upload info to webhook
    try {
      await webhookService.sendFileUpload(fileData);
    } catch (error) {
      console.error('Failed to send file upload to webhook:', error);
      // Don't fail the upload if webhook fails
    }
    
    return {
      success: true,
      data: fileData
    };
  },

  // Get chat history (mock)
  async getChatHistory(userId) {
    await delay(500);
    
    // Mock chat history
    return {
      success: true,
      data: [
        {
          id: 'msg-1',
          content: 'Xin chào! Tôi là AI assistant của PingMe. Tôi có thể giúp gì cho bạn?',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          sender: 'ai'
        }
      ]
    };
  }
};