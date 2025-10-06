# 📤 Manual Upload Guide - PingMe AI Assistant

## 🎯 **Step-by-Step Manual Upload**

### **Step 1: Create GitHub Repository**

1. **Go to GitHub.com** và đăng nhập
2. **Click green "New" button** (góc trái trên)
3. **Fill repository info:**
   ```
   Repository name: pingme-ai-assistant
   Description: Modern mobile-first AI assistant platform built with React & Vite
   ✅ Public (required for free GitHub Pages)
   ✅ Add a README file
   ✅ Add .gitignore → Choose "Node" template
   ✅ Choose a license → MIT License
   ```
4. **Click "Create repository"**

### **Step 2: Upload All Files**

**🔥 IMPORTANT: Upload these exact files/folders:**

```
📁 Files to upload from your pingme folder:
✅ src/ (entire folder)
✅ public/ (entire folder)  
✅ dist/ (entire folder) ← Production build
✅ .github/ (workflows folder) ← Auto-deploy
✅ README.md
✅ DEPLOYMENT.md
✅ AUTH_WEBHOOK_README.md
✅ WEBHOOK_README.md
✅ DEPLOY_CHECKLIST.md
✅ MANUAL_DEPLOY.md
✅ UPLOAD_GUIDE.md (this file)
✅ LICENSE
✅ package.json
✅ package-lock.json
✅ vite.config.js
✅ eslint.config.js
✅ .gitignore
✅ index.html
```

**🚀 How to upload:**

1. **Click "uploading an existing file"** (blue link)
2. **Drag entire pingme folder** into upload area
3. **OR click "choose your files"** and select all files
4. **Commit message:** `🎉 Initial commit: PingMe AI Assistant Platform`
5. **Click "Commit changes"**

### **Step 3: Enable GitHub Pages**

1. **Go to "Settings"** tab (in your repo)
2. **Scroll down to "Pages"** (left sidebar)
3. **Configure Pages:**
   ```
   Source: Deploy from a branch
   Branch: main (or master)
   Folder: / (root)
   ```
4. **Click "Save"**

### **Step 4: Wait for Deployment**

- ⏱️ **First deploy:** 2-5 minutes
- 🔄 **GitHub Actions** will build automatically
- ✅ **Green checkmark** = deployment successful

### **Step 5: Access Your Live App**

**🌐 Your live URL will be:**
```
https://YOUR_GITHUB_USERNAME.github.io/pingme-ai-assistant/
```

**Example:**
- Username: `john123` 
- URL: `https://john123.github.io/pingme-ai-assistant/`

## 🎯 **Quick Upload Checklist**

- [ ] GitHub repo created with correct name
- [ ] All files uploaded (especially `dist/` folder)
- [ ] GitHub Pages enabled in Settings
- [ ] Wait 2-5 minutes for first build
- [ ] Test live URL

## 📱 **Test Your Live App**

**Login with demo accounts:**
- Employee ID: `MR2593`, Password: `abc123`
- Employee ID: `MR1674`, Password: `abc123`

**Features to test:**
- ✅ Login page responsive on mobile
- ✅ Chat interface works
- ✅ File upload & preview
- ✅ Toast notifications
- ✅ Navigation between pages

## 🆘 **Troubleshooting**

**❌ 404 Error?**
- Check Settings → Pages is enabled
- Ensure `index.html` is in root folder
- Wait 5-10 more minutes

**❌ Blank page?**
- Check if `dist/` folder was uploaded
- Look at browser console for errors
- Verify `vite.config.js` has correct base path

**❌ Build failing?**
- Check Actions tab for error details
- Ensure `package.json` was uploaded
- Verify all dependencies are listed

## 🎉 **Success!**

Once live, you can:
- 📱 **Add to phone home screen** (PWA-like)
- 🔗 **Share URL** with friends/colleagues
- 💼 **Add to portfolio/resume**
- 🚀 **Build upon this foundation**

---

## 📞 **Next Steps After Upload**

1. **Test all features** on live site
2. **Share with team** for feedback
3. **Add custom domain** (optional)
4. **Enable webhook** when backend ready
5. **Add more AI features**

**🎯 Your PingMe AI Assistant is ready to serve the world! 🌍**