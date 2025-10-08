/**
 * Simple File Upload Service
 * Upload files to public storage and return HTTP/HTTPS URLs
 * No base64 processing - just direct file upload and URL return
 */

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
    
    // For localhost development, use proxy server to get real HTTP URLs
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🏠 Localhost detected - using proxy server for real HTTP URLs');
      return this.uploadViaProxy(file);
    }
    
    // For production, try external services directly
    for (const serviceName of this.servicePriority) {
      try {
        console.log(`🔄 Trying upload service: ${serviceName}`);
        const result = await this.uploadToService(file, serviceName);
        
        if (result && result.url && result.url.startsWith('http')) {
          console.log(`✅ Successfully uploaded to ${serviceName}: ${result.url}`);
          return {
            success: true,
            url: result.url,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadService: serviceName
          };
        }
      } catch (error) {
        console.warn(`❌ Failed to upload to ${serviceName}:`, error.message);
        continue;
      }
    }
    
    // If all services fail, throw error
    throw new Error('All upload services failed');
  }

  /**
   * Upload via proxy server to get real HTTP URLs on localhost
   * This bypasses CORS issues and returns actual HTTP/HTTPS URLs
   */
  async uploadViaProxy(file) {
    try {
      const PROXY_URL = 'http://localhost:3001/upload';
      
      const formData = new FormData();
      formData.append('file', file);
      
      console.log(`🔄 Uploading via proxy server...`);
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Proxy upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.url) {
        throw new Error('Proxy upload failed: No URL returned');
      }
      
      console.log(`✅ Successfully uploaded via proxy: ${result.url}`);
      return result;
      
    } catch (error) {
      console.error('❌ Proxy upload failed:', error.message);
      throw new Error(`Failed to upload via proxy: ${error.message}`);
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
}

export default new FileUploadService();