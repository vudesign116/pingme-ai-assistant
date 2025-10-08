/**
 * File Upload Service
 * Handles uploading files to get public URLs while maintaining binary data
 * Supports multiple upload services: GitHub, Cloudinary, ImgBB, etc.
 */

class FileUploadService {
  constructor() {
    // Configuration for different upload services
    this.uploadServices = {
      // Free image hosting services - BEST for direct access
      imgbb: {
        endpoint: 'https://api.imgbb.com/1/upload',
        key: '7dca36c81c1eb5b5e4419b7e8f5f6e8e', // Free ImgBB API key (real but demo)
        supports: ['image/*'],
        maxSize: 32 * 1024 * 1024, // 32MB
        method: 'POST'
      },
      
      // PostImages - Free image hosting with direct URLs
      postimages: {
        endpoint: 'https://postimages.org/json/rr',
        supports: ['image/*'],
        maxSize: 24 * 1024 * 1024, // 24MB
        method: 'POST'
      },
      
      // ImageBB alternative with different endpoint
      freeimage: {
        endpoint: 'https://freeimage.host/api/1/upload',
        key: 'your-freeimage-key', // Free service
        supports: ['image/*'],
        maxSize: 16 * 1024 * 1024, // 16MB
        method: 'POST'
      },
      
      // ImgBB alternative - Imgur (requires API key)
      imgur: {
        endpoint: 'https://api.imgur.com/3/image',
        clientId: 'your-imgur-client-id', // Need to set real client ID
        supports: ['image/*'],
        maxSize: 10 * 1024 * 1024, // 10MB
        method: 'POST'
      },
      
      // GitHub as file storage (requires token) - Most reliable
      github: {
        endpoint: 'https://api.github.com/repos/vudesign116/file-storage/contents/',
        token: null, // Will be set from environment
        supports: ['*'],
        maxSize: 100 * 1024 * 1024, // 100MB
        method: 'PUT'
      },
      
      // Temporary file sharing services (problematic URLs)
      tmpfiles: {
        endpoint: 'https://tmpfiles.org/api/v1/upload',
        supports: ['*'],
        maxSize: 100 * 1024 * 1024, // 100MB
        method: 'POST'
      }
    };
    
    // Priority: Reliable services first, problematic ones last
    this.servicePriority = ['imgbb', 'postimages', 'github', 'imgur', 'tmpfiles'];
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
        const fallbackResult = await this.createFallbackUrl(file, base64Data);
        publicUrl = fallbackResult.url;
        uploadResult = {
          service: fallbackResult.service,
          warning: fallbackResult.warning
        };
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
      case 'postimages':
        return await this.uploadToPostImages(file, base64Data);
      case 'imgur':
        return await this.uploadToImgur(file, base64Data);
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
   * Upload to PostImages (free image hosting with direct URLs)
   */
  async uploadToPostImages(file, base64Data) {
    const formData = new FormData();
    
    // PostImages expects file directly
    formData.append('upload', file);
    formData.append('optsize', '0'); // Original size
    formData.append('expire', '0'); // Never expire
    
    const response = await fetch('https://postimages.org/json/rr', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`PostImages upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.url) {
      throw new Error('PostImages did not return URL');
    }
    
    return {
      url: result.url, // Direct image URL
      service: 'postimages',
      directUrl: result.url
    };
  }

  /**
   * Upload to Imgur (requires client ID)
   */
  async uploadToImgur(file, base64Data) {
    const service = this.uploadServices.imgur;
    
    const response = await fetch(service.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${service.clientId}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Data.split(',')[1], // Remove data prefix
        type: 'base64',
        name: file.name,
        title: file.name
      })
    });
    
    if (!response.ok) {
      throw new Error(`Imgur upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(`Imgur API error: ${result.data?.error || 'Unknown error'}`);
    }
    
    return {
      url: result.data.link, // Direct image URL
      service: 'imgur',
      deleteHash: result.data.deletehash
    };
  }

  /**
   * Upload to TmpFiles (temporary file sharing) - URLs may be problematic
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
    
    // TmpFiles URLs are often encoded/protected - try to convert to direct URL
    let directUrl = result.data.url;
    
    // Convert tmpfiles.org/123456/file.ext to direct download format
    const tmpFilesMatch = directUrl.match(/tmpfiles\.org\/(\d+)\//);
    if (tmpFilesMatch) {
      // Try direct download format
      directUrl = directUrl.replace('/tmpfiles.org/', '/dl.tmpfiles.org/');
      console.log(`🔄 TmpFiles URL converted: ${result.data.url} → ${directUrl}`);
    }
    
    return {
      url: directUrl,
      originalUrl: result.data.url,
      service: 'tmpfiles',
      warning: 'TmpFiles URLs may not be directly accessible by external services'
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
   * Create fallback URL (data URL for external access)
   */
  async createFallbackUrl(file, base64Data) {
    console.warn('⚠️ All upload services failed, using fallback strategy');
    
    // For images under 1MB, use data URL (externally accessible)
    if (file.type.startsWith('image/') && file.size < 1024 * 1024) {
      console.log(`📄 Using data URL for small image: ${file.name} (${file.size} bytes)`);
      return {
        url: base64Data,
        service: 'data-url',
        warning: 'Using data URL - may have size limitations in some contexts'
      };
    }
    
    // For larger files or non-images, still provide data URL but with warning
    console.warn(`📄 Using data URL for large file: ${file.name} (${file.size} bytes) - may cause issues`);
    return {
      url: base64Data,
      service: 'data-url',
      warning: 'Large data URL - may cause performance issues or size limitations'
    };
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