/**
 * Smart File Upload Service
 * Auto-detects environment and uses appropriate upload method
 */

import productionUpload from './productionUpload.js';

class FileUploadService {
  constructor() {
    // Configuration for working upload services
    this.services = {
      // Free.keep.sh - Simple file hosting
      freekeep: {
        endpoint: 'https://free.keep.sh',
        method: 'POST',
        maxSize: 500 * 1024 * 1024 // 500MB
      },
      
      // Catbox.moe - Reliable file hosting
      catbox: {
        endpoint: 'https://catbox.moe/user/api.php',
        method: 'POST', 
        maxSize: 200 * 1024 * 1024 // 200MB
      },
      
      // 0x0.st - Anonymous file hosting
      zerobin: {
        endpoint: 'https://0x0.st',
        method: 'POST',
        maxSize: 512 * 1024 * 1024 // 512MB
      }
    };
    
    // Try services in order of reliability
    this.servicePriority = ['catbox', 'freekeep', 'zerobin'];
  }

  /**
   * Upload file and get public HTTP/HTTPS URL
   * @param {File} file - File object to upload
   * @returns {Promise<Object>} - Upload result with URL
   */
  async uploadFile(file) {
    console.log(`📤 Uploading file: ${file.name} (${file.size} bytes)`);
    
    // For localhost development, try proxy server first
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🏠 Localhost detected - trying proxy server first');
      try {
        return await this.uploadViaProxy(file);
      } catch (error) {
        console.warn('❌ Proxy upload failed, falling back to base64:', error.message);
        // Fallback to base64 conversion
        return await this.convertToBase64(file);
      }
    }
    
    // For production, use base64 conversion (temporary CORS workaround)
    console.log('🌍 Production environment - using base64 conversion (CORS workaround)');
    return await this.convertToBase64(file);
  }  /**
   * Upload via proxy server to get real HTTP URLs on localhost
   * This bypasses CORS issues and returns actual HTTP/HTTPS URLs
   */
  async uploadViaProxy(file) {
    try {
      const PROXY_URL = 'http://localhost:3001/upload';
      
      const formData = new FormData();
      formData.append('file', file);
      
      console.log(`🔄 Uploading via proxy server to ${PROXY_URL}...`);
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        body: formData
      });
      
      console.log(`📡 Proxy response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Proxy error response:', errorText);
        throw new Error(`Proxy upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('📦 Proxy result:', result);
      
      if (!result.success || !result.url) {
        throw new Error('Proxy upload failed: No URL returned');
      }
      
      console.log(`✅ Successfully uploaded via proxy: ${result.url}`);
      return {
        success: true,
        url: result.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadService: 'proxy'
      };
      
    } catch (error) {
      console.error('❌ Proxy upload failed:', error.message);
      throw error;
    }
  }

  /**
   * Upload to specific service
   */
  async uploadToService(file, serviceName) {
    switch (serviceName) {
      case 'catbox':
        return await this.uploadToCatbox(file);
      case 'freekeep':
        return await this.uploadToFreeKeep(file);
      case 'zerobin':
        return await this.uploadToZeroBin(file);
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }

  /**
   * Upload to Catbox.moe
   */
  async uploadToCatbox(file) {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);
    
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Catbox upload failed: ${response.status}`);
    }
    
    const result = await response.text();
    if (!result || !result.startsWith('http')) {
      throw new Error('Catbox did not return valid URL');
    }
    
    return {
      url: result.trim(),
      service: 'catbox'
    };
  }

  /**
   * Upload to Free.keep.sh
   */
  async uploadToFreeKeep(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://free.keep.sh', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`FreeKeep upload failed: ${response.status}`);
    }
    
    const result = await response.text();
    if (!result || !result.startsWith('http')) {
      throw new Error('FreeKeep did not return valid URL');
    }
    
    return {
      url: result.trim(),
      service: 'freekeep'
    };
  }

  /**
   * Upload to 0x0.st
   */
  async uploadToZeroBin(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://0x0.st', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`0x0.st upload failed: ${response.status}`);
    }
    
    const result = await response.text();
    if (!result || !result.startsWith('http')) {
      throw new Error('0x0.st did not return valid URL');
    }
    
    return {
      url: result.trim(),
      service: '0x0.st'
    };
  }

  /**
   * Convert file to base64 data URL (fallback for CORS issues)
   * @param {File} file - File to convert
   * @returns {Promise<Object>} - Result with data URL
   */
  async convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        console.log(`✅ Successfully converted ${file.name} to base64`);
        resolve({
          success: true,
          url: e.target.result, // data:image/png;base64,... format
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadService: 'base64'
        });
      };
      
      reader.onerror = function(error) {
        console.error('❌ Base64 conversion failed:', error);
        reject(new Error('Failed to convert file to base64'));
      };
      
      reader.readAsDataURL(file);
    });
  }
}

export default new FileUploadService();