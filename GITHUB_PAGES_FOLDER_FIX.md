# 🔧 GitHub Pages Folder Limitation Fix

## ❌ **GitHub Pages Limitation:**
GitHub Pages chỉ cho phép deploy từ:
- **/ (root)** - Toàn bộ repository root
- **/docs** - Docs folder only
- **KHÔNG có /dist option!**

## ✅ **2 Solutions:**

### **Solution 1: Copy dist/ contents to root (Recommended)**

**Cách này:** Copy tất cả files từ `dist/` lên repository root

**Trên máy:**
```bash
# Files trong dist/ folder:
pingme-upload/dist/
├── index.html ← Production HTML
├── vite.svg
└── assets/
    ├── index-[hash].css
    ├── index-[hash].js
    ├── vendor-[hash].js
    └── ...
```

**Upload lên GitHub root:**
```
pingme-ai-assistant/ (root)
├── index.html ← From dist/
├── vite.svg ← From dist/
├── assets/ ← From dist/
│   ├── index-[hash].css
│   ├── index-[hash].js
│   └── ...
├── package.json ← Keep for GitHub Actions
├── src/ ← Keep source code
└── ... (other files)
```

### **Solution 2: Use /docs folder**

**Cách này:** Rename dist/ thành docs/ và upload

1. **Rename `dist/` folder → `docs/`**
2. **Upload docs/ folder** to GitHub repo
3. **Settings → Pages → Folder: /docs**

## 🚀 **Recommended: Solution 1**

### **Step-by-step:**

1. **Upload these files to GitHub repo ROOT:**
   - Copy `index.html` from `pingme-upload/dist/` → repo root
   - Copy `assets/` folder from `pingme-upload/dist/` → repo root  
   - Copy `vite.svg` from `pingme-upload/dist/` → repo root

2. **Keep existing files:**
   - Keep `package.json`, `src/`, etc. for development

3. **Final GitHub repo structure:**
   ```
   pingme-ai-assistant/
   ├── index.html ← Production (from dist/)
   ├── vite.svg ← From dist/
   ├── assets/ ← From dist/ (production bundles)
   ├── package.json ← Keep for Actions
   ├── src/ ← Keep source
   ├── public/ ← Keep source
   └── ... (other dev files)
   ```

4. **Pages settings:**
   - Source: Deploy from branch
   - Branch: main
   - Folder: / (root)

## 🔍 **Why This Works:**

- **index.html** (from dist/) có correct paths: `/pingme-ai-assistant/assets/...`
- **assets/** folder chứa all built JS/CSS files
- **GitHub Pages** serve từ root với correct structure
- **Development files** still available for future updates

## 📁 **Files to Upload from dist/:**

**From your machine `pingme-upload/dist/`:**
```bash
# Check content:
ls -la /Users/anhvu/Documents/it project/pingme-upload/dist/

# Should show:
assets/        ← Upload this folder to repo root
index.html     ← Upload this file to repo root  
vite.svg       ← Upload this file to repo root
```

## ⚡ **Quick Action:**

1. **Delete current index.html** from GitHub repo (if exists)
2. **Upload from `pingme-upload/dist/`:**
   - `index.html` → repo root
   - `assets/` folder → repo root
   - `vite.svg` → repo root
3. **Keep all other files** (src/, package.json, etc.)
4. **Test URL** - should work!

---

## 🎯 **Expected Result:**

After upload:
- ✅ **No more 404 errors** for /src/main.jsx
- ✅ **Assets load** from /pingme-ai-assistant/assets/
- ✅ **Login page appears**
- ✅ **All features work**

**🚀 Copy production files from dist/ to GitHub repo root! 📤**