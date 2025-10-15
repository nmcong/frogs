# 🔧 Troubleshooting Guide

Các lỗi thường gặp và cách fix khi deploy.

---

## 🔐 SSH & Connection Issues

### ❌ Lỗi: "REMOTE HOST IDENTIFICATION HAS CHANGED"

```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Host key verification failed.
```

**Nguyên nhân:**
- VPS đã reinstall/rebuild ✅ (phổ biến nhất)
- IP VPS thay đổi nhưng SSH nhớ host key cũ
- VPS restored từ backup
- ⚠️ Man-in-the-middle attack (hiếm)

**Giải pháp:**

**Cách 1: Xóa host key theo dòng**
```bash
# Nếu lỗi báo "Offending ECDSA key in ~/.ssh/known_hosts:24"
# Xóa dòng 24:

# macOS:
sed -i '' '24d' ~/.ssh/known_hosts

# Linux:
sed -i '24d' ~/.ssh/known_hosts
```

**Cách 2: Xóa host key theo IP**
```bash
# Thay YOUR_VPS_IP bằng IP thật
ssh-keygen -R YOUR_VPS_IP

# Ví dụ:
ssh-keygen -R 123.45.67.89
```

**Cách 3: Xóa toàn bộ known_hosts**
```bash
# Backup trước
cp ~/.ssh/known_hosts ~/.ssh/known_hosts.backup

# Xóa
rm ~/.ssh/known_hosts
```

**Sau khi fix:**
```bash
# SSH lại
ssh root@YOUR_VPS_IP
# Gõ "yes" khi được hỏi
```

✅ **Done!**

---

### ❌ Lỗi: "Permission denied (publickey)"

**Nguyên nhân:**
- SSH key chưa được add vào VPS
- SSH key không đúng
- Permissions của .ssh folder sai

**Giải pháp:**

**1. Kiểm tra public key đã add vào VPS chưa:**
```bash
# SSH vào VPS (dùng password)
ssh root@YOUR_VPS_IP

# Kiểm tra authorized_keys
cat ~/.ssh/authorized_keys

# Nếu chưa có key, thêm vào:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**2. Test SSH key từ local:**
```bash
# Test với key cụ thể
ssh -i ~/.ssh/your_key root@YOUR_VPS_IP

# Nếu work → key đúng, cần config SSH
```

**3. Fix permissions:**
```bash
# Trên VPS
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Trên local
chmod 700 ~/.ssh
chmod 600 ~/.ssh/your_private_key
```

---

### ❌ Lỗi: "Connection timed out"

**Nguyên nhân:**
- Firewall chặn SSH
- IP VPS sai
- VPS đang down

**Giải pháp:**

**1. Kiểm tra IP:**
```bash
ping YOUR_VPS_IP
# Nếu không ping được → IP sai hoặc VPS down
```

**2. Kiểm tra port:**
```bash
nc -zv YOUR_VPS_IP 22
# Hoặc
telnet YOUR_VPS_IP 22
```

**3. Kiểm tra firewall trên VPS:**
```bash
# SSH vào (qua console nếu có)
sudo ufw status

# Cho phép SSH
sudo ufw allow 22
sudo ufw reload
```

**4. Thử SSH port khác:**
```bash
# Một số VPS dùng port khác (vd: 2222)
ssh -p 2222 root@YOUR_VPS_IP
```

---

## 🤖 GitHub Actions Issues

### ❌ Workflow failed: "Permission denied (publickey)"

**Nguyên nhân:**
- GitHub Secret `VPS_SSH_KEY` chưa đúng
- Public key chưa add vào VPS

**Giải pháp:**

**1. Kiểm tra VPS_SSH_KEY secret:**
```bash
# Hiển thị private key
cat ~/.ssh/github_actions

