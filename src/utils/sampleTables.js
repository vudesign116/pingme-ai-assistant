// Test markdown với table để kiểm tra responsive design

export const sampleTableMarkdown = `
# Bảng thông tin sản phẩm

Dưới đây là bảng thông tin sản phẩm được chuyển đổi từ dữ liệu bạn cung cấp:

| STT | Tên sản phẩm | Mã sản phẩm | Giá bán | Danh mục | Nhà cung cấp | Trạng thái | Ghi chú |
|-----|--------------|-------------|---------|----------|--------------|------------|---------|
| 1 | iPhone 15 Pro Max 256GB | IP15PM256 | 29,990,000 | Điện thoại | Apple Store | Còn hàng | Hàng chính hãng |
| 2 | Samsung Galaxy S24 Ultra | SGS24U | 25,990,000 | Điện thoại | Samsung | Còn hàng | Kèm bút S-Pen |
| 3 | MacBook Air M3 13 inch | MBA13M3 | 32,990,000 | Laptop | Apple Store | Hết hàng | Dự kiến về hàng 15/10 |
| 4 | Dell XPS 13 Plus | DXPS13P | 28,500,000 | Laptop | Dell Official | Còn hàng | Màn hình OLED |
| 5 | AirPods Pro 2nd Gen | APP2 | 5,990,000 | Tai nghe | Apple Store | Còn hàng | Chống ồn chủ động |
| 6 | Sony WH-1000XM5 | SWXM5 | 7,490,000 | Tai nghe | Sony | Còn hàng | Chất lượng âm thanh cao |
| 7 | iPad Pro 12.9 M2 | IPP129M2 | 26,990,000 | Tablet | Apple Store | Còn hàng | Hỗ trợ Apple Pencil |
| 8 | Microsoft Surface Pro 9 | MSP9 | 22,990,000 | Tablet | Microsoft | Sắp hết | Chỉ còn 3 chiếc |

## Thống kê

- **Tổng số sản phẩm**: 8 items
- **Sản phẩm còn hàng**: 6 items  
- **Sản phẩm hết hàng**: 1 item
- **Sản phẩm sắp hết**: 1 item
- **Giá trị tổng**: ~180 triệu VND

## Ghi chú

Bảng này được tối ưu hóa cho:
- ✅ Hiển thị responsive trên mobile
- ✅ Scroll ngang mượt mà
- ✅ Hover để xem nội dung đầy đủ
- ✅ Sticky header và first column
- ✅ Text truncation thông minh
`;

export const simpleTableMarkdown = `
| Tên | Giá | Trạng thái |
|-----|-----|-----------|
| Sản phẩm A | 100,000 | Còn hàng |
| Sản phẩm B | 200,000 | Hết hàng |
| Sản phẩm C | 150,000 | Còn hàng |
`;

export const wideTableMarkdown = `
| STT | Mã SP | Tên sản phẩm | Danh mục | Giá niêm yết | Giá khuyến mãi | Số lượng tồn | Nhà cung cấp | Ngày nhập | Hạn sử dụng | Ghi chú |
|-----|-------|--------------|----------|--------------|----------------|--------------|--------------|-----------|-------------|---------|
| 1 | SP001 | iPhone 15 Pro Max 256GB Natural Titanium | Điện thoại thông minh | 29,990,000₫ | 28,990,000₫ | 25 | Apple Authorized Reseller | 01/10/2024 | N/A | Hàng chính hãng VN/A |
| 2 | SP002 | Samsung Galaxy S24 Ultra 512GB Titanium Black | Điện thoại thông minh | 31,990,000₫ | 29,990,000₫ | 18 | Samsung Electronics Vietnam | 28/09/2024 | N/A | Kèm bút S-Pen và ốp lưng |
| 3 | SP003 | MacBook Pro 16-inch M3 Max 1TB Space Black | Laptop cao cấp | 89,990,000₫ | 85,990,000₫ | 8 | Apple Authorized Reseller | 15/09/2024 | N/A | Bảo hành 12 tháng chính hãng |
`;