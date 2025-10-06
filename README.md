# 🚀 PingMe - AI Assistant Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.1.9-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</div>

> **Modern mobile-first AI assistant platform built with React.js & Vite**

## ✨ Features

### 🔐 **Authentication System**
- **Secure Login**: Employee ID and password authentication
- **Local Authentication**: Temporarily using local accounts (webhook disabled)
- **Session Management**: Automatic logout and session tracking
- **Forgot Password**: Password reset functionality

### 💬 **AI Chat Interface**
- **Real-time Chat**: Seamless conversation with AI assistant
- **File Upload**: Support for images and documents (max 10MB)
- **Attachment Preview**: Image thumbnails and file information
- **Responsive Design**: Optimized for mobile and desktop
- **Toast Notifications**: User feedback for actions

### 📱 **Mobile-First Design**
- **iOS-style UI**: Modern and intuitive interface
- **Touch-friendly**: 44px+ touch targets
- **Responsive Layout**: Adapts to all screen sizes
- **Smooth Animations**: Delightful micro-interactions

### 🔧 **Technical Features**
- **Error Boundary**: Graceful error handling
- **Loading States**: Clear feedback during operations
- **Offline Support**: Works without internet connection
- **Webhook Integration**: Ready for backend integration
- **TypeScript Ready**: Easy migration to TypeScript

## 🏗️ **Project Structure**

```
pingme/
├── public/
│   └── vite.svg
├── src/
│   ├── components/          # Reusable components
│   │   ├── ConnectionStatus.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── WebhookStatus.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useChat.js
│   ├── pages/               # Main pages
│   │   ├── Chat.jsx
│   │   ├── Chat.css
│   │   ├── Login.jsx
│   │   └── Login.css
│   ├── services/            # API services
│   │   ├── authService.js
│   │   ├── chatService.js
│   │   └── webhookService.js
│   ├── App.jsx              # Main app component
│   ├── App.css
│   ├── main.jsx             # App entry point
│   └── styles.css           # Global styles
├── AUTH_WEBHOOK_README.md   # Webhook authentication docs
├── WEBHOOK_README.md        # General webhook docs
└── README.md
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pingme

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 👥 **Demo Accounts**

**Webhook authentication is temporarily disabled. Use these local accounts:**

| Name | Employee ID | Password |
|------|-------------|----------|
| Trần Thiện Toàn | `MR2593` | `abc123` |
| Phạm Nhật Vinh | `MR1674` | `abc123` |

## 🔗 **Webhook Integration**

The app is ready for webhook integration with n8n or any backend system:

**Webhook URL**: `https://kpspa.app.n8n.cloud/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d`

### Supported Events:
- `login_verify` - User authentication
- `chat_message` - AI conversations
- `file_upload` - File attachments
- `user_logout` - Session ending
- `error_log` - Error tracking

See `AUTH_WEBHOOK_README.md` and `WEBHOOK_README.md` for detailed documentation.

## 🎨 **UI/UX Highlights**

- **Modern Design**: iOS-inspired interface with smooth animations
- **Dark/Light Theme**: Automatic theme detection (future feature)
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized rendering and lazy loading
- **PWA Ready**: Can be installed as mobile app

## 🛠️ **Technologies Used**

- **Frontend**: React 18.3.1, React Router DOM
- **Build Tool**: Vite 7.1.9
- **Styling**: Pure CSS with CSS Variables
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Development**: ESLint, Hot Module Replacement

## 📦 **Deployment**

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag `dist/` folder to Netlify deploy
3. Or connect GitHub repo to Netlify

## 🔧 **Environment Variables**

Create `.env` file for production:

```env
VITE_API_URL=https://your-api-url.com
VITE_WEBHOOK_URL=https://your-webhook-url.com
```

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- React team for the amazing framework
- Vite team for the blazing fast build tool
- Lucide for beautiful icons
- n8n for webhook automation platform

## 📞 **Support**

If you have any questions or need help:

- 📧 Email: support@pingme.com
- 💬 Chat: Use the app itself!
- 🐛 Issues: GitHub Issues tab

---

<div align="center">
  <p>Made with ❤️ for better human-AI interaction</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
