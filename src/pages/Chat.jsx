import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Image, 
  File, 
  X, 
  User, 
  Bot,
  LogOut,
  MoreVertical,
  Settings,
  History
} from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { setupIOSViewport } from '../utils/iosViewport';
import WebhookDebugger from '../components/WebhookDebugger';
import MarkdownMessage from '../components/MarkdownMessage';
import ChatHistoryManager from '../components/ChatHistoryManager';
import './Chat.css';

const Chat = ({ user, onLogout }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWebhookDebugger, setShowWebhookDebugger] = useState(false);
  const [showHistoryManager, setShowHistoryManager] = useState(false);
  const [toast, setToast] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const attachMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  const { 
    messages, 
    loading, 
    uploading, 
    messagesEndRef, 
    sendMessage, 
    uploadFile,
    clearChat,
    exportChatHistory,
    importChatHistory,
    getChatStats
  } = useChat(user);

  // Setup iOS viewport handling
  useEffect(() => {
    const cleanup = setupIOSViewport();
    return cleanup;
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setShowAttachMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle scroll to show/hide scroll-to-bottom button
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollToBottom(!isNearBottom && messages.length > 0);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    // Don't send empty messages
    if (!inputMessage.trim() && attachments.length === 0) return;

    await sendMessage(inputMessage, attachments);
    setInputMessage('');
    setAttachments([]);
    setShowAttachMenu(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Additional validation before sending
      if (inputMessage.trim() || attachments.length > 0) {
        handleSendMessage();
      }
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = async (file) => {
    const result = await uploadFile(file);
    if (result.success) {
      // Ensure the attachment has all required fields
      const attachment = {
        id: result.data?.id || `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: result.data?.name || result.data?.fileName || file.name,
        fileName: result.data?.fileName || result.data?.name || file.name,
        type: result.data?.type || result.data?.fileType || result.data?.mimeType || file.type,
        fileType: result.data?.fileType || result.data?.type || result.data?.mimeType || file.type,
        mimeType: result.data?.mimeType || result.data?.type || file.type,
        size: result.data?.size || result.data?.fileSize || file.size,
        fileSize: result.data?.fileSize || result.data?.size || file.size,
        url: result.data?.url || '',
        category: result.data?.category || (file.type.startsWith('image/') ? 'image' : 'document'),
        uploadService: result.data?.uploadService || 'unknown'
      };
      
      console.log('✅ File processed successfully:', attachment);
      setAttachments(prev => [...prev, attachment]);
      showToast(`Đã thêm ${attachment.name}`, 'success');
    } else {
      showToast(result.message || 'Upload failed', 'error');
    }
  };

  const removeAttachment = (id) => {
    const attachment = attachments.find(att => att.id === id);
    setAttachments(prev => prev.filter(att => att.id !== id));
    if (attachment) {
      // Cleanup blob URL to prevent memory leaks
      if (attachment.url && attachment.url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(attachment.url);
          console.log(`🗑️ Cleaned up blob URL for: ${attachment.name}`);
        } catch (error) {
          console.warn(`Failed to cleanup blob URL for ${attachment.name}:`, error);
        }
      }
      showToast(`Đã xóa ${attachment.name}`, 'success');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatResponseTime = (responseTime) => {
    if (!responseTime) return '';
    
    if (responseTime < 1000) {
      return `${responseTime}ms`;
    } else {
      return `${(responseTime / 1000).toFixed(1)}s`;
    }
  };



  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="chat-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
      
      {/* Header */}
      <div className="chat-header">
        <div className="user-info">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-details">
            <h3>{user.name}</h3>
            <span className="user-role">{user.role}</span>
          </div>
        </div>
        
        <div className="header-actions" ref={userMenuRef}>
          <button 
            className="btn-icon"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <MoreVertical size={20} />
          </button>
          
          {showUserMenu && (
            <div className="user-menu">
              <button 
                onClick={() => {
                  setShowHistoryManager(true);
                  setShowUserMenu(false);
                }} 
                className="menu-item"
              >
                <History size={16} />
                Lịch Sử Chat
              </button>
              <button 
                onClick={() => {
                  setShowWebhookDebugger(true);
                  setShowUserMenu(false);
                }} 
                className="menu-item"
              >
                <Settings size={16} />
                Webhook Debugger
              </button>
              <button onClick={onLogout} className="menu-item logout">
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>



      {/* Messages */}
      <div className="messages-container" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-icon">
              <Bot size={48} />
            </div>
            <h3>Xin chào {user.name}!</h3>
            <p>Tôi là AI Assistant của PingMe. Tôi có thể giúp gì cho bạn hôm nay?</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'} ${message.isError ? 'error-message' : ''} ${message.isLoading ? 'loading' : ''}`}
              >
                <div className="message-avatar">
                  {message.sender === 'user' ? (
                    <User size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                </div>
                
                <div className="message-content">
                  <div className="message-bubble">
                    <MarkdownMessage 
                      content={message.content} 
                      sender={message.sender}
                    />
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="message-attachments">
                        {message.attachments.map((file) => {
                          // Handle potentially missing file data to prevent type errors
                          const fileId = file?.id || `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
                          const fileName = file?.name || file?.fileName || 'Unknown File';
                          const fileType = file?.type || file?.fileType || file?.mimeType || 'application/octet-stream';
                          const fileUrl = file?.url || '';
                          const isImage = fileType.startsWith('image/');
                          
                          return (
                            <div key={fileId} className="attachment-preview">
                              {isImage && fileUrl ? (
                                <img 
                                  src={fileUrl} 
                                  alt={fileName} 
                                  className="attachment-image"
                                  onError={(e) => {
                                    console.warn(`Failed to load image: ${fileName} from ${fileUrl}`);
                                    // Hide the failed image
                                    e.target.style.display = 'none';
                                    // Show fallback file icon by updating parent
                                    const parent = e.target.parentElement;
                                    if (parent) {
                                      const fallback = parent.querySelector('.attachment-file');
                                      if (fallback) {
                                        fallback.style.display = 'flex';
                                      }
                                    }
                                  }}
                                />
                              ) : null}
                              <div 
                                className="attachment-file" 
                                style={{ display: isImage && fileUrl ? 'none' : 'flex' }}
                              >
                                <File size={16} />
                                <span>{fileName}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                    {message.responseTime && (
                      <span className="response-time">
                        • {formatResponseTime(message.responseTime)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="message ai-message">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-content">
                  <div className="message-bubble typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Scroll to Bottom Button */}
        {showScrollToBottom && (
          <button 
            className="scroll-to-bottom-btn"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
          >
            <div className="scroll-btn-content">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 13l3 3 3-3"/>
                <path d="M7 6l3 3 3-3"/>
              </svg>
              <span className="scroll-btn-text">Tin nhắn mới nhất</span>
            </div>
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="input-area">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="attachments-preview">
            {attachments.map((file) => {
              // Handle potentially missing file data to prevent type errors
              const fileId = file?.id || `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
              const fileName = file?.name || file?.fileName || 'Unknown File';
              const fileType = file?.type || file?.fileType || file?.mimeType || 'application/octet-stream';
              const fileSize = file?.size || file?.fileSize || 0;
              const fileUrl = file?.url || '';
              const isImage = fileType.startsWith('image/');
              const isBlobUrl = fileUrl.startsWith('blob:');
              
              return (
                <div key={fileId} className="attachment-item">
                  {isImage && fileUrl && !isBlobUrl ? (
                    <img 
                      src={fileUrl} 
                      alt={fileName} 
                      className="attachment-thumbnail"
                      onError={(e) => {
                        console.warn(`❌ Failed to load thumbnail: ${fileName} from ${fileUrl}`);
                        // Hide image and show file icon instead
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.file-attachment');
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }
                      }}
                      onLoad={() => {
                        console.log(`✅ Successfully loaded thumbnail: ${fileName}`);
                      }}
                    />
                  ) : null}
                  <div 
                    className="file-attachment"
                    style={{ display: isImage && fileUrl && !isBlobUrl ? 'none' : 'flex' }}
                  >
                    <File size={16} />
                    <div className="file-info">
                      <span className="file-name">{fileName}</span>
                      <span className="file-size">{formatFileSize(fileSize)}</span>
                    </div>
                  </div>
                  <button 
                    className="remove-attachment"
                    onClick={() => removeAttachment(fileId)}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="input-container">
          <div className="attach-menu" ref={attachMenuRef}>
            <button 
              className="btn-attach"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              disabled={uploading}
              title={uploading ? "Đang tải file..." : "Đính kèm file"}
            >
              {uploading ? (
                <div className="loading"></div>
              ) : (
                <Paperclip size={20} />
              )}
            </button>
            
            {showAttachMenu && (
              <div className="attach-dropdown">
                <button 
                  onClick={() => {
                    imageInputRef.current?.click();
                  }}
                  className="attach-option"
                  disabled={uploading}
                >
                  <Image size={16} />
                  Hình ảnh
                </button>
                <button 
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="attach-option"
                  disabled={uploading}
                >
                  <File size={16} />
                  File & Tài liệu
                </button>
                <div className="attach-divider"></div>
                <div className="attach-help">
                  <small>Tối đa 10MB mỗi file</small>
                </div>
              </div>
            )}
          </div>

          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="message-input"
            rows={1}
            disabled={loading}
          />

          <button 
            className="btn-send"
            onClick={handleSendMessage}
            disabled={
              loading || 
              (!inputMessage.trim() && attachments.length === 0)
            }
          >
            {loading ? (
              <div className="loading"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={async (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
              // Process files sequentially to avoid overwhelming the UI
              for (const file of files) {
                await handleFileUpload(file);
              }
              // Close menu after processing all files
              setShowAttachMenu(false);
            }
            e.target.value = '';
          }}
        />
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          onChange={async (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
              // Process files sequentially to avoid overwhelming the UI
              for (const file of files) {
                await handleFileUpload(file);
              }
              // Close menu after processing all files
              setShowAttachMenu(false);
            }
            e.target.value = '';
          }}
        />
      </div>
      
      {/* Webhook Debugger */}
      <WebhookDebugger 
        isVisible={showWebhookDebugger}
        onClose={() => setShowWebhookDebugger(false)}
      />

      {/* Chat History Manager */}
      <ChatHistoryManager 
        isVisible={showHistoryManager}
        onClose={() => setShowHistoryManager(false)}
        chatStats={getChatStats()}
        onClearChat={() => {
          clearChat();
          showToast('Đã xóa lịch sử chat', 'success');
        }}
        onExportHistory={() => {
          exportChatHistory();
          showToast('Đã tải xuống lịch sử chat', 'success');
        }}
        onImportHistory={importChatHistory}
      />
    </div>
  );
};

export default Chat;