import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  BarChart3, 
  X,
  FileText,
  MessageCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import './ChatHistoryManager.css';

const ChatHistoryManager = ({ isVisible, onClose, chatStats, onClearChat, onExportHistory, onImportHistory }) => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const result = await onImportHistory(file);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Có lỗi xảy ra khi import file'
      });
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat? Hành động này không thể hoàn tác.')) {
      onClearChat();
      setImportResult({
        success: true,
        message: 'Đã xóa toàn bộ lịch sử chat'
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (!isVisible) return null;

  return (
    <div className="chat-history-overlay">
      <div className="chat-history-manager">
        <div className="chat-history-header">
          <h3>📚 Quản Lý Lịch Sử Chat</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="chat-history-content">
          {/* Statistics */}
          <div className="chat-stats">
            <h4><BarChart3 size={18} /> Thống Kê</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <MessageCircle size={16} />
                <div>
                  <span className="stat-value">{chatStats?.totalMessages || 0}</span>
                  <span className="stat-label">Tổng tin nhắn</span>
                </div>
              </div>
              
              <div className="stat-item">
                <FileText size={16} />
                <div>
                  <span className="stat-value">{chatStats?.userMessages || 0}</span>
                  <span className="stat-label">Tin nhắn của bạn</span>
                </div>
              </div>
              
              <div className="stat-item">
                <MessageCircle size={16} />
                <div>
                  <span className="stat-value">{chatStats?.aiMessages || 0}</span>
                  <span className="stat-label">Phản hồi AI</span>
                </div>
              </div>
              
              <div className="stat-item">
                <HardDrive size={16} />
                <div>
                  <span className="stat-value">{formatFileSize(chatStats?.storageSize || 0)}</span>
                  <span className="stat-label">Dung lượng</span>
                </div>
              </div>
            </div>
            
            {chatStats?.oldestMessage && (
              <div className="date-info">
                <Clock size={14} />
                <span>Từ {formatDate(chatStats.oldestMessage)} đến {formatDate(chatStats.newestMessage)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="chat-actions">
            <h4>🛠️ Thao Tác</h4>
            
            <div className="action-buttons">
              <button 
                onClick={onExportHistory}
                className="action-btn export"
                disabled={!chatStats?.totalMessages}
              >
                <Download size={16} />
                Export Lịch Sử
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="action-btn import"
                disabled={importing}
              >
                <Upload size={16} />
                {importing ? 'Đang Import...' : 'Import Lịch Sử'}
              </button>
              
              <button 
                onClick={handleClearChat}
                className="action-btn clear"
                disabled={!chatStats?.totalMessages}
              >
                <Trash2 size={16} />
                Xóa Lịch Sử
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
          </div>

          {/* Result Message */}
          {importResult && (
            <div className={`result-message ${importResult.success ? 'success' : 'error'}`}>
              {importResult.success ? '✅' : '❌'} {importResult.message}
            </div>
          )}

          {/* Instructions */}
          <div className="instructions">
            <h4>💡 Hướng Dẫn</h4>
            <ul>
              <li><strong>Export:</strong> Tải xuống file backup lịch sử chat (.json)</li>
              <li><strong>Import:</strong> Khôi phục lịch sử từ file backup</li>
              <li><strong>Xóa:</strong> Xóa toàn bộ lịch sử chat khỏi thiết bị</li>
              <li><strong>Tự động lưu:</strong> Tin nhắn được lưu tự động, giữ được 30 ngày</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryManager;