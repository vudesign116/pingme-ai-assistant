// Chat History Storage Service
const CHAT_HISTORY_KEY = 'pingme_chat_history';
const MAX_HISTORY_ITEMS = 100; // Giới hạn số tin nhắn lưu trữ
const HISTORY_EXPIRY_DAYS = 30; // Lưu trữ 30 ngày

export const chatHistoryService = {
  // Lưu tin nhắn vào localStorage
  saveMessage(userId, message) {
    try {
      const history = this.getChatHistory(userId);
      const newMessage = {
        ...message,
        savedAt: new Date().toISOString()
      };
      
      history.push(newMessage);
      
      // Giới hạn số lượng tin nhắn
      if (history.length > MAX_HISTORY_ITEMS) {
        history.splice(0, history.length - MAX_HISTORY_ITEMS);
      }
      
      this.saveChatHistory(userId, history);
      console.log('💾 Message saved to localStorage:', message.id);
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  },

  // Lưu toàn bộ cuộc hội thoại
  saveMessages(userId, messages) {
    try {
      const messagesWithTimestamp = messages.map(msg => ({
        ...msg,
        savedAt: new Date().toISOString()
      }));
      
      this.saveChatHistory(userId, messagesWithTimestamp);
      console.log(`💾 Saved ${messages.length} messages for user ${userId}`);
    } catch (error) {
      console.error('❌ Error saving messages:', error);
    }
  },

  // Lấy lịch sử chat của user
  getChatHistory(userId) {
    try {
      const allHistory = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '{}');
      const userHistory = allHistory[userId] || [];
      
      // Lọc bỏ tin nhắn cũ quá hạn
      const validHistory = userHistory.filter(msg => {
        const savedDate = new Date(msg.savedAt || msg.timestamp);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() - HISTORY_EXPIRY_DAYS);
        return savedDate > expiryDate;
      });
      
      // Nếu có tin nhắn bị lọc, cập nhật localStorage
      if (validHistory.length !== userHistory.length) {
        this.saveChatHistory(userId, validHistory);
      }
      
      return validHistory;
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      return [];
    }
  },

  // Lưu lịch sử chat vào localStorage
  saveChatHistory(userId, messages) {
    try {
      const allHistory = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '{}');
      allHistory[userId] = messages;
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allHistory));
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  },

  // Xóa lịch sử chat của user
  clearChatHistory(userId) {
    try {
      const allHistory = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '{}');
      delete allHistory[userId];
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allHistory));
      console.log(`🗑️ Cleared chat history for user ${userId}`);
    } catch (error) {
      console.error('❌ Error clearing chat history:', error);
    }
  },

  // Xóa toàn bộ lịch sử chat
  clearAllHistory() {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
      console.log('🗑️ Cleared all chat history');
    } catch (error) {
      console.error('❌ Error clearing all history:', error);
    }
  },

  // Lấy thống kê lịch sử chat
  getHistoryStats(userId) {
    try {
      const history = this.getChatHistory(userId);
      const userMessages = history.filter(msg => msg.sender === 'user').length;
      const aiMessages = history.filter(msg => msg.sender === 'ai').length;
      const totalMessages = history.length;
      
      const oldestMessage = history.length > 0 ? 
        new Date(Math.min(...history.map(msg => new Date(msg.timestamp)))) : null;
      const newestMessage = history.length > 0 ? 
        new Date(Math.max(...history.map(msg => new Date(msg.timestamp)))) : null;

      return {
        totalMessages,
        userMessages,
        aiMessages,
        oldestMessage,
        newestMessage,
        storageSize: this.getStorageSize()
      };
    } catch (error) {
      console.error('❌ Error getting history stats:', error);
      return {
        totalMessages: 0,
        userMessages: 0,
        aiMessages: 0,
        oldestMessage: null,
        newestMessage: null,
        storageSize: 0
      };
    }
  },

  // Lấy kích thước storage đã sử dụng
  getStorageSize() {
    try {
      const data = localStorage.getItem(CHAT_HISTORY_KEY) || '{}';
      return new Blob([data]).size;
    } catch (error) {
      return 0;
    }
  },

  // Export lịch sử chat để backup
  exportHistory(userId) {
    try {
      const history = this.getChatHistory(userId);
      const exportData = {
        userId,
        exportDate: new Date().toISOString(),
        messages: history,
        stats: this.getHistoryStats(userId)
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `pingme-chat-history-${userId}-${Date.now()}.json`;
      link.click();
      
      console.log(`📤 Exported chat history for user ${userId}`);
    } catch (error) {
      console.error('❌ Error exporting history:', error);
    }
  },

  // Import lịch sử chat từ backup
  importHistory(file, userId) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importData = JSON.parse(e.target.result);
            if (importData.messages && Array.isArray(importData.messages)) {
              this.saveMessages(userId, importData.messages);
              console.log(`📥 Imported ${importData.messages.length} messages`);
              resolve(importData.messages);
            } else {
              reject(new Error('Invalid backup file format'));
            }
          } catch (parseError) {
            reject(parseError);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    });
  }
};