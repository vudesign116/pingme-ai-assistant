import { webhookService, sendFileUrlToWebhook } from './webhookService';
import simpleFileUpload from './simpleFileUpload.js';

export const chatService = {
  // Validate file type - chỉ cho phép images, doc, pdf
  validateFileType(file) {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    if (allowedImageTypes.includes(fileType)) {
      return { valid: true, type: 'image', category: 'image' };
    }
    
    if (allowedDocTypes.includes(fileType) || 
        fileName.endsWith('.pdf') || 
        fileName.endsWith('.doc') || 
        fileName.endsWith('.docx')) {
      return { valid: true, type: 'document', category: 'document' };
    }
    
    return { 
      valid: false, 
      type: 'unsupported',
      message: 'Chỉ hỗ trợ file hình ảnh (JPG, PNG, GIF, WebP) và tài liệu (PDF, DOC, DOCX)'
    };
  },

  // Upload file và chuyển thành HTTP URL
  async uploadFile(file) {
    try {
      console.log('📁 Starting file upload:', file.name);
      
      const validation = this.validateFileType(file);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      console.log('🌐 Uploading to external service...');
      const uploadResult = await simpleFileUpload.uploadFile(file);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Upload failed');
      }

      console.log('✅ File uploaded successfully:', uploadResult.url);
      
      return {
        success: true,
        url: uploadResult.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: validation.type,
        category: validation.category,
        mimeType: file.type,
        processing: 'http_url',
        message: validation.type === 'image' ? 'Hình ảnh đã được upload thành công' : 'Tài liệu đã được upload thành công'
      };

    } catch (error) {
      console.error('❌ File upload failed:', error);
      return {
        success: false,
        message: error.message || 'Không thể upload file. Vui lòng thử lại.',
        error: error.message
      };
    }
  },

  // Send message to AI với phân loại riêng biệt
  async sendMessage(message, files = [], conversationHistory = []) {
    console.log('📤 Sending message:', message);
    
    try {
      // Trước tiên, gửi URLs của tất cả các file lên webhook (vì người dùng đã bấm nút Send)
      if (files && files.length > 0) {
        console.log('🔄 Sending file URLs to webhook since user clicked Send button...');
        for (const file of files) {
          try {
            const meta = { source: 'web_app', purpose: 'chat_attachment' };
            await sendFileUrlToWebhook(
              file.url, 
              file.fileName || file.name,
              file.fileType || file.type,
              file.fileSize || file.size,
              meta
            );
            console.log(`✅ Notified webhook about file: ${file.url}`);
          } catch (err) {
            console.warn(`⚠️ Could not notify webhook about file ${file.url}:`, err.message);
            // Tiếp tục xử lý các file khác ngay cả khi có lỗi
          }
        }
      }
      
      const imageFiles = files.filter(f => f.category === 'image');
      const documentFiles = files.filter(f => f.category === 'document');
      
      let payload;
      
      if (imageFiles.length > 0 && documentFiles.length === 0) {
        payload = {
          type: 'image_message',
          message: message,
          images: imageFiles.map(f => ({
            url: f.url,
            fileName: f.fileName,
            fileSize: f.fileSize,
            mimeType: f.mimeType
          })),
          timestamp: new Date().toISOString(),
          conversationHistory: conversationHistory
        };
        console.log('🖼️ Sending image message');
        
      } else if (documentFiles.length > 0 && imageFiles.length === 0) {
        payload = {
          type: 'document_message',
          message: message,
          documents: documentFiles.map(f => ({
            url: f.url,
            fileName: f.fileName,
            fileSize: f.fileSize,
            mimeType: f.mimeType
          })),
          timestamp: new Date().toISOString(),
          conversationHistory: conversationHistory
        };
        console.log('📄 Sending document message');
        
      } else if (imageFiles.length > 0 && documentFiles.length > 0) {
        payload = {
          type: 'mixed_message',
          message: message,
          images: imageFiles.map(f => ({
            url: f.url,
            fileName: f.fileName,
            fileSize: f.fileSize,
            mimeType: f.mimeType
          })),
          documents: documentFiles.map(f => ({
            url: f.url,
            fileName: f.fileName,
            fileSize: f.fileSize,
            mimeType: f.mimeType
          })),
          timestamp: new Date().toISOString(),
          conversationHistory: conversationHistory
        };
        console.log('🖼️📄 Sending mixed message');
        
      } else {
        payload = {
          type: 'text_message',
          message: message,
          timestamp: new Date().toISOString(),
          conversationHistory: conversationHistory
        };
        console.log('💬 Sending text message');
      }

      const webhookResult = await webhookService.sendChatMessage(payload);
      
      if (webhookResult.success) {
        console.log('✅ Message sent successfully');
        return {
          success: true,
          response: webhookResult.data?.response || webhookResult.data?.message || 'Tin nhắn đã được gửi thành công.',
          data: webhookResult.data
        };
      } else {
        throw new Error(webhookResult.message || 'Webhook failed');
      }

    } catch (error) {
      console.error('❌ Send message failed:', error);
      return {
        success: false,
        message: 'Không thể gửi tin nhắn. Vui lòng thử lại.',
        error: error.message
      };
    }
  }
};
