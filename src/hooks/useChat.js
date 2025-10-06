import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';

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
      const result = await chatService.getChatHistory(user.employeeId);
      if (result.success) {
        setMessages(result.data);
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
    setLoading(true);

    try {
      // Send to AI service
      const result = await chatService.sendMessage(content, attachments);
      
      if (result.success) {
        setMessages(prev => [...prev, result.data]);
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
  };

  return {
    messages,
    loading,
    uploading,
    messagesEndRef,
    sendMessage,
    uploadFile,
    clearChat,
    scrollToBottom
  };
};