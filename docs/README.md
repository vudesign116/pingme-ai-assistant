# 🚀 PingMe AI Assistant - Complete Documentation

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [API Documentation](#api-documentation)

## 🎯 Project Overview

**PingMe AI Assistant** là một ứng dụng chat AI hiện đại được xây dựng với React.js và Vite, tối ưu cho mobile-first experience.

### ✨ Features
- 💬 Real-time AI chat interface
- 📱 Mobile-optimized responsive design
- 🔐 Secure authentication system
- 📎 File & image attachment support
- 🔗 Webhook integration
- 🌐 GitHub Pages deployment ready

### 🛠 Tech Stack
- **Frontend**: React 19+ + Vite 7+
- **Styling**: Modern CSS with mobile-first approach
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Deployment**: GitHub Pages
- **Build Tool**: Vite

## ⚡ Quick Start

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
git
```

### Installation
```bash
git clone https://github.com/yourusername/pingme-ai-assistant.git
cd pingme-ai-assistant
npm install
```

### Development
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

### Deployment
```bash
npm run deploy  # Deploy to GitHub Pages
```

## 🔧 Development Setup

### Environment Configuration
1. Fork repository trên GitHub
2. Update `package.json` homepage URL
3. Update `vite.config.js` base path
4. Configure webhook endpoints (nếu cần)

### Project Structure
```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Main page components
├── services/      # API services
├── utils/         # Utility functions
└── styles/        # Global styles
```

## 🚀 Deployment Guide

### GitHub Pages Setup
1. **Repository Configuration**
   - Enable GitHub Pages in repository settings
   - Set source to "GitHub Actions" hoặc "Deploy from branch"

2. **Build Configuration**
   ```bash
   npm run build    # Tạo dist/ folder
   npm run deploy   # Deploy to gh-pages branch
   ```

3. **Custom Domain** (Optional)
   - Add CNAME file to public/ folder
   - Configure DNS records

### Deployment Checklist
- [ ] Repository có base path đúng
- [ ] 404.html được tạo cho SPA routing
- [ ] Safe area CSS cho mobile
- [ ] Environment variables configured
- [ ] Webhook endpoints tested

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. 404 Error khi F5 (Refresh)
**Problem**: SPA routing không hoạt động trên GitHub Pages  
**Solution**: File `404.html` đã được setup để redirect về main app

#### 2. Layout vỡ trên Safari iPhone
**Problem**: Input bị đẩy xuống dưới, phải scroll  
**Solution**: iOS Safari viewport fixes đã được implement

#### 3. Build Errors
**Problem**: Vite build failed  
**Solutions**:
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check for dependency conflicts
npm audit fix
```

#### 4. Deployment Failed
**Problem**: gh-pages deploy error  
**Solutions**:
```bash
# Manual deploy
npm run build
npx gh-pages -d dist

# Check repository permissions
git remote -v
```

### Debug Mode
```bash
npm run dev -- --debug    # Development with debug info
npm run build -- --debug  # Build with debug info
```

## 📡 API Documentation

### Authentication Service
```javascript
// Login
const response = await authService.login(credentials);

// Logout
await authService.logout();
```

### Chat Service
```javascript
// Send message
const response = await chatService.sendMessage(message, attachments);

// Upload file
const fileData = await chatService.uploadFile(file);
```

### Webhook Service
```javascript
// Setup webhook
await webhookService.configure(webhookUrl);

// Send webhook
await webhookService.send(data);
```

## 🔒 Security Considerations
- Validate all user inputs
- Secure API endpoints
- HTTPS only for production
- Rate limiting for API calls
- File upload restrictions

## 📱 Mobile Optimization
- Viewport meta tag configured
- iOS Safari fixes implemented
- Touch-friendly UI elements
- Responsive breakpoints
- PWA ready structure

## 🎨 Customization
- CSS custom properties for theming
- Component-based architecture
- Easy to extend and modify
- Mobile-first responsive design

## 📈 Performance
- Code splitting với Vite
- Optimized bundle size
- Lazy loading components
- Efficient re-renders
- Image optimization

## 🤝 Contributing
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License
MIT License - see LICENSE file for details

---

**Built with ❤️ by PingMe Team**