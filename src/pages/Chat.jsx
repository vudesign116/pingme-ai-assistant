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
  MoreVertical
} from 'lucide-react';
import { useChat } from '../hooks/useChat';
import './Chat.css';

const Chat = ({ user, onLogout }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const attachMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  
  const { 
    messages, 
    loading, 
    uploading, 
    messagesEndRef, 
    sendMessage, 
    uploadFile 
  } = useChat(user);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return;

    await sendMessage(inputMessage, attachments);
    setInputMessage('');
    setAttachments([]);
    setShowAttachMenu(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = async (file) => {
    const result = await uploadFile(file);
    if (result.success) {
      setAttachments(prev => [...prev, result.data]);
      showToast(`Đã thêm ${file.name}`, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const removeAttachment = (id) => {
    const attachment = attachments.find(att => att.id === id);
    setAttachments(prev => prev.filter(att => att.id !== id));
    if (attachment) {
      showToast(`Đã xóa ${attachment.name}`, 'success');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <button onClick={onLogout} className="menu-item logout">
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
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
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'} ${message.isError ? 'error-message' : ''}`}
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
                    <p>{message.content}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="message-attachments">
                        {message.attachments.map((file) => (
                          <div key={file.id} className="attachment-preview">
                            {file.type.startsWith('image/') ? (
                              <img src={file.url} alt={file.name} className="attachment-image" />
                            ) : (
                              <div className="attachment-file">
                                <File size={16} />
                                <span>{file.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="message-time">
                    {formatTime(message.timestamp)}
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
      </div>

      {/* Input Area */}
      <div className="input-area">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="attachments-preview">
            {attachments.map((file) => (
              <div key={file.id} className="attachment-item">
                {file.type.startsWith('image/') ? (
                  <img src={file.url} alt={file.name} className="attachment-thumbnail" />
                ) : (
                  <div className="file-attachment">
                    <File size={16} />
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                )}
                <button 
                  className="remove-attachment"
                  onClick={() => removeAttachment(file.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
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
            disabled={loading || (!inputMessage.trim() && attachments.length === 0)}
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
          accept="image/*"
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
    </div>
  );
};

export default Chat;