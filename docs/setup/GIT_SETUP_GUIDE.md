# Hướng dẫn cấu hình Git sau khi cài đặt

## Kiểm tra cài đặt
```bash
git --version
```

## Cấu hình Git lần đầu
```bash
# Cấu hình tên người dùng
git config --global user.name "Tên của bạn"

# Cấu hình email
git config --global user.email "email@example.com"

# Kiểm tra cấu hình
git config --list
```

## Khởi tạo repository cho dự án pingme-ai-assistant
```bash
# Di chuyển vào thư mục dự án
cd "/Users/anhvu/Documents/it project/pingme-ai-assistant"

# Khởi tạo git repository
git init

# Thêm tất cả files
git add .

# Commit đầu tiên
git commit -m "Initial commit"

# Thêm remote repository (thay yourusername bằng username GitHub của bạn)
git remote add origin https://github.com/yourusername/pingme-ai-assistant.git

# Push lên GitHub
git push -u origin main
```

## Các lệnh Git cơ bản
```bash
git status          # Kiểm tra trạng thái files
git add .           # Thêm tất cả thay đổi
git commit -m "..."  # Commit với message
git push            # Đẩy lên remote repository
git pull            # Kéo changes từ remote về
```