# Copy TOÀN BỘ (bao gồm BEGIN và END)
# Update GitHub Secret với key mới
```

**2. Kiểm tra public key trên VPS:**
```bash
ssh root@YOUR_VPS_IP
cat ~/.ssh/authorized_keys
# Phải có public key tương ứng!
```

**3. Test SSH local trước:**
```bash
ssh -i ~/.ssh/github_actions root@YOUR_VPS_IP
# Nếu không work → Fix local trước
```

---

### ❌ Workflow failed: "Host key verification failed"

**Giải pháp:**

Workflow đã có sẵn fix này. Nếu vẫn lỗi:

**Cách 1: Thêm vào workflow** (đã có sẵn trong deploy-rsync.yml):
```yaml
- name: Setup SSH
  run: ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts
```

**Cách 2: Disable strict checking** (không khuyến nghị):
```yaml
- name: Deploy
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USERNAME }}
    key: ${{ secrets.VPS_SSH_KEY }}
    port: ${{ secrets.VPS_PORT }}
    script_stop: true
    # Thêm dòng này:
    insecure: true
```

---

### ❌ Workflow failed: "git pull failed"

**Nguyên nhân:**
- VPS chưa clone repo
- Git conflicts

**Giải pháp:**

**1. Clone repo lần đầu trên VPS:**
```bash
ssh root@YOUR_VPS_IP
cd /var/www
git clone https://github.com/username/frogs.git frogs
```

**2. Reset git nếu có conflicts:**
```bash
ssh root@YOUR_VPS_IP
cd /var/www/frogs
git reset --hard origin/main
git pull
```

**3. Hoặc chuyển sang rsync workflow:**
- Xóa `deploy.yml`
- Dùng `deploy-rsync.yml`

---

### ❌ Lỗi: "Secret not found"

**Giải pháp:**

**Kiểm tra secrets:**
1. Vào GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Phải có đủ 6 secrets:
   - `VPS_HOST`
   - `VPS_USERNAME`
   - `VPS_SSH_KEY`
   - `VPS_PORT`
   - `DEPLOY_PATH`
   - `REPO_URL`

**Tên phải CHÍNH XÁC** (case-sensitive)!

---

## 🌐 Nginx Issues

### ❌ Website không hiển thị (404 / 502 / 503)

**Giải pháp:**

**1. Kiểm tra Nginx đang chạy:**
```bash
sudo systemctl status nginx
# Nếu stopped:
sudo systemctl start nginx
```

**2. Kiểm tra config:**
```bash
sudo nginx -t
# Nếu có lỗi → Fix config
```

**3. Kiểm tra logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**4. Kiểm tra files:**
```bash
ls -la /var/www/frogs/
# Phải có index.html
```

**5. Kiểm tra permissions:**
```bash
sudo chown -R www-data:www-data /var/www/frogs
sudo chmod -R 755 /var/www/frogs
```

---

### ❌ Lỗi: "nginx: command not found"

**Giải pháp:**

**Cài Nginx:**
```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

### ❌ Code không update sau khi deploy

**Nguyên nhân:**
- Browser cache
- Nginx cache
- Deploy không thành công

**Giải pháp:**

**1. Hard refresh browser:**
- Chrome/Firefox: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)

**2. Kiểm tra file trên VPS:**
```bash
ssh root@YOUR_VPS_IP
cat /var/www/frogs/index.html
# Kiểm tra có code mới không
```

**3. Reload Nginx:**
```bash
sudo systemctl reload nginx
# Hoặc
sudo systemctl restart nginx
```

**4. Clear Nginx cache (nếu có):**
```bash
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

---

## 🔒 SSL/HTTPS Issues

### ❌ SSL certificate failed

**Giải pháp:**

**1. Kiểm tra domain đã trỏ đúng:**
```bash
dig yourdomain.com
# A record phải trỏ về IP VPS
```

**2. Chạy lại Certbot:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**3. Nếu lỗi rate limit:**
```bash
# Certbot bị giới hạn 5 lần/tuần
# Đợi 1 tuần hoặc dùng staging:
sudo certbot --nginx -d yourdomain.com --staging
```

**4. Kiểm tra firewall:**
```bash
sudo ufw allow 'Nginx Full'
sudo ufw reload
```

---

### ❌ Mixed content warning (HTTP trong HTTPS)

**Giải pháp:**

**Thay đổi URLs trong code:**
```html
<!-- Sai: -->
<script src="http://example.com/script.js"></script>

