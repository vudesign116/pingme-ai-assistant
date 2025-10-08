# AI Prompt Suggestions - Không sử dụng Markdown Table

## 🚫 Vấn đề với Markdown Table trên Mobile
- Markdown table hiển thị kém trên mobile devices
- Scroll ngang khó sử dụng cho người dùng
- Thông tin bị cắt hoặc overlapping
- Trải nghiệm người dùng kém

## ✅ Thay thế Markdown Table bằng các format khác

### 1. **Danh sách có cấu trúc (Structured Lists)**
Thay vì table, sử dụng danh sách với format rõ ràng:

```markdown
## Danh sách sản phẩm Mecefix - B.E

### 1. Mecefix - B.E 50 mg
- **Quy cách**: Hộp 20 gói
- **Hoạt chất**: Cefixim 50mg  
- **Nhóm sản phẩm**: Kháng sinh
- **Giá**: 150.000 VNĐ

### 2. Mecefix - B.E 75 mg
- **Quy cách**: Hộp 20 gói
- **Hoạt chất**: Cefixim 75mg
- **Nhóm sản phẩm**: Kháng sinh
- **Giá**: 200.000 VNĐ
```

### 2. **Card Layout với Separator**
```markdown
## Thông tin sản phẩm

**🔹 Mecefix - B.E 50 mg**
Quy cách: Hộp 20 gói | Hoạt chất: Cefixim 50mg | Giá: 150.000 VNĐ

**🔹 Mecefix - B.E 75 mg** 
Quy cách: Hộp 20 gói | Hoạt chất: Cefixim 75mg | Giá: 200.000 VNĐ

**🔹 Mecefix - B.E 150 mg**
Quy cách: Hộp 2 vỉ x 10 viên | Hoạt chất: Cefixim 150mg | Giá: 350.000 VNĐ
```

### 3. **Definition List Style**
```markdown
## Chi tiết sản phẩm

**Mecefix - B.E 50 mg**
→ Quy cách: Hộp 20 gói
→ Hoạt chất: Cefixim 50mg
→ Nhóm: Kháng sinh
→ Giá: 150.000 VNĐ

**Mecefix - B.E 75 mg**
→ Quy cách: Hộp 20 gói  
→ Hoạt chất: Cefixim 75mg
→ Nhóm: Kháng sinh
→ Giá: 200.000 VNĐ
```

## 📝 Prompt System Suggestions

### Prompt cho n8n workflow:
```
Khi trả lời về thông tin sản phẩm, danh sách, hoặc dữ liệu có cấu trúc:

KHÔNG sử dụng markdown table (| | format).

Thay vào đó, sử dụng:
1. Danh sách có đánh số với thông tin chi tiết dưới dạng bullet points
2. Card layout với separator (|) trên cùng một dòng  
3. Definition list với arrow (→) cho các thuộc tính

Ví dụ format mong muốn:
## Thông tin sản phẩm

### 1. Tên sản phẩm
- **Thuộc tính 1**: Giá trị
- **Thuộc tính 2**: Giá trị
- **Thuộc tính 3**: Giá trị

### 2. Tên sản phẩm khác
- **Thuộc tính 1**: Giá trị
- **Thuộc tính 2**: Giá trị

Format này sẽ hiển thị tốt trên cả desktop và mobile.
```

## 🔧 Implementation trong n8n

### Step 1: Cập nhật System Prompt
Trong n8n workflow, tìm node "AI/LLM" và thêm instruction:

```
IMPORTANT: Do not use markdown tables (| format) in responses. 
Instead, use structured lists or card layout for better mobile experience.
```

### Step 2: Post-processing (Optional)
Có thể thêm một function node để convert table thành list nếu AI vẫn trả về table:

```javascript
// Convert markdown table to structured list
function convertTableToList(text) {
  // Detect table pattern
  const tablePattern = /\|(.+?)\|/g;
  
  if (tablePattern.test(text)) {
    // Convert logic here
    // Transform table rows to structured format
  }
  
  return text;
}
```

## 🎯 Benefits

### ✅ Mobile-Friendly
- Không cần horizontal scroll
- Thông tin hiển thị đầy đủ trên màn hình nhỏ
- Dễ đọc và tương tác

### ✅ Better UX
- Format rõ ràng, dễ hiểu
- Không bị overlap hay cắt text
- Consistent trên mọi device

### ✅ Flexible
- Có thể customize styling dễ dàng
- Không phụ thuộc vào table CSS complexity
- SEO friendly hơn

## 📱 Test Cases

Sau khi implement, test với:
1. **Mobile Safari iOS** - Màn hình nhỏ nhất
2. **Android Chrome** - Various screen sizes  
3. **Desktop browsers** - Đảm bảo vẫn đẹp trên desktop
4. **Tablet landscape/portrait** - Medium screens

Đảm bảo format mới hiển thị tốt trên tất cả devices.