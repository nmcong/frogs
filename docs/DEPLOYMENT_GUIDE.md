# Hướng Dẫn Deploy Dự Án Lên VPS

## 📋 Mục Lục
1. [Chuẩn Bị](#1-chuẩn-bị)
2. [Kết Nối SSH](#2-kết-nối-ssh)
3. [Cài Đặt Web Server](#3-cài-đặt-web-server)
4. [Upload Code Lên VPS](#4-upload-code-lên-vps)
5. [Cấu Hình Domain](#5-cấu-hình-domain)
6. [Cài Đặt SSL (HTTPS)](#6-cài-đặt-ssl-https)
7. [Bảo Trì & Cập Nhật](#7-bảo-trì--cập-nhật)

---

## 1. Chuẩn Bị

### Những gì bạn cần:
- ✅ **VPS** (Virtual Private Server) - có thể thuê từ:
  - DigitalOcean (từ $6/tháng)
  - Vultr (từ $5/tháng)
  - Linode (từ $5/tháng)
  - AWS Lightsail (từ $3.5/tháng)
  - VPS Việt Nam: AZDIGI, INET, VCCorp...

- ✅ **Hệ điều hành VPS**: Ubuntu 22.04 LTS (khuyến nghị)

- ✅ **Domain** (tùy chọn nhưng nên có):
  - Mua tại: GoDaddy, Namecheap, Tên Miền Việt...
  - Hoặc domain miễn phí: Freenom, eu.org

- ✅ **SSH Client** trên máy tính:
  - macOS/Linux: Terminal có sẵn
  - Windows: PowerShell hoặc PuTTY

### Thông tin VPS bạn sẽ nhận được:
```
IP Address: xxx.xxx.xxx.xxx
Username: root (hoặc ubuntu)
Password: ********** (hoặc SSH Key)
```

---

## 2. Kết Nối SSH

### Bước 2.1: Kết nối lần đầu

Mở Terminal và chạy:

```bash
ssh root@xxx.xxx.xxx.xxx
# Thay xxx.xxx.xxx.xxx bằng IP VPS của bạn
```

Nhập password khi được yêu cầu.

**Nếu dùng SSH Key:**
```bash
ssh -i /path/to/your/private-key.pem root@xxx.xxx.xxx.xxx
```

### Bước 2.2: Cập nhật hệ thống

Sau khi đã SSH vào VPS, chạy:

```bash
# Cập nhật danh sách packages
sudo apt update

# Nâng cấp các packages
sudo apt upgrade -y
```

### Bước 2.3: Tạo user mới (bảo mật hơn - tùy chọn)

```bash
# Tạo user mới
adduser deployer

# Thêm quyền sudo
usermod -aG sudo deployer

# Chuyển sang user mới
su - deployer
```

---

## 3. Cài Đặt Web Server

### Bước 3.1: Cài đặt Nginx

```bash
# Cài Nginx
sudo apt install nginx -y

# Khởi động Nginx
sudo systemctl start nginx

# Cho phép Nginx chạy tự động khi khởi động
sudo systemctl enable nginx

# Kiểm tra trạng thái
sudo systemctl status nginx
```

### Bước 3.2: Cấu hình Firewall

```bash
# Cho phép HTTP và HTTPS qua firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable

# Kiểm tra status
sudo ufw status
```

### Bước 3.3: Kiểm tra

Mở trình duyệt và truy cập: `http://xxx.xxx.xxx.xxx`

Bạn sẽ thấy trang "Welcome to nginx!" nghĩa là đã thành công!

---

## 4. Upload Code Lên VPS

### Phương pháp 1: Sử dụng Git (Khuyến nghị)

#### Bước 4.1: Cài đặt Git trên VPS

```bash
sudo apt install git -y
```

#### Bước 4.2: Push code lên GitHub (trên máy local)

```bash
# Khởi tạo git (nếu chưa có)
cd /Users/nguyencong/Workspace/frogs
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit"

# Tạo repo trên GitHub rồi push
git remote add origin https://github.com/username/frogs.git
git branch -M main
git push -u origin main
```

#### Bước 4.3: Clone code trên VPS

```bash
# Tạo thư mục cho website
cd /var/www/

# Clone repository
sudo git clone https://github.com/username/frogs.git frogs

# Phân quyền
sudo chown -R www-data:www-data /var/www/frogs
sudo chmod -R 755 /var/www/frogs
```

### Phương pháp 2: Sử dụng SCP (Upload trực tiếp)

Chạy lệnh này trên **máy local** (không phải VPS):

```bash
# Upload toàn bộ thư mục
scp -r /Users/nguyencong/Workspace/frogs root@xxx.xxx.xxx.xxx:/var/www/

# Sau đó SSH vào VPS và phân quyền
ssh root@xxx.xxx.xxx.xxx
sudo chown -R www-data:www-data /var/www/frogs
sudo chmod -R 755 /var/www/frogs
```

### Phương pháp 3: Sử dụng FileZilla (GUI)

1. Tải FileZilla: https://filezilla-project.org/
2. Kết nối với thông tin:
   - Host: `sftp://xxx.xxx.xxx.xxx`
   - Username: `root`
   - Password: `your-password`
   - Port: `22`
3. Upload toàn bộ files vào `/var/www/frogs`

---

## 5. Cấu Hình Domain

### Bước 5.1: Trỏ domain về VPS

Đăng nhập vào trang quản lý domain của bạn và tạo DNS records:

**A Record:**
```
Type: A
Name: @ (hoặc để trống)
Value: xxx.xxx.xxx.xxx (IP VPS)
TTL: 3600
```

**WWW Record:**
```
Type: A
Name: www
Value: xxx.xxx.xxx.xxx (IP VPS)
TTL: 3600
```

Hoặc dùng CNAME:
```
Type: CNAME
Name: www
Value: yourdomain.com
TTL: 3600
```

⏰ **Lưu ý:** DNS có thể mất 1-24 giờ để cập nhật hoàn toàn.

### Bước 5.2: Cấu hình Nginx cho domain

```bash
# Tạo file cấu hình
sudo nano /etc/nginx/sites-available/frogs
```

**Nếu CHƯA CÓ domain (dùng IP):**

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name xxx.xxx.xxx.xxx;
    
    root /var/www/frogs;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

**Nếu CÓ domain:**

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/frogs;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### Bước 5.3: Kích hoạt cấu hình

```bash
# Tạo symbolic link
sudo ln -s /etc/nginx/sites-available/frogs /etc/nginx/sites-enabled/

# Xóa cấu hình mặc định (tùy chọn)
sudo rm /etc/nginx/sites-enabled/default

# Kiểm tra cấu hình
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Bước 5.4: Kiểm tra

Mở trình duyệt:
- Nếu dùng IP: `http://xxx.xxx.xxx.xxx`
- Nếu có domain: `http://yourdomain.com`

---

## 6. Cài Đặt SSL (HTTPS)

### Bước 6.1: Cài đặt Certbot

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### Bước 6.2: Lấy SSL Certificate

**Nếu có domain:**
```bash
# Lấy và cài đặt SSL tự động
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Nhập email và đồng ý terms khi được yêu cầu
```

Certbot sẽ tự động:
- Lấy SSL certificate từ Let's Encrypt
- Cấu hình Nginx để sử dụng HTTPS
- Thiết lập redirect từ HTTP sang HTTPS

### Bước 6.3: Tự động gia hạn SSL

```bash
# Test tự động gia hạn
sudo certbot renew --dry-run

# Certbot tự động thêm cronjob để gia hạn
# Kiểm tra:
sudo systemctl status certbot.timer
```

### Bước 6.4: Kiểm tra

Truy cập: `https://yourdomain.com` 🔒

---

## 7. Bảo Trì & Cập Nhật

### Cập nhật code khi có thay đổi

**Nếu dùng Git:**
```bash
# SSH vào VPS
ssh root@xxx.xxx.xxx.xxx

# Di chuyển đến thư mục project
cd /var/www/frogs

# Pull code mới nhất
sudo git pull origin main

# Không cần reload Nginx vì chỉ là static files
```

**Nếu dùng SCP (từ máy local):**
```bash
scp -r /Users/nguyencong/Workspace/frogs/* root@xxx.xxx.xxx.xxx:/var/www/frogs/
```

### Kiểm tra logs

```bash
# Xem Nginx access log
sudo tail -f /var/log/nginx/access.log

# Xem Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Backup dữ liệu

```bash
# Tạo backup
cd /var/www
sudo tar -czf frogs-backup-$(date +%Y%m%d).tar.gz frogs

# Download về máy local (chạy trên máy local)
scp root@xxx.xxx.xxx.xxx:/var/www/frogs-backup-*.tar.gz ~/Downloads/
```

### Restart services

```bash
# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (không downtime)
sudo systemctl reload nginx

# Kiểm tra status
sudo systemctl status nginx
```

---

## 🎯 Checklist Hoàn Thành

- [ ] VPS đã được cài đặt và cập nhật
- [ ] SSH hoạt động bình thường
- [ ] Nginx đã được cài đặt và chạy
- [ ] Code đã được upload lên `/var/www/frogs`
- [ ] Nginx config đã được thiết lập
- [ ] Domain đã được trỏ về VPS (nếu có)
- [ ] SSL certificate đã được cài đặt (nếu có domain)
- [ ] Website hoạt động tốt trên HTTPS

---

## 🚨 Xử Lý Sự Cố

### Website không hiển thị

```bash
# Kiểm tra Nginx có đang chạy không
sudo systemctl status nginx

# Kiểm tra log lỗi
sudo tail -f /var/log/nginx/error.log

# Kiểm tra cấu hình
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Permission denied

```bash
# Phân quyền lại
sudo chown -R www-data:www-data /var/www/frogs
sudo chmod -R 755 /var/www/frogs
```

### Domain không trỏ về VPS

```bash
# Kiểm tra DNS
dig yourdomain.com
# hoặc
nslookup yourdomain.com
```

### SSL không hoạt động

```bash
# Force renew certificate
sudo certbot renew --force-renewal

# Kiểm tra cấu hình SSL
sudo certbot certificates
```

---

## 📚 Tài Liệu Tham Khảo

- Nginx Documentation: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/
- DigitalOcean Tutorials: https://www.digitalocean.com/community/tutorials
- Ubuntu Server Guide: https://ubuntu.com/server/docs

---

## 💡 Tips Bổ Sung

### Tăng bảo mật SSH

```bash
# Tắt login bằng password, chỉ dùng SSH key
sudo nano /etc/ssh/sshd_config

# Thay đổi:
PasswordAuthentication no
PermitRootLogin no

# Restart SSH
sudo systemctl restart ssh
```

### Cài đặt monitoring

```bash
# Cài htop để monitor hệ thống
sudo apt install htop -y

# Sử dụng
htop
```

### Tối ưu hiệu suất

Thêm vào Nginx config:
```nginx
# Thêm vào trong block server {}
client_max_body_size 10M;
client_body_buffer_size 128k;

# Cache
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;
```

---

**Chúc bạn deploy thành công! 🚀**

Nếu có thắc mắc, hãy tham khảo logs hoặc tìm kiếm trên Google/Stack Overflow.

