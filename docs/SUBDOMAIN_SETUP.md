# 🌐 Setup Subdomain: frogs.noteflix.tech

Hướng dẫn setup subdomain cụ thể cho dự án của bạn.

---

## 📋 Thông Tin Domain

- **Main Domain:** noteflix.tech
- **Subdomain:** frogs.noteflix.tech
- **IP VPS:** (IP VPS của bạn)

---

## 🚀 Setup Nhanh (3 bước)

### Bước 1: Cấu Hình DNS

Đăng nhập vào trang quản lý domain **noteflix.tech** và thêm DNS record:

**Thêm A Record:**
```
Type: A
Name: frogs
Value: [IP_VPS_CỦA_BẠN]
TTL: 3600 (hoặc Auto)
```

**Ví dụ:**
```
Type: A
Name: frogs
Value: 123.45.67.89
TTL: 3600
```

**Lưu ý:**
- `Name: frogs` sẽ tạo subdomain `frogs.noteflix.tech`
- Nếu có option `@` thì KHÔNG dùng, chỉ dùng `frogs`
- TTL 3600 = 1 giờ

---

### Bước 2: Cấu Hình Nginx trên VPS

**SSH vào VPS:**
```bash
ssh root@YOUR_VPS_IP
```

**Tạo Nginx config:**
```bash
sudo nano /etc/nginx/sites-available/frogs
```

**Copy config này vào:**
```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name frogs.noteflix.tech;
    
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
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
```

**Kích hoạt site:**
```bash
# Tạo symbolic link
sudo ln -s /etc/nginx/sites-available/frogs /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### Bước 3: Cài SSL (HTTPS) - Khuyến nghị

**Sau khi DNS đã propagate (đợi 5-30 phút):**

```bash
# Test DNS trước
ping frogs.noteflix.tech
# Phải trả về IP VPS của bạn

# Cài SSL
sudo certbot --nginx -d frogs.noteflix.tech

# Nhập email khi được hỏi
# Đồng ý terms: y
# Share email: n (hoặc y tùy bạn)
# Redirect HTTP to HTTPS: 2 (redirect)

# ✅ Done!
```

---

## ✅ Kiểm Tra

### 1. Test DNS:
```bash
# Từ máy local
dig frogs.noteflix.tech

# Hoặc
nslookup frogs.noteflix.tech

# Phải trả về IP VPS của bạn
```

### 2. Test HTTP:
```bash
curl -I http://frogs.noteflix.tech
# Phải trả về 200 OK hoặc 301 (nếu đã cài SSL)
```

### 3. Test HTTPS (sau khi cài SSL):
```bash
curl -I https://frogs.noteflix.tech
# Phải trả về 200 OK
```

### 4. Test trên trình duyệt:
- Truy cập: https://frogs.noteflix.tech
- Phải thấy website của bạn! 🎉

---

## 🔧 Troubleshooting

### ❌ DNS không resolve

**Vấn đề:** `ping frogs.noteflix.tech` không trả về IP

**Giải pháp:**
1. **Kiểm tra DNS record** trên trang quản lý domain:
   - Name phải là `frogs` (không phải `frogs.noteflix.tech`)
   - Value phải là IP VPS
   - Type phải là `A`

2. **Đợi DNS propagate:**
   ```bash
   # Kiểm tra DNS đã update chưa
   dig frogs.noteflix.tech @8.8.8.8
   
   # Đợi thêm 10-30 phút rồi thử lại
   ```

3. **Clear DNS cache trên máy local:**
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

---

### ❌ Nginx trả về 404

**Vấn đề:** DNS OK nhưng website không hiển thị

**Giải pháp:**
```bash
# 1. Kiểm tra files
ls -la /var/www/frogs/
# Phải có index.html

# 2. Kiểm tra permissions
sudo chown -R www-data:www-data /var/www/frogs
sudo chmod -R 755 /var/www/frogs

# 3. Kiểm tra Nginx config
sudo nginx -t

# 4. Reload Nginx
sudo systemctl reload nginx

# 5. Xem logs
sudo tail -f /var/log/nginx/error.log
```

---

### ❌ SSL failed

**Vấn đề:** Certbot không lấy được certificate

**Giải pháp:**
```bash
# 1. Đảm bảo DNS đã resolve
ping frogs.noteflix.tech

# 2. Đảm bảo port 80 và 443 mở
sudo ufw allow 'Nginx Full'

# 3. Test với staging trước (không bị rate limit)
sudo certbot --nginx -d frogs.noteflix.tech --staging

# 4. Nếu staging OK, chạy thật:
sudo certbot --nginx -d frogs.noteflix.tech --force-renewal
```

---

## 🤖 Update GitHub Actions

Nếu bạn dùng GitHub Actions, cần update secrets:

### Update GitHub Secrets:

**Vào:** Settings → Secrets and variables → Actions

**Update secret `VPS_HOST`:**
- ~~Old:~~ `xxx.xxx.xxx.xxx` (IP)
- **New:** `frogs.noteflix.tech` (subdomain)

**Sau đó push code:**
```bash
git push
# GitHub Actions sẽ deploy tự động!
```

---

## 📝 Config Files

### File đã tạo sẵn cho bạn:

**1. `nginx-config-template.conf`**
- Đã config sẵn cho `frogs.noteflix.tech`
- Copy vào `/etc/nginx/sites-available/frogs`

**2. Update trong workflows:**
- Nếu dùng GitHub Actions
- Update `VPS_HOST` secret thành `frogs.noteflix.tech`

---

## 🎯 Complete Checklist

- [ ] DNS A record đã tạo (frogs → IP_VPS)
- [ ] DNS đã resolve (test bằng `ping`)
- [ ] Nginx config đã tạo
- [ ] Nginx config đã kích hoạt
- [ ] Nginx test passed (`sudo nginx -t`)
- [ ] Website accessible qua HTTP
- [ ] SSL certificate đã cài (Certbot)
- [ ] Website accessible qua HTTPS
- [ ] GitHub Actions updated (nếu dùng)
- [ ] Test deploy thành công

---

## 🔐 Security Checklist

Sau khi setup xong:

- [ ] Force HTTPS (Certbot tự động)
- [ ] Security headers (có trong config)
- [ ] Firewall configured (`ufw`)
- [ ] SSH key authentication (không dùng password)
- [ ] Regular backups
- [ ] Monitor logs định kỳ

---

## 📊 Quick Commands Reference

### DNS:
```bash
# Check DNS
dig frogs.noteflix.tech
nslookup frogs.noteflix.tech
ping frogs.noteflix.tech
```

### Nginx:
```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Logs
sudo tail -f /var/log/nginx/frogs-access.log
sudo tail -f /var/log/nginx/frogs-error.log
```

### SSL:
```bash
# Install SSL
sudo certbot --nginx -d frogs.noteflix.tech

# Renew (manual test)
sudo certbot renew --dry-run

# Check certificates
sudo certbot certificates
```

### Deploy:
```bash
# Manual deploy
./deploy.sh

# Or via GitHub Actions
git push
```

---

## 🌟 Final Result

Sau khi hoàn thành:

✅ **Website URL:** https://frogs.noteflix.tech
✅ **Secure:** SSL/HTTPS enabled
✅ **Auto-deploy:** GitHub Actions (nếu setup)
✅ **Fast:** Gzip + caching enabled

---

## 📚 Next Steps

1. **Test website:** https://frogs.noteflix.tech
2. **Setup auto-deploy:** [GITHUB_ACTIONS_QUICKSTART.md](GITHUB_ACTIONS_QUICKSTART.md)
3. **Monitor logs:** `sudo tail -f /var/log/nginx/access.log`
4. **Regular updates:** `git push` (if using GitHub Actions)

---

## 🆘 Need Help?

- **DNS issues:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md#dns-issues)
- **Nginx errors:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md#nginx-issues)
- **SSL problems:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md#ssl-issues)

---

**Chúc bạn setup thành công! 🚀**

Your website will be live at: **https://frogs.noteflix.tech**

