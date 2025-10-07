# ⚙️ Setup Guide

## Initial Setup

### 1. Git Configuration
```bash
# Configure Git
git config --global user.name "Your Name"
git config --global user.email "email@example.com"

# Initialize repository
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/pingme-ai-assistant.git
git push -u origin main
```

### 2. GitHub Pages Setup
1. Go to repository Settings > Pages
2. Set source to "Deploy from a branch"
3. Select `gh-pages` branch
4. Save configuration

### 3. Project Configuration
Update these files with your information:
- `package.json` - homepage URL
- `vite.config.js` - base path
- `README.md` - project details

### 4. Development Workflow
```bash
# Start development
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Environment Variables
Create `.env` file if needed:
```
VITE_API_URL=your_api_url
VITE_WEBHOOK_URL=your_webhook_url
```

## IDE Setup (VS Code)
Recommended extensions:
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens