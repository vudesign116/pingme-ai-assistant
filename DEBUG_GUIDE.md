# 🚨 DEBUGGING: Trang không chạy

## ❌ **Vấn đề: https://vudesign116.github.io/pingme-ai-assistant/ không hiển thị**

## 🔍 **Các nguyên nhân có thể:**

### **1. File index.html không đúng vị trí**
**Kiểm tra:** GitHub repo phải có `index.html` ở ROOT folder
```
pingme-ai-assistant/
├── index.html ← Phải ở đây (không được trong src/ hay dist/)
├── package.json
├── src/
└── ...
```

### **2. vite.config.js base path sai**
**Kiểm tra file vite.config.js:**
```javascript
base: '/pingme-ai-assistant/', // Phải match chính xác tên repo
```

### **3. GitHub Actions build failed**
**Kiểm tra:**
1. Vào repo → **Actions** tab
2. Xem có build nào failed (red X) không
3. Click vào failed build để xem lỗi

### **4. GitHub Pages settings sai**
**Kiểm tra Settings → Pages:**
- Source: Deploy from a branch
- Branch: main
- Folder: / (root) hoặc /docs

### **5. Repo chưa có đủ files**
**Cần có:**
- ✅ index.html (root level)
- ✅ package.json 
- ✅ vite.config.js với base path đúng
- ✅ src/ folder với App.jsx, main.jsx

## 🔧 **Debug Steps:**

### **Step 1: Check GitHub repo structure**
Vào `https://github.com/vudesign116/pingme-ai-assistant` và kiểm tra:
```
Cần có structure:
├── index.html ← Quan trọng nhất
├── package.json
├── vite.config.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
├── public/
└── dist/ (optional)
```

### **Step 2: Check Actions tab**
- Vào Actions → Xem build status
- Nếu có lỗi → Click để xem chi tiết
- Thường là lỗi npm install hoặc build

### **Step 3: Check Pages settings**
- Settings → Pages
- Verify: Source = Deploy from branch, main, / (root)

### **Step 4: Check browser console**
- Mở https://vudesign116.github.io/pingme-ai-assistant/
- Press F12 → Console tab
- Xem có error messages không

## 🎯 **Most Common Issues:**

### **Issue A: Missing index.html in root**
**Fix:** Upload index.html to repository root (not inside folders)

### **Issue B: Wrong base path in vite.config.js**
**Fix:** Update vite.config.js:
```javascript
base: '/pingme-ai-assistant/', // Must match repo name exactly
```

### **Issue C: Build process using src/ instead of dist/**
**Fix:** GitHub Actions should build from src/ and serve dist/

### **Issue D: Case sensitivity**
**Fix:** Repo name must match exactly: `pingme-ai-assistant` not `PingMe-AI-Assistant`

## 🚀 **Quick Fixes:**

### **Fix 1: Ensure index.html is in root**
```
GitHub repo structure:
pingme-ai-assistant/
├── index.html ← Must be here
└── ... (other files)
```

### **Fix 2: Manual HTML page (backup)**
Create simple index.html in root:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PingMe AI Assistant</title>
    <script type="module" crossorigin src="/pingme-ai-assistant/assets/index-[hash].js"></script>
    <link rel="stylesheet" href="/pingme-ai-assistant/assets/index-[hash].css">
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

### **Fix 3: Use dist/ folder**
If src/ approach fails:
1. Settings → Pages → Source: main branch, /dist folder
2. Upload dist/ contents to GitHub

## 📞 **Action Plan:**

1. **Check GitHub repo** - verify index.html in root
2. **Check Actions tab** - look for build errors  
3. **Check vite.config.js** - verify base path
4. **Check browser console** - look for 404 errors
5. **Try dist/ deployment** - alternative approach

---

## 🆘 **If still not working:**

**Simple test:**
1. Create basic index.html in repo root:
```html
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><h1>Hello World</h1></body>
</html>
```
2. If this shows → React app issue
3. If this doesn't show → GitHub Pages issue

**Most likely:** Missing index.html in root or wrong base path! 🎯**