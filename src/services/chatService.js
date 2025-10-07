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

// Check webhook health
const checkWebhookHealth = async () => {
  try {
    const testPayload = {
      action: 'health_check',
      timestamp: new Date().toISOString(),
      test: true
    };
    
    const response = await fetch('https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify(testPayload)
    });
    
    if (response.status === 400) {
      const errorText = await response.text();
      if (errorText.includes('ip not local')) {
        console.warn('🚫 Webhook health check: IP restriction detected');
        return { healthy: false, reason: 'IP_BLOCKED', details: errorText };
      }
    }
    
    return { 
      healthy: response.ok, 
      status: response.status, 
      reason: response.ok ? 'OK' : 'HTTP_ERROR',
      details: response.statusText 
    };
  } catch (error) {
    console.error('❌ Webhook health check failed:', error);
    return { healthy: false, reason: 'NETWORK_ERROR', details: error.message };
  }
};

export const chatService = {
  // Send message to AI
  async sendMessage(message, attachments = [], userId = null) {
    try {
      // Get current user info
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const currentUserId = userId || user.employeeId;
      
      // Prepare chat data for webhook
      const chatData = {
        id: `chat-${Date.now()}`,
        userId: currentUserId,
        userName: user.name || 'Anonymous',
        userMessage: message,
        attachments: attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        })),
        sessionId: localStorage.getItem('sessionId') || `session-${Date.now()}`,
        context: {
          messageLength: message.length,
          hasAttachments: attachments.length > 0,
          attachmentCount: attachments.length,
          userId: currentUserId
        }
      };
      
      console.log('📤 Sending message for userId:', currentUserId);
      
      // Try webhook with axios first
      let webhookResult = await webhookService.sendChatMessage(chatData);
      
      // If axios fails, try with fetch as fallback
      if (!webhookResult.success) {
        console.warn('🔄 Axios failed, trying fetch method...');
        
        // Check if it's an IP restriction error
        if (webhookResult.error && webhookResult.error.includes('IP restriction')) {
          console.warn('🚫 IP restriction detected, skipping fetch fallback and using mock response');
          webhookResult = { success: false, error: 'IP_BLOCKED' };
        } else {
          webhookResult = await webhookService.testWithFetch(chatData);
        }
      }
      
      let aiResponse;
      if (webhookResult.success && webhookResult.data && webhookResult.data.response) {
        // Use response from webhook
        aiResponse = webhookResult.data.response;
        console.log('✅ AI Response received:', aiResponse);
      } else {
        // Fallback to mock response if webhook fails
        console.warn('⚠️ Webhook failed or no response, using fallback');
        console.warn('Webhook error:', webhookResult.error);
        
        const lowerMessage = message.toLowerCase();
        
        // Check if it's an IP restriction error
        if (webhookResult.error === 'IP_BLOCKED' || (webhookResult.error && webhookResult.error.includes('IP restriction'))) {
          aiResponse = '🚫 **Kết nối webhook bị hạn chế IP**\n\n' +
                      'Hiện tại n8n webhook đang chặn truy cập từ IP address này. ' +
                      'Đây là chế độ bảo mật của n8n cloud.\n\n' +
                      '**Giải pháp:**\n' +
                      '• Sử dụng VPN với IP được phép\n' +
                      '• Cấu hình IP whitelist trong n8n\n' +
                      '• Triển khai proxy server\n\n' +
                      '_Hiện đang sử dụng chế độ offline với mock responses._';
        } else if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello')) {
          aiResponse = 'Xin chào! Tôi là AI assistant của PingMe. Tôi có thể giúp gì cho bạn?';
        } else if (lowerMessage.includes('cảm ơn')) {
          aiResponse = 'Không có gì! Tôi luôn sẵn sàng hỗ trợ bạn.';
        } else if (lowerMessage.includes('tạm biệt')) {
          aiResponse = 'Tạm biệt! Hẹn gặp lại bạn sớm nhé!';
        } else {
          // Random response
          aiResponse = MOCK_AI_RESPONSES[Math.floor(Math.random() * MOCK_AI_RESPONSES.length)];
        }
        
        // Handle attachments for fallback
        if (attachments.length > 0) {
          const fileTypes = attachments.map(file => {
            if (file.type.startsWith('image/')) return 'hình ảnh';
            if (file.type.includes('pdf')) return 'PDF';
            return 'file';
          });
          aiResponse += `\n\nTôi đã nhận được ${fileTypes.join(', ')} từ bạn. Tôi sẽ phân tích và phản hồi sớm nhất.`;
        }
      }
      
      const aiMessage = {
        id: `msg-${Date.now()}`,
        content: aiResponse,
        timestamp: new Date().toISOString(),
        sender: 'ai'
      };
      
      return {
        success: true,
        data: aiMessage
      };
      
    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      // Fallback error response
      const errorMessage = {
        id: `msg-${Date.now()}`,
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date().toISOString(),
        sender: 'ai'
      };
      
      return {
        success: false,
        data: errorMessage,
        error: error.message
      };
    }
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

  // Get chat history from webhook or fallback to mock
  async getChatHistory(userId) {
    try {
      console.log('📚 Getting chat history for userId:', userId);
      
      // Try to get from webhook first
      const webhookResult = await webhookService.getChatHistory(userId);
      
      if (webhookResult.success && webhookResult.data) {
        console.log('✅ Chat history loaded from webhook');
        
        // Format data if needed (webhook might return different format)
        let historyData = webhookResult.data;
        
        // If webhook returns an array of messages directly
        if (Array.isArray(historyData)) {
          return {
            success: true,
            data: historyData
          };
        }
        
        // If webhook returns object with messages array
        if (historyData.messages && Array.isArray(historyData.messages)) {
          return {
            success: true,
            data: historyData.messages
          };
        }
        
        // If webhook returns something else, try to extract messages
        console.warn('⚠️ Unexpected webhook response format:', historyData);
      }
      
      // Fallback to mock data if webhook fails
      console.warn('⚠️ Webhook failed, using mock chat history');
      await delay(500);
      
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
      
    } catch (error) {
      console.error('❌ Error getting chat history:', error);
      
      // Return empty history on error
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // Check webhook health status
  async checkWebhookHealth() {
    return await checkWebhookHealth();
  }
};