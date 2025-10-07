# 🚀 Deployment Guide

## GitHub Pages Deployment

### Automatic Deployment
```bash
npm run build   # Build project
npm run deploy  # Deploy to GitHub Pages
```

### Manual Deployment
```bash
# Build project
npm run build

# Deploy using gh-pages
npx gh-pages -d dist
```

### Configuration
- **Base Path**: `/pingme-ai-assistant/` (matches repository name)
- **404 Handling**: `public/404.html` redirects to main app
- **Safe Area**: iOS Safari viewport fixes included

## Deployment Checklist
- [ ] Repository name matches base path
- [ ] GitHub Pages enabled in settings
- [ ] 404.html exists for SPA routing
- [ ] Build completes without errors
- [ ] Mobile layout tested on iOS Safari
- [ ] All routes accessible after refresh

## Environment Setup
1. Update `package.json` homepage URL
2. Configure `vite.config.js` base path
3. Test build locally with `npm run build`
4. Deploy with `npm run deploy`

## Troubleshooting
- **404 on refresh**: Check 404.html and SPA redirect setup
- **CSS not loading**: Verify base path in vite.config.js
- **Deploy failed**: Check repository permissions and gh-pages branch