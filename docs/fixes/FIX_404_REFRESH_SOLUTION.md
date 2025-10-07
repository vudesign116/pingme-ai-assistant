# Giải pháp khắc phục lỗi 404 khi F5 (Refresh) trên GitHub Pages

## Vấn đề
Khi deploy Single Page Application (SPA) lên GitHub Pages, việc refresh trang (F5) hoặc truy cập trực tiếp vào các route khác ngoài root sẽ gây lỗi 404. Điều này xảy ra vì GitHub Pages không biết cách xử lý client-side routing.

## Giải pháp đã triển khai

### 1. Tạo file `public/404.html`
File này sẽ redirect tất cả các request 404 về trang chính với query parameters chứa thông tin route gốc.

### 2. Cập nhật `index.html`
Thêm script xử lý redirect từ query parameters về URL đúng khi app load.

### 3. Cập nhật script build
Thêm command copy file 404.html vào thư mục dist sau khi build.

## Cách hoạt động

1. Khi user truy cập `https://yourusername.github.io/pingme-ai-assistant/chat` trực tiếp
2. GitHub Pages không tìm thấy file `chat` → trả về 404
3. File `404.html` được load và redirect về `https://yourusername.github.io/pingme-ai-assistant/?/chat`
4. Script trong `index.html` chuyển đổi `?/chat` thành `/chat` trong browser history
5. React Router nhận route `/chat` và render đúng component

## Cách deploy

```bash
# Build dự án (file 404.html sẽ được copy tự động)
npm run build

# Deploy lên GitHub Pages
npm run deploy
```

## Lưu ý quan trọng

- Giải pháp này chỉ hoạt động với GitHub Pages (Project Pages)
- Cấu hình `pathSegmentsToKeep = 1` trong 404.html phù hợp với repo path `/pingme-ai-assistant/`
- Đảm bảo `basename="/pingme-ai-assistant"` trong React Router khớp với tên repo

## Test giải pháp

1. Deploy lên GitHub Pages
2. Truy cập trang chính
3. Navigate đến `/chat`
4. F5 refresh → trang vẫn hoạt động bình thường
5. Copy URL và mở tab mới → vẫn hoạt động

## Tài liệu tham khảo
- [SPA GitHub Pages](https://github.com/rafgraph/spa-github-pages)
- [GitHub Pages routing](https://docs.github.com/en/pages)