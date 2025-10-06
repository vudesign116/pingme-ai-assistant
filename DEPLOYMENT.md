# 🚀 Deployment Guide - PingMe AI Assistant

## 📋 Prerequisites

1. **GitHub Account**: Create account at [github.com](https://github.com)
2. **Git Installed**: Download from [git-scm.com](https://git-scm.com/)
3. **Node.js 16+**: Download from [nodejs.org](https://nodejs.org/)

## 🛠️ Setup Instructions

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click "New repository" button
3. Repository name: `pingme-ai-assistant` (or your preferred name)
4. Description: `Modern mobile-first AI assistant platform`
5. Set to **Public** (for free GitHub Pages)
6. **Don't** initialize with README (we have one)
7. Click "Create repository"

### Step 2: Update Configuration

Update these files with your GitHub username:

**1. `package.json`**
```json
{
  "repository": {
    "url": "https://github.com/YOUR_USERNAME/pingme-ai-assistant.git"
  },
  "homepage": "https://YOUR_USERNAME.github.io/pingme-ai-assistant"
}
```

**2. `vite.config.js`**
```javascript
export default defineConfig({
  base: '/pingme-ai-assistant/', // Your repo name
  // ... rest of config
})
```

### Step 3: Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "🎉 Initial commit: PingMe AI Assistant Platform"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/pingme-ai-assistant.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Source: **Deploy from a branch**
5. Branch: **gh-pages** (will be created automatically)
6. Folder: **/ (root)**
7. Click **Save**

### Step 5: Automatic Deployment

The GitHub Action will automatically:
- ✅ Run on every push to `main` branch
- ✅ Install dependencies
- ✅ Run linting
- ✅ Build the project
- ✅ Deploy to GitHub Pages

**Your app will be live at**: `https://YOUR_USERNAME.github.io/pingme-ai-assistant/`

## 🔧 Manual Deployment Commands

If you prefer manual deployment:

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🌐 Alternative Deployment Options

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Follow prompts

### Deploy to Netlify

1. Build: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag `dist/` folder to deploy area
4. Or connect GitHub repo for auto-deploy

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy
```

## 📱 PWA Deployment (Future)

To make it installable as mobile app:

1. Add manifest.json
2. Add service worker
3. Configure PWA settings
4. Deploy with HTTPS

## 🔒 Environment Variables

For production, create these environment variables:

**GitHub Secrets** (Repository Settings > Secrets):
- `VITE_API_URL`: Your production API URL
- `VITE_WEBHOOK_URL`: Your production webhook URL

**Vercel/Netlify Environment Variables**:
```env
VITE_API_URL=https://your-api.com
VITE_WEBHOOK_URL=https://your-webhook.com
NODE_VERSION=18
```

## 🚨 Troubleshooting

### Common Issues:

**1. 404 Error on GitHub Pages**
- Check `base` path in `vite.config.js`
- Ensure repository name matches

**2. Build Fails**
- Run `npm run lint` to fix linting errors
- Check console for specific errors

**3. Deployment Not Working**
- Check GitHub Actions tab for error logs
- Ensure GitHub Pages is enabled

**4. App Not Loading**
- Check browser console for errors
- Verify all assets are loading correctly

### Debugging Commands:

```bash
# Check build locally
npm run build
npm run preview

# Check for linting errors
npm run lint

# View build output
ls -la dist/
```

## 📊 Monitoring

After deployment, you can monitor:

- **GitHub Actions**: For build/deploy status
- **GitHub Pages**: For hosting status
- **Browser DevTools**: For runtime errors
- **Analytics**: Add Google Analytics if needed

## 🔄 Continuous Deployment

The setup includes:
- ✅ Auto-deploy on `main` branch push
- ✅ PR preview builds
- ✅ Linting checks
- ✅ Build optimization
- ✅ Asset caching

## 📞 Support

If you encounter issues:

1. Check GitHub Actions logs
2. Review this guide
3. Search GitHub Issues
4. Create new issue with details

---

**🎉 Congratulations! Your PingMe AI Assistant is now live on the web!**

Share your deployment URL: `https://YOUR_USERNAME.github.io/pingme-ai-assistant/`