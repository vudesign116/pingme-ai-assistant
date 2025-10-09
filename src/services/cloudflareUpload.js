/**
 * CloudFlare Workers Upload Service
 * Bypass CORS issues by using CloudFlare Workers as proxy
 * Returns real HTTP/HTTPS URLs for n8n processing
 */

class CloudFlareUploadService {
  constructor() {
    // CloudFlare Workers endpoint for CORS-free upload
    this.workerUrl = 'https://file-upload-proxy.vudesign116.workers.dev';
    
    // Fallback services in case worker fails
    this.fallbackServices = [
      {
        name: 'imgbb',
        endpoint: 'https://api.imgbb.com/1/upload',
        apiKey: 'temp_key', // You'll need to get this
        method: 'POST'
      }
    ];
  }

  /**
   * Upload file via CloudFlare Workers proxy
   * @param {File} file - File to upload
   * @returns {Promise<Object>} - Upload result with HTTP URL
   */
  async uploadFile(file) {
    console.log(`📤 Uploading ${file.name} via CloudFlare Workers...`);
    
    try {
      // Try CloudFlare Workers first
      return await this.uploadViaWorker(file);
    } catch (error) {
      console.warn('❌ CloudFlare Workers failed:', error.message);
      
      // Fallback to other services
      for (const service of this.fallbackServices) {
        try {
          console.log(`🔄 Trying fallback service: ${service.name}`);
          return await this.uploadViaService(file, service);
        } catch (serviceError) {
          console.warn(`❌ ${service.name} failed:`, serviceError.message);
          continue;
        }
      }
      
      throw new Error('All upload services failed');
    }
  }

  /**
   * Upload via CloudFlare Workers
   */
  async uploadViaWorker(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('service', 'catbox'); // Which service worker should use
    
    const response = await fetch(this.workerUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Worker upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.url) {
      throw new Error('Worker did not return valid URL');
    }
    
    console.log(`✅ Successfully uploaded via CloudFlare Workers: ${result.url}`);
    return {
      success: true,
      url: result.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadService: 'cloudflare-worker'
    };
  }

  /**
   * Upload via fallback service
   */
  async uploadViaService(file, service) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', service.apiKey);
    
    const response = await fetch(service.endpoint, {
      method: service.method,
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`${service.name} upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.data || !result.data.url) {
      throw new Error(`${service.name} did not return valid URL`);
    }
    
    return {
      success: true,
      url: result.data.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadService: service.name
    };
  }
}

export default new CloudFlareUploadService();