<!-- Đúng: -->
<script src="https://example.com/script.js"></script>

<!-- Hoặc dùng protocol-relative: -->
<script src="//example.com/script.js"></script>
```

---

## 📦 Deploy Script Issues

### ❌ deploy.sh: "rsync: command not found"

**Giải pháp:**

**Cài rsync:**
```bash
# macOS (dùng Homebrew)
brew install rsync

# Linux
sudo apt install rsync -y
```

---

### ❌ deploy.sh: "Connection refused"

**Giải pháp:**

Giống như "Connection timed out" ở phần SSH.

Kiểm tra:
1. IP VPS đúng chưa
2. SSH port đúng chưa (mặc định 22)
3. Firewall có cho phép SSH không

---

## 🔧 General Issues

### ❌ Lỗi: "disk space full"

**Giải pháp:**

**1. Kiểm tra disk:**
```bash
df -h
```

**2. Xóa logs cũ:**
```bash
sudo journalctl --vacuum-time=7d
sudo find /var/log -type f -name "*.log" -mtime +30 -delete
```

**3. Xóa cache:**
```bash
sudo apt clean
sudo apt autoremove -y
```

---

### ❌ Lỗi: "out of memory"

**Giải pháp:**

**1. Kiểm tra RAM:**
```bash
free -h
```

**2. Tạo swap file:**
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

### ❌ Lỗi: "port 80 already in use"

**Giải pháp:**

**1. Kiểm tra process:**
```bash
sudo lsof -i :80
# Hoặc
sudo netstat -tulpn | grep :80
```

**2. Kill process:**
```bash
sudo kill -9 PROCESS_ID
```

**3. Hoặc stop service khác:**
```bash
# Nếu Apache đang chạy:
sudo systemctl stop apache2
sudo systemctl disable apache2
```

---

## 📞 Quick Commands

### Kiểm tra logs:
```bash
# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# System log
sudo journalctl -xe

# Nginx config test
sudo nginx -t
```

### Restart services:
```bash
# Nginx
sudo systemctl restart nginx
sudo systemctl status nginx

# SSH
sudo systemctl restart ssh
```

### Kiểm tra files:
```bash
# List files
ls -la /var/www/frogs/

# Check permissions
stat /var/www/frogs/

# Check disk space
df -h
```

---

## 🆘 Still Need Help?

### Debug checklist:
- [ ] Check logs (`/var/log/nginx/error.log`)
- [ ] Test SSH connection
- [ ] Verify file permissions
- [ ] Check Nginx config (`sudo nginx -t`)
- [ ] Verify DNS (if using domain)
- [ ] Check firewall rules
- [ ] Review GitHub Actions logs

### Resources:
- [Nginx Documentation](https://nginx.org/en/docs/)
- [SSH Troubleshooting](https://www.ssh.com/academy/ssh/troubleshooting)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- Stack Overflow
- Reddit r/webdev

---

## 💡 Pro Tips

### Enable debug mode:

**SSH:**
```bash
ssh -vvv root@YOUR_VPS_IP
# Verbose mode hiển thị chi tiết
```

**Nginx:**
```nginx
# Thêm vào nginx.conf
error_log /var/log/nginx/error.log debug;
```

**GitHub Actions:**
```yaml
# Thêm vào workflow
- name: Debug
  run: |
    echo "Debug info:"
    ls -la
    pwd
    whoami
```

---

**Nếu vẫn gặp lỗi, Google error message hoặc hỏi trên Stack Overflow!**

Happy troubleshooting! 🔧

