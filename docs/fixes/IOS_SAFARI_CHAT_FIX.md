# Fix lỗi layout trên Safari iPhone - Chat Input Position

## Vấn đề
Trên Safari iPhone, khi focus vào input text trong chat:
- Input bị đẩy xuống dưới màn hình
- Phải scroll xuống để thấy input
- Keyboard che phần input area
- Layout bị vỡ khi keyboard xuất hiện/ẩn

## Nguyên nhân
1. **Viewport Height Issue**: `100vh` trên iOS Safari không tính đúng khi keyboard xuất hiện
2. **Keyboard Behavior**: iOS Safari thay đổi viewport height khi keyboard show/hide
3. **Fixed Positioning**: Position fixed không hoạt động tốt với virtual keyboard
4. **Safe Area**: Cần xử lý safe area cho iPhone có notch

## Giải pháp đã triển khai

### 1. CSS Viewport Fixes
```css
.chat-container {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height */
  height: calc(var(--vh, 1vh) * 100); /* JavaScript fallback */
}
```

### 2. iOS-specific CSS
```css
@supports (-webkit-touch-callout: none) {
  .input-area {
    position: fixed;
    bottom: 0;
    z-index: 1000;
    padding-bottom: max(env(safe-area-inset-bottom), 16px);
  }
}
```

### 3. JavaScript Viewport Handler (`iosViewport.js`)
- Tính toán viewport height thực tế
- Xử lý resize events khi keyboard show/hide  
- Auto-scroll input vào view khi focus
- Prevent body scroll khi chat active

### 4. Input Optimization
```css
.message-input {
  font-size: 16px !important; /* Prevent zoom on iOS */
  -webkit-appearance: none;
  appearance: none;
}
```

### 5. Safe Area Support
```css
padding-bottom: calc(16px + env(safe-area-inset-bottom));
```

## Các tính năng đã cải thiện

### ✅ **Viewport Handling**
- Dynamic viewport height (`100dvh`)
- JavaScript fallback với custom property `--vh`
- iOS Safari `-webkit-fill-available` support

### ✅ **Keyboard Behavior**
- Input area sticky positioning
- Auto-scroll input into view on focus
- Smooth transition khi keyboard xuất hiện/ẩn
- Prevent zoom on input focus

### ✅ **Layout Stability**
- Fixed input area không bị keyboard đẩy
- Messages container có padding phù hợp
- Safe area inset support cho iPhone có notch

### ✅ **Touch Experience**
- Prevent accidental body scroll
- Smooth animations
- Proper touch targets

## Test Cases

### iPhone Safari
1. ✅ Mở chat → Input hiển thị đúng vị trí
2. ✅ Tap vào input → Không bị zoom, keyboard smooth
3. ✅ Nhập text → Input không bị che bởi keyboard
4. ✅ Gửi tin nhắn → Layout ổn định
5. ✅ Xoay màn hình → Layout responsive
6. ✅ iPhone có notch → Safe area được xử lý

### Android Chrome (Fallback)
- Vẫn hoạt động bình thường với CSS fallbacks

## Deployment
```bash
npm run build
npm run deploy
```

## Performance Impact
- Minimal JavaScript overhead
- CSS-first approach với JavaScript enhancement
- Event listeners được cleanup properly
- No layout thrashing

## Browser Support
- ✅ iOS Safari 12+
- ✅ iOS WebView
- ✅ iPhone/iPad Safari
- ✅ Android Chrome (fallback)
- ✅ Desktop browsers (không ảnh hưởng)