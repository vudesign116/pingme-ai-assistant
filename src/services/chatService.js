import { webhookService } from './webhookService';
import simpleFileUpload from './simpleFileUpload.js';
import { excelConverter } from '../utils/excelConverter.js';

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
  // Helper function to convert file to base64
  convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the data:mime/type;base64, prefix to get just the base64 string
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Helper function to extract text from text files  
  convertFileToText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsText(file, 'UTF-8');
    });
  },

  // Get file processing strategy for AI
  getFileProcessingStrategy(file, useUrl = true) {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    // Excel files - convert to JSON for AI analysis
    if (fileType.includes('sheet') || 
        fileType.includes('excel') ||
        fileName.endsWith('.xlsx') || 
        fileName.endsWith('.xls') ||
        fileName.endsWith('.xlsm')) {
      return {
        strategy: 'excel',
        supportedByAI: true,
        processing: 'json_conversion',
        description: 'Excel file converted to JSON for AI analysis'
      };
    }
    
    // Images - use URL link instead of base64 for better performance
    if (fileType.startsWith('image/')) {
      return {
        strategy: 'vision',
        supportedByAI: true,
        processing: useUrl ? 'url' : 'base64',
        description: useUrl ? 'Image URL for AI vision analysis' : 'Image for AI vision analysis'
      };
    }
    
    // Text files - extract content
    if (fileType.startsWith('text/') || 
        fileName.endsWith('.txt') || 
        fileName.endsWith('.md') || 
        fileName.endsWith('.csv') ||
        fileName.endsWith('.json') ||
        fileName.endsWith('.xml')) {
      return {
        strategy: 'text',
        supportedByAI: true,
        processing: 'text_content',
        description: 'Text content for AI analysis'
      };
    }
    
    // Code files - extract content
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx') ||
        fileName.endsWith('.ts') || fileName.endsWith('.tsx') ||
        fileName.endsWith('.py') || fileName.endsWith('.java') ||
        fileName.endsWith('.cpp') || fileName.endsWith('.c') ||
        fileName.endsWith('.css') || fileName.endsWith('.html')) {
      return {
        strategy: 'code',
        supportedByAI: true,
        processing: 'text_content',
        description: 'Code file for AI analysis'
      };
    }
    
    // Default - metadata only
    return {
      strategy: 'unknown',
      supportedByAI: false,
      processing: 'metadata',
      description: 'File type not directly supported',
      note: 'Only metadata will be sent to AI'
    };
  },

  // Send message to AI
  async sendMessage(message, files = [], conversationHistory = [], onProgressUpdate = null) {
    console.log('📤 Sending message:', message);
    
    try {
      // Create chat data with proper structure for AI processing
      const chatData = {
        message: message,
        files: files,
        conversationHistory: conversationHistory,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now().toString()
      };

      console.log('� Chat data prepared:', chatData);

      // Show initial loading message
      if (onProgressUpdate) {
        onProgressUpdate('🔍 Đang xử lý...');
      }

      // Send to webhook with enhanced error handling and progress tracking
      const webhookPromise = webhookService.sendChatMessage(chatData);
      
      // Set up progress updates
      const progressTimer = setTimeout(() => {
        if (onProgressUpdate) {
          onProgressUpdate('🤖 AI đang phân tích...');
        }
      }, 3000); // After 3 seconds
      
      const longProgressTimer = setTimeout(() => {
        if (onProgressUpdate) {
          onProgressUpdate('⏳ Đang xử lý phức tạp...');
        }
      }, 8000); // After 8 seconds

      let webhookResult;
      try {
        webhookResult = await webhookPromise;
        clearTimeout(progressTimer);
        clearTimeout(longProgressTimer);
      } catch (error) {
        clearTimeout(progressTimer);
        clearTimeout(longProgressTimer);
        throw error;
      }
      
      // Continue with existing logic
      // If axios fails, try with fetch as fallback
      if (!webhookResult.success) {
        if (onProgressUpdate) {
          onProgressUpdate('🔄 Đang thử phương pháp kết nối khác...');
        }
        
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
      if (webhookResult.success && webhookResult.data) {
        // Try multiple response formats from webhook
        if (webhookResult.data.response) {
          aiResponse = webhookResult.data.response;
          console.log('✅ AI Response received (data.response):', aiResponse);
        } else if (webhookResult.data.message) {
          aiResponse = webhookResult.data.message;
          console.log('✅ AI Response received (data.message):', aiResponse);
        } else if (typeof webhookResult.data === 'string') {
          aiResponse = webhookResult.data;
          console.log('✅ AI Response received (string data):', aiResponse);
        } else if (webhookResult.data.text) {
          aiResponse = webhookResult.data.text;
          console.log('✅ AI Response received (data.text):', aiResponse);
        } else {
          // Try to extract any text content from the response
          console.warn('⚠️ No standard AI response found, trying to extract any text content...');
          const responseStr = JSON.stringify(webhookResult.data);
          console.log('📝 Full webhook response data:', webhookResult.data);
          
          // Look for common AI response patterns
          const textFields = ['content', 'answer', 'result', 'output'];
          for (const field of textFields) {
            if (webhookResult.data[field] && typeof webhookResult.data[field] === 'string') {
              aiResponse = webhookResult.data[field];
              console.log(`✅ AI Response found in data.${field}:`, aiResponse);
              break;
            }
          }
          
          if (!aiResponse) {
            console.warn('⚠️ Could not extract AI response from webhook data, using fallback');
            aiResponse = null; // Will trigger fallback
          }
        }
      }
      
      if (!aiResponse) {
        // Fallback to mock response if webhook fails or no response found
        console.warn('⚠️ Webhook failed or no response, using fallback');
        console.warn('Webhook error details:', {
          error: webhookResult.error || 'Unknown error',
          success: webhookResult.success,
          details: webhookResult.details,
          fullData: webhookResult.data
        });
        
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
          aiResponse = '👋 **Xin chào!** Tôi là AI Assistant của PingMe.\n\n' +
                      'Tôi có thể giúp bạn:\n' +
                      '• Trả lời câu hỏi\n' +
                      '• Phân tích hình ảnh và tài liệu\n' +
                      '• Xử lý file văn bản và code\n' +
                      '• Hỗ trợ công việc hàng ngày\n\n' +
                      '_Lưu ý: Hiện đang sử dụng chế độ offline._';
        } else if (lowerMessage.includes('giúp') || lowerMessage.includes('help')) {
          aiResponse = '🆘 **Hỗ trợ PingMe AI Assistant**\n\n' +
                      '**Tôi có thể giúp bạn:**\n' +
                      '• Trả lời câu hỏi tổng quan\n' +
                      '• Phân tích và mô tả hình ảnh\n' +
                      '• Đọc và tóm tắt tài liệu\n' +
                      '• Review và giải thích code\n' +
                      '• Hỗ trợ dịch thuật\n\n' +
                      '**Upload file:** Tôi hỗ trợ nhiều định dạng file khác nhau\n' +
                      '_Lưu ý: Đang hoạt động ở chế độ offline._';
        } else {
          aiResponse = '🤖 **AI Assistant đang offline**\n\n' +
                      `Tôi đã nhận được tin nhắn: "${message}"\n\n` +
                      'Hiện tại webhook không khả dụng, nhưng tôi vẫn có thể:\n' +
                      '• Nhận và lưu trữ tin nhắn của bạn\n' +
                      '• Xử lý file upload cơ bản\n' +
                      '• Cung cấp hỗ trợ offline\n\n' +
                      '_Khi kết nối phục hồi, tôi sẽ có thể trả lời đầy đủ hơn._';
        }
      }

      // Return successful response
      return {
        success: true,
        response: aiResponse,
        source: 'webhook',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('💥 Error in sendMessage:', error);
      return {
        success: false,
        error: error.message,
        response: '❌ **Lỗi hệ thống**\n\nĐã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.'
      };
    }
  },

  // Upload file with comprehensive AI processing support
  async uploadFile(file) {
    await delay(500);
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        message: 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.'
      };
    }

    console.log(`📤 Processing file for AI: ${file.name} (${file.size} bytes)`);

    try {
      // Step 1: Upload file to get public HTTP/HTTPS URL
      const uploadResult = await simpleFileUpload.uploadFile(file);
      
      if (!uploadResult.success) {
        console.error('❌ File upload failed:', uploadResult.error);
        return {
          success: false,
          message: `Không thể upload file: ${uploadResult.error}`
        };
      }

      console.log(`✅ File uploaded successfully:`, {
        url: uploadResult.url,
        service: uploadResult.uploadService,
        size: uploadResult.fileSize
      });

      // Step 2: Process Excel files to JSON
      let processedData = null;
      if (excelConverter.isExcelFile(file)) {
        console.log(`📊 Converting Excel file to JSON: ${file.name}`);
        try {
          const excelJSON = await excelConverter.convertExcelToJSON(file);
          const aiSummary = excelConverter.createAISummary(excelJSON);
          
          processedData = {
            type: 'excel_json',
            originalFile: file.name,
            summary: aiSummary,
            fullData: excelJSON
          };
          
          console.log(`✅ Excel converted to JSON:`, {
            sheets: excelJSON.summary.totalSheets,
            rows: excelJSON.summary.totalRows,
            size: JSON.stringify(processedData).length
          });
        } catch (error) {
          console.warn(`⚠️ Excel conversion failed for ${file.name}:`, error);
          processedData = null;
        }
      }

      // Create blob URL for UI preview only
      let previewUrl = null;
      try {
        if (file.type.startsWith('image/') && file.size > 0) {
          previewUrl = URL.createObjectURL(file);
          console.log(`🔗 Created blob URL for preview: ${file.name}`);
          
          // Auto cleanup after 5 minutes
          setTimeout(() => {
            if (previewUrl) {
              try {
                URL.revokeObjectURL(previewUrl);
                console.log(`⏰ Auto-revoked blob URL for: ${file.name}`);
              } catch (e) {
                console.warn(`Failed to auto-revoke blob URL:`, e);
              }
            }
          }, 5 * 60 * 1000);
        }
      } catch (error) {
        console.warn(`⚠️ Could not create blob URL for ${file.name}:`, error);
      }
      
      // Enhanced file data structure
      const fileData = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: previewUrl, // For UI preview only
        originalFile: file,
        
        // Public URL for webhook (HTTP/HTTPS)
        publicUrl: uploadResult.url,
        uploadService: uploadResult.uploadService,
        
        // Processed data for AI (Excel -> JSON)
        processedData: processedData,
        hasProcessedData: !!processedData,
        
        mimeType: file.type,
        isImage: file.type.startsWith('image/'),
        isExcel: excelConverter.isExcelFile(file),
        isSupported: true // All files are supported with public URLs
      };
      
      console.log(`📎 File ready: ${file.name}`);
      console.log(`🌐 Public URL: ${uploadResult.url}`);
      
      return {
        success: true,
        data: fileData
      };
      
    } catch (error) {
      console.error(`💥 Failed to process file ${file.name}:`, error);
      return {
        success: false,
        message: `Không thể xử lý file: ${error.message}`
      };
    }
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