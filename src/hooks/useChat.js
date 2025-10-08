import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import { chatHistoryService } from '../services/chatHistoryService';

export const useChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history when component mounts
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      // Chỉ load từ localStorage - không gọi webhook tự động
      const localHistory = chatHistoryService.getChatHistory(user.employeeId);
      if (localHistory.length > 0) {
        setMessages(localHistory);
        console.log(`📚 Loaded ${localHistory.length} messages from localStorage`);
      } else {
        console.log('📚 No local chat history found, starting with empty chat');
        // Không gọi webhook tự động nữa để tránh trigger không mong muốn
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async (content, attachments = []) => {
    if (!content.trim() && attachments.length === 0) return;

    const queryStartTime = Date.now();

    // Add user message to chat immediately
    const userMessage = {
      id: `user-msg-${Date.now()}`,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      sender: 'user',
      attachments: attachments,
      queryTime: queryStartTime
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Lưu user message vào localStorage ngay lập tức
    chatHistoryService.saveMessage(user.employeeId, userMessage);
    
    setLoading(true);

    // No progress update callback needed - just use typing indicator
    const onProgressUpdate = null;

    try {
      // Send to AI service
      const result = await chatService.sendMessage(content, attachments, user.employeeId, onProgressUpdate);
      
      const responseTime = Date.now() - queryStartTime;
      
      if (result.success) {
        const aiMessage = {
          id: `ai-msg-${Date.now()}`,
          content: result.response,
          timestamp: new Date().toISOString(),
          sender: 'ai',
          responseTime: responseTime,
          queryTime: queryStartTime
        };
        setMessages(prev => [...prev, aiMessage]);
        // Lưu AI response vào localStorage
        chatHistoryService.saveMessage(user.employeeId, aiMessage);
        
        // Cleanup blob URLs after successful send to prevent memory leaks
        attachments.forEach(file => {
          if (file.url && file.url.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(file.url);
              console.log(`🧹 Cleaned up blob URL after send: ${file.name}`);
            } catch (error) {
              console.warn(`Failed to cleanup blob URL for ${file.name}:`, error);
            }
          }
        });
      } else {
        // Add error message
        const errorMessage = {
          id: `error-msg-${Date.now()}`,
          content: result.response || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.',
          timestamp: new Date().toISOString(),
          sender: 'ai',
          isError: true,
          responseTime: responseTime,
          queryTime: queryStartTime
        };
        setMessages(prev => [...prev, errorMessage]);
        // Lưu error message vào localStorage
        chatHistoryService.saveMessage(user.employeeId, errorMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const responseTime = Date.now() - queryStartTime;
      const errorMessage = {
        id: `error-msg-${Date.now()}`,
        content: 'Không thể kết nối đến AI. Vui lòng kiểm tra kết nối mạng.',
        timestamp: new Date().toISOString(),
        sender: 'ai',
        isError: true,
        responseTime: responseTime,
        queryTime: queryStartTime
      };
      setMessages(prev => [...prev, errorMessage]);
      // Lưu error message vào localStorage
      chatHistoryService.saveMessage(user.employeeId, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const result = await chatService.uploadFile(file);
      setUploading(false);
      return result;
    } catch (error) {
      setUploading(false);
      return {
        success: false,
        message: 'Không thể upload file. Vui lòng thử lại.'
      };
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearChat = () => {
    setMessages([]);
    // Xóa lịch sử chat khỏi localStorage
    if (user) {
      chatHistoryService.clearChatHistory(user.employeeId);
    }
  };

  const exportChatHistory = () => {
    if (user) {
      chatHistoryService.exportHistory(user.employeeId);
    }
  };

  const importChatHistory = async (file) => {
    if (user) {
      try {
        const importedMessages = await chatHistoryService.importHistory(file, user.employeeId);
        setMessages(importedMessages);
        return { success: true, message: `Đã import ${importedMessages.length} tin nhắn` };
      } catch (error) {
        return { success: false, message: 'Không thể import file. Vui lòng kiểm tra định dạng file.' };
      }
    }
    return { success: false, message: 'Vui lòng đăng nhập trước' };
  };

  const getChatStats = () => {
    if (user) {
      return chatHistoryService.getHistoryStats(user.employeeId);
    }
    return null;
  };

  return {
    messages,
    loading,
    uploading,
    messagesEndRef,
    sendMessage,
    uploadFile,
    clearChat,
    scrollToBottom,
    exportChatHistory,
    importChatHistory,
    getChatStats
  };
};