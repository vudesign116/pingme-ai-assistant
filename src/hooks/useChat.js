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
      // Đầu tiên load từ localStorage
      const localHistory = chatHistoryService.getChatHistory(user.employeeId);
      if (localHistory.length > 0) {
        setMessages(localHistory);
        console.log(`📚 Loaded ${localHistory.length} messages from localStorage`);
      } else {
        // Nếu localStorage trống, load từ server (mock)
        const result = await chatService.getChatHistory(user.employeeId);
        if (result.success && result.data.length > 0) {
          setMessages(result.data);
          // Lưu vào localStorage để lần sau
          chatHistoryService.saveMessages(user.employeeId, result.data);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async (content, attachments = []) => {
    if (!content.trim() && attachments.length === 0) return;

    // Add user message to chat
    const userMessage = {
      id: `user-msg-${Date.now()}`,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      sender: 'user',
      attachments: attachments
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Lưu user message vào localStorage ngay lập tức
    chatHistoryService.saveMessage(user.employeeId, userMessage);
    
    setLoading(true);

    try {
      // Send to AI service with userId
      const result = await chatService.sendMessage(content, attachments, user.employeeId);
      
      if (result.success) {
        setMessages(prev => [...prev, result.data]);
        // Lưu AI response vào localStorage
        chatHistoryService.saveMessage(user.employeeId, result.data);
      } else {
        // Add error message
        const errorMessage = {
          id: `error-msg-${Date.now()}`,
          content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.',
          timestamp: new Date().toISOString(),
          sender: 'ai',
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
        // Lưu error message vào localStorage
        chatHistoryService.saveMessage(user.employeeId, errorMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: `error-msg-${Date.now()}`,
        content: 'Không thể kết nối đến AI. Vui lòng kiểm tra kết nối mạng.',
        timestamp: new Date().toISOString(),
        sender: 'ai',
        isError: true
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