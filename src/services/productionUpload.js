/**
 * Production File Upload Service
 * For production deployment without CORS issues
 * Uses alternative methods that work with GitHub Pages
 */

class ProductionUploadService {
  constructor() {
    // Use services that work with direct upload from browser
    this.services = {
      // Imgur API - supports CORS
      imgur: {
        endpoint: 'https://api.imgur.com/3/upload',
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 546c25a59c58ad7' // Anonymous upload
        },
        maxSize: 10 * 1024 * 1024 // 10MB
      },
      
      // Tmpfiles.org - Simple anonymous upload
      tmpfiles: {
        endpoint: 'https://tmpfiles.org/api/v1/upload',
        method: 'POST',
        maxSize: 100 * 1024 * 1024 // 100MB
      }
    };
  }

  /**
   * Upload file for production environment
   * @param {File} file - File to upload
   * @returns {Promise<Object>} - Upload result with HTTP URL
   */
  async uploadFile(file) {
    console.log(`🚀 Production upload: ${file.name} (${file.size} bytes)`);
    
    // Try Imgur first for images
    if (file.type.startsWith('image/')) {
      try {
        console.log('📷 Trying Imgur for image upload...');
        const result = await this.uploadToImgur(file);
        if (result && result.url) {
          console.log(`✅ Imgur success: ${result.url}`);
          return {
            success: true,
            url: result.url,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadService: 'imgur'
          };
        }
      } catch (error) {
        console.warn('❌ Imgur failed:', error.message);
      }
    }

    // Try tmpfiles for any file type
    try {
      console.log('📁 Trying tmpfiles for general upload...');
      const result = await this.uploadToTmpfiles(file);
      if (result && result.url) {
        console.log(`✅ Tmpfiles success: ${result.url}`);
        return {
          success: true,
          url: result.url,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadService: 'tmpfiles'
        };
      }
    } catch (error) {
      console.warn('❌ Tmpfiles failed:', error.message);
    }

    // If all fails, return base64 as fallback
    console.log('🔄 Fallback to base64 data URL...');
    try {
      const base64Result = await this.createBase64Fallback(file);
      return {
        success: true,
        url: base64Result.dataUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadService: 'base64-fallback'
      };
    } catch (error) {
      throw new Error('All upload methods failed including base64 fallback');
    }
  }

  /**
   * Upload to Imgur (images only)
   */
  async uploadToImgur(file) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'file');

    const response = await fetch('https://api.imgur.com/3/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7'
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Imgur upload failed: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success || !result.data || !result.data.link) {
      throw new Error('Imgur did not return valid response');
    }

    return {
      url: result.data.link,
      service: 'imgur'
    };
  }

  /**
   * Upload to tmpfiles.org
   */
  async uploadToTmpfiles(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Tmpfiles upload failed: ${response.status}`);
    }

    const result = await response.json();
    if (!result.status === 'success' || !result.data || !result.data.url) {
      throw new Error('Tmpfiles did not return valid response');
    }

    return {
      url: result.data.url,
      service: 'tmpfiles'
    };
  }

  /**
   * Create base64 data URL as ultimate fallback
   */
  async createBase64Fallback(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result,
          service: 'base64'
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file as base64'));
      reader.readAsDataURL(file);
    });
  }
}

// Export singleton instance
export default new ProductionUploadService();