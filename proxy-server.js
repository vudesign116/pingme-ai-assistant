/**
 * Simple Proxy Server for File Upload
 * Handles CORS issues by uploading files server-side
 * Returns real HTTP/HTTPS URLs instead of data URLs
 */

import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors());

// Configure multer for handling file uploads
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

/**
 * Upload to Catbox.moe - Most reliable service
 */
async function uploadToCatbox(fileBuffer, filename) {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', fileBuffer, filename);

  const response = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Catbox upload failed: ${response.status}`);
  }

  const url = await response.text();
  return url.trim();
}

/**
 * Upload to 0x0.st - Alternative service
 */
async function uploadToZeroBin(fileBuffer, filename) {
  const formData = new FormData();
  formData.append('file', fileBuffer, filename);

  const response = await fetch('https://0x0.st', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`0x0.st upload failed: ${response.status}`);
  }

  const url = await response.text();
  return url.trim();
}

/**
 * Upload to file.io - Temporary file hosting
 */
async function uploadToFileIO(fileBuffer, filename) {
  const formData = new FormData();
  formData.append('file', fileBuffer, filename);

  const response = await fetch('https://file.io', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`File.io upload failed: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error('File.io upload failed');
  }

  return result.link;
}

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, originalname, mimetype, size } = req.file;
    console.log(`📤 Uploading file: ${originalname} (${size} bytes)`);

    // Try different upload services in order
    const services = [
      { name: 'catbox', fn: uploadToCatbox },
      { name: 'zerobin', fn: uploadToZeroBin },
      { name: 'fileio', fn: uploadToFileIO }
    ];

    let lastError;
    for (const service of services) {
      try {
        console.log(`🔄 Trying ${service.name}...`);
        const url = await service.fn(buffer, originalname);
        
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          console.log(`✅ Success with ${service.name}: ${url}`);
          
          return res.json({
            success: true,
            url: url,
            fileName: originalname,
            fileSize: size,
            fileType: mimetype,
            uploadService: service.name
          });
        }
      } catch (error) {
        console.warn(`❌ ${service.name} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    // If all services fail
    throw new Error(`All upload services failed. Last error: ${lastError?.message}`);

  } catch (error) {
    console.error('💥 Upload error:', error.message);
    res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'File upload proxy server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 File upload proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Upload endpoint: http://localhost:${PORT}/upload`);
  console.log(`💡 This server handles CORS and returns real HTTP URLs`);
});