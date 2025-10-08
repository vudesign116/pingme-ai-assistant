/**
 * File Upload Service
 * Handles uploading files to get public URLs while maintaining binary data
 * Supports multiple upload services: GitHub, Cloudinary, ImgBB, etc.
 */

class FileUploadService {
  constructor() {
    // Configuration for different upload services
    this.uploadServices = {
      // Free image hosting services
      imgbb: {
        endpoint: 'https://api.imgbb.com/1/upload',
        key: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', // Demo API key - replace with real one
        supports: ['image/*'],
        maxSize: 32 * 1024 * 1024, // 32MB
        method: 'POST'
      },
      
      // GitHub as file storage (requires token)
      github: {
        endpoint: 'https://api.github.com/repos/vudesign116/file-storage/contents/',
        token: null, // Will be set from environment
        supports: ['*'],
        maxSize: 100 * 1024 * 1024, // 100MB
        method: 'PUT'
      },
      
      // Temporary file sharing services
      tmpfiles: {
        endpoint: 'https://tmpfiles.org/api/v1/upload',
        supports: ['*'],
        maxSize: 100 * 1024 * 1024, // 100MB
        method: 'POST'
      }
    };
    
    // Default service priority
    this.servicePriority = ['imgbb', 'tmpfiles', 'github'];
  }

  /**
   * Upload file and get public URL
   * @param {File} file - File object to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload result with URL and binary data
   */
  async uploadFile(file, options = {}) {
    console.log(`📤 Uploading file: ${file.name} (${file.size} bytes)`);
    
    try {
      // Convert file to binary data first
      const binaryData = await this.fileToBinary(file);
      const base64Data = await this.fileToBase64(file);
      
      // Try to get public URL
      let publicUrl = null;
      let uploadResult = null;
      
      // Try different upload services in priority order
      for (const serviceName of this.servicePriority) {
        try {
          console.log(`🔄 Trying upload service: ${serviceName}`);
          uploadResult = await this.uploadToService(file, serviceName, base64Data);
          if (uploadResult && uploadResult.url) {
            publicUrl = uploadResult.url;
            console.log(`✅ Successfully uploaded to ${serviceName}: ${publicUrl}`);
            break;
          }
        } catch (error) {
          console.warn(`❌ Failed to upload to ${serviceName}:`, error.message);
          continue;
        }
      }
      
      // If no public URL available, create fallback
      if (!publicUrl) {
        console.warn('⚠️ Could not upload to any service, using fallback');
        publicUrl = await this.createFallbackUrl(file, base64Data);
      }
      
      return {
        success: true,
        url: publicUrl,
        binaryData: binaryData,
        base64: base64Data,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadService: uploadResult?.service || 'fallback'
      };
      
    } catch (error) {
      console.error(`💥 Failed to process file ${file.name}:`, error);
      return {
        success: false,
        error: error.message,
        fileName: file.name
      };
    }
  }

  /**
   * Upload to specific service
   */
  async uploadToService(file, serviceName, base64Data) {
    const service = this.uploadServices[serviceName];
    if (!service) {
      throw new Error(`Unknown upload service: ${serviceName}`);
    }
    
    // Check file size
    if (file.size > service.maxSize) {
      throw new Error(`File too large for ${serviceName}: ${file.size} > ${service.maxSize}`);
    }
    
    // Check file type support
    const isSupported = service.supports.some(pattern => {
      if (pattern === '*') return true;
      if (pattern.endsWith('/*')) {
        return file.type.startsWith(pattern.slice(0, -1));
      }
      return file.type === pattern;
    });
    
    if (!isSupported) {
      throw new Error(`File type ${file.type} not supported by ${serviceName}`);
    }
    
    switch (serviceName) {
      case 'imgbb':
        return await this.uploadToImgBB(file, base64Data);
      case 'tmpfiles':
        return await this.uploadToTmpFiles(file);
      case 'github':
        return await this.uploadToGitHub(file, base64Data);
      default:
        throw new Error(`Upload method not implemented for: ${serviceName}`);
    }
  }

  /**
   * Upload to ImgBB (free image hosting)
   */
  async uploadToImgBB(file, base64Data) {
    const service = this.uploadServices.imgbb;
    const formData = new FormData();
    
    formData.append('key', service.key);
    formData.append('image', base64Data.split(',')[1]); // Remove data:image/...;base64, prefix
    formData.append('name', file.name);
    
    const response = await fetch(service.endpoint, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`ImgBB upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(`ImgBB API error: ${result.error?.message || 'Unknown error'}`);
    }
    
    return {
      url: result.data.url,
      service: 'imgbb',
      deleteUrl: result.data.delete_url
    };
  }

  /**
   * Upload to TmpFiles (temporary file sharing)
   */
  async uploadToTmpFiles(file) {
    const service = this.uploadServices.tmpfiles;
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(service.endpoint, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`TmpFiles upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.data?.url) {
      throw new Error('TmpFiles did not return URL');
    }
    
    return {
      url: result.data.url,
      service: 'tmpfiles'
    };
  }

  /**
   * Upload to GitHub (requires token)
   */
  async uploadToGitHub(file, base64Data) {
    const service = this.uploadServices.github;
    if (!service.token) {
      throw new Error('GitHub token not configured');
    }
    
    const fileName = `uploads/${Date.now()}-${file.name}`;
    const endpoint = service.endpoint + fileName;
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${service.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Upload ${file.name}`,
        content: base64Data.split(',')[1], // Remove data prefix
        branch: 'main'
      })
    });
    
    if (!response.ok) {
      throw new Error(`GitHub upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      url: result.content.download_url,
      service: 'github',
      sha: result.content.sha
    };
  }

  /**
   * Create fallback URL (data URL or blob URL)
   */
  async createFallbackUrl(file, base64Data) {
    // For small files, use data URL
    if (file.size < 1024 * 1024) { // < 1MB
      return base64Data;
    }
    
    // For larger files, create blob URL (note: this won't work for external access)
    try {
      return URL.createObjectURL(file);
    } catch (error) {
      console.warn('Could not create blob URL:', error);
      return base64Data; // Fallback to base64
    }
  }

  /**
   * Convert file to binary ArrayBuffer
   */
  async fileToBinary(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file as binary'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convert file to base64 data URL
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file as base64'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Test if a URL is accessible
   */
  async testUrl(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new FileUploadService();