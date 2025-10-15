# ⚡ Quick Start - Deploy trong 5 phút

## 📝 Thông tin bạn cần chuẩn bị:

```
✅ IP VPS: ___________________
✅ SSH Username: _____________ (thường là 'root')
✅ SSH Password: _____________ (hoặc SSH Key)
✅ Domain (tùy chọn): ________
```

---

## 🚀 Cách 1: Deploy Tự Động (Dễ nhất)

### Bước 1: Cài đặt VPS (chạy TRÊN VPS)

```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Download và chạy script cài đặt
wget https://raw.githubusercontent.com/yourusername/frogs/main/setup-vps.sh
sudo bash setup-vps.sh

# Script sẽ tự động:
# - Cài Nginx
# - Cấu hình Firewall
# - Tạo thư mục website
# - Hỏi về domain và SSL
```

### Bước 2: Deploy code (chạy TRÊN MÁY LOCAL)

```bash
# Tại thư mục dự án
./deploy.sh

# Nhập thông tin VPS khi được hỏi
# Script sẽ tự động upload code
```

### ✅ Xong! Truy cập: `http://YOUR_VPS_IP`

---

## 🛠️ Cách 2: Manual Deploy (5 bước)

### Bước 1: Cài Nginx trên VPS

```bash
ssh root@YOUR_VPS_IP
sudo apt update && sudo apt install nginx -y
sudo systemctl start nginx
sudo ufw allow 'Nginx Full'
```

### Bước 2: Upload code

```bash
# Từ máy local
scp -r /Users/nguyencong/Workspace/frogs/* root@YOUR_VPS_IP:/var/www/frogs/
```

### Bước 3: Cấu hình Nginx

```bash
# Trên VPS
sudo nano /etc/nginx/sites-available/frogs
```

Copy vào:
```nginx
server {
    listen 80;
    server_name YOUR_VPS_IP;  # hoặc domain.com
    root /var/www/frogs;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### Bước 4: Kích hoạt

```bash
sudo ln -s /etc/nginx/sites-available/frogs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 5: Phân quyền

```bash
sudo chown -R www-data:www-data /var/www/frogs
sudo chmod -R 755 /var/www/frogs
```

### ✅ Xong! Truy cập: `http://YOUR_VPS_IP`

---

## 🌐 Thêm Domain (Tùy chọn)

### 1. Trỏ DNS

Vào trang quản lý domain, thêm A Record:
```
Type: A
Name: @
Value: YOUR_VPS_IP
TTL: 3600
```

### 2. Cập nhật Nginx

```bash
# Sửa file config
sudo nano /etc/nginx/sites-available/frogs

# Thay đổi:
server_name yourdomain.com www.yourdomain.com;

# Reload
sudo systemctl reload nginx
```

---

## 🔒 Thêm SSL/HTTPS (Khuyến nghị)

```bash
# Cài Certbot
sudo apt install certbot python3-certbot-nginx -y

# Lấy SSL (miễn phí từ Let's Encrypt)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Nhập email và đồng ý terms
# Certbot sẽ tự động cấu hình HTTPS!
```

### ✅ Truy cập: `https://yourdomain.com` 🔒

---

## 🔄 Cập nhật code sau này

### Nếu dùng script deploy:
```bash
./deploy.sh
```

### Nếu deploy manual:
```bash
scp -r /Users/nguyencong/Workspace/frogs/* root@YOUR_VPS_IP:/var/www/frogs/
```

---

## ❌ Gặp lỗi?

### Website không hiển thị:
```bash
# Kiểm tra Nginx
sudo systemctl status nginx
sudo nginx -t

# Xem log lỗi
sudo tail -f /var/log/nginx/error.log
```

### Permission denied:
```bash
sudo chown -R www-data:www-data /var/www/frogs
sudo chmod -R 755 /var/www/frogs
```

### Domain không trỏ về:
```bash
# Đợi DNS propagate (1-24h)
# Kiểm tra DNS:
dig yourdomain.com
```

---

## 📚 Tài liệu đầy đủ

Xem [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) để biết thêm chi tiết.

---

**Chúc bạn deploy thành công! 🎉**

Need help? Check the logs:
- Nginx: `/var/log/nginx/error.log`
- System: `journalctl -xe`

