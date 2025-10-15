# ✅ Domain Setup Checklist - frogs.noteflix.tech

Checklist đầy đủ để setup subdomain `frogs.noteflix.tech` từ A-Z.

---

## 📋 Pre-Setup Information

Thông tin bạn cần chuẩn bị:

```
Domain chính: noteflix.tech
Subdomain: frogs.noteflix.tech
IP VPS: [điền IP của bạn]
Email: [điền email của bạn]
```

---

## 🎯 Step-by-Step Checklist

### 📍 Phase 1: DNS Setup (15-30 phút)

- [ ] **Bước 1.1:** Đăng nhập vào trang quản lý domain noteflix.tech
- [ ] **Bước 1.2:** Tìm phần DNS Management / DNS Records
- [ ] **Bước 1.3:** Thêm A Record:
  ```
  Type: A
  Name: frogs
  Value: [IP_VPS]
  TTL: 3600
  ```
- [ ] **Bước 1.4:** Save/Apply changes
- [ ] **Bước 1.5:** Test DNS với lệnh:
  ```bash
  ping frogs.noteflix.tech
  dig frogs.noteflix.tech
  ```
- [ ] **Bước 1.6:** Đợi DNS propagate (5-30 phút)

**📖 Chi tiết:** [DNS_SETUP_GUIDE.md](DNS_SETUP_GUIDE.md)

---

### 🖥️ Phase 2: VPS Setup (10-20 phút)

#### Option A: Tự động (Khuyến nghị)

- [ ] **Bước 2A.1:** SSH vào VPS
  ```bash
  ssh root@[IP_VPS]
  ```
- [ ] **Bước 2A.2:** Download setup script
  ```bash
  wget https://raw.githubusercontent.com/[username]/frogs/main/setup-vps.sh
  ```
- [ ] **Bước 2A.3:** Chạy script
  ```bash
  sudo bash setup-vps.sh
  ```
- [ ] **Bước 2A.4:** Nhập domain: `frogs.noteflix.tech` khi được hỏi
- [ ] **Bước 2A.5:** Chọn cài SSL: Yes (sau khi DNS đã OK)

#### Option B: Manual

- [ ] **Bước 2B.1:** SSH vào VPS
- [ ] **Bước 2B.2:** Cài Nginx
  ```bash
  sudo apt update
  sudo apt install nginx -y
  ```
- [ ] **Bước 2B.3:** Tạo Nginx config
  ```bash
  sudo nano /etc/nginx/sites-available/frogs
  ```
- [ ] **Bước 2B.4:** Copy config từ `nginx-config-template.conf`
- [ ] **Bước 2B.5:** Kích hoạt site
  ```bash
  sudo ln -s /etc/nginx/sites-available/frogs /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl reload nginx
  ```

**📖 Chi tiết:** [SUBDOMAIN_SETUP.md](SUBDOMAIN_SETUP.md)

---

### 🔒 Phase 3: SSL Setup (5 phút)

**⚠️ Chỉ làm sau khi DNS đã resolve!**

- [ ] **Bước 3.1:** Test DNS trước
  ```bash
  ping frogs.noteflix.tech
  # Phải trả về IP VPS
  ```
- [ ] **Bước 3.2:** Cài Certbot (nếu chưa có)
  ```bash
  sudo apt install certbot python3-certbot-nginx -y
  ```
- [ ] **Bước 3.3:** Lấy SSL certificate
  ```bash
  sudo certbot --nginx -d frogs.noteflix.tech
  ```
- [ ] **Bước 3.4:** Nhập email khi được hỏi
- [ ] **Bước 3.5:** Đồng ý terms: y
- [ ] **Bước 3.6:** Chọn redirect HTTP→HTTPS: 2
- [ ] **Bước 3.7:** Test HTTPS
  ```bash
  curl -I https://frogs.noteflix.tech
  ```

---

### 📤 Phase 4: Deploy Code (5-10 phút)

#### Option A: GitHub Actions (Tự động)

- [ ] **Bước 4A.1:** Setup GitHub Actions theo [GITHUB_ACTIONS_QUICKSTART.md](GITHUB_ACTIONS_QUICKSTART.md)
- [ ] **Bước 4A.2:** Update GitHub Secret `VPS_HOST` = `frogs.noteflix.tech`
- [ ] **Bước 4A.3:** Push code
  ```bash
  git push
  ```
- [ ] **Bước 4A.4:** Check Actions tab trên GitHub
- [ ] **Bước 4A.5:** Đợi deploy hoàn thành

#### Option B: Deploy Script

- [ ] **Bước 4B.1:** Chạy deploy script
  ```bash
  ./deploy.sh
  ```
- [ ] **Bước 4B.2:** Nhập thông tin VPS nếu được hỏi

#### Option C: Manual

- [ ] **Bước 4C.1:** Upload files
  ```bash
  scp -r ./* root@[IP_VPS]:/var/www/frogs/
  ```
- [ ] **Bước 4C.2:** Phân quyền
  ```bash
  ssh root@[IP_VPS]
  sudo chown -R www-data:www-data /var/www/frogs
  sudo chmod -R 755 /var/www/frogs
  ```

---

### ✅ Phase 5: Verification (2 phút)

- [ ] **Bước 5.1:** Test HTTP
  ```bash
  curl -I http://frogs.noteflix.tech
  # Nên redirect 301 nếu đã có SSL
  ```
- [ ] **Bước 5.2:** Test HTTPS
  ```bash
  curl -I https://frogs.noteflix.tech
  # Phải trả về 200 OK
  ```
- [ ] **Bước 5.3:** Mở trình duyệt
  ```
  https://frogs.noteflix.tech
  ```
- [ ] **Bước 5.4:** Kiểm tra SSL certificate (ổ khóa xanh)
- [ ] **Bước 5.5:** Test các tính năng website
- [ ] **Bước 5.6:** Test trên mobile/tablet

---

## 🔧 Post-Setup (Tùy chọn)

### Security:
- [ ] Setup firewall rules
  ```bash
  sudo ufw status
  ```
- [ ] Disable password SSH (chỉ dùng key)
- [ ] Setup fail2ban (chống brute force)
- [ ] Regular security updates

### Monitoring:
- [ ] Setup log rotation
- [ ] Monitor Nginx access logs
  ```bash
  sudo tail -f /var/log/nginx/frogs-access.log
  ```
- [ ] Setup uptime monitoring (UptimeRobot, Pingdom...)

### Optimization:
- [ ] Enable HTTP/2
- [ ] Setup CDN (Cloudflare)
- [ ] Optimize images
- [ ] Enable browser caching

### Backup:
- [ ] Setup automated backups
- [ ] Test restore procedure
- [ ] Document backup schedule

---

## 🚨 Troubleshooting Quick Links

| Issue | Guide |
|-------|-------|
| DNS không resolve | [DNS_SETUP_GUIDE.md](DNS_SETUP_GUIDE.md#-dns-không-resolve) |
| SSH host key changed | [SSH_HOST_KEY_FIX.md](SSH_HOST_KEY_FIX.md) |
| Nginx 404/502/503 | [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md#-website-không-hiển-thị-404--502--503) |
| SSL failed | [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md#-ssl-certificate-failed) |
| Deploy failed | [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) |

---

## 📊 Progress Tracker

### Overall Progress:
```
[ ] Phase 1: DNS Setup (0/6 steps)
[ ] Phase 2: VPS Setup (0/5 steps) 
[ ] Phase 3: SSL Setup (0/7 steps)
[ ] Phase 4: Deploy Code (0/5 steps)
[ ] Phase 5: Verification (0/6 steps)

Total: 0/29 steps completed
```

**Time estimate:**
- Fastest: 30 minutes (với script)
- Average: 1-2 hours (manual)
- Including DNS wait: 2-3 hours

---

## 🎉 Success Criteria

Website thành công khi:

✅ **DNS:** `ping frogs.noteflix.tech` trả về IP VPS
✅ **HTTP:** Redirect sang HTTPS (hoặc hiển thị website)
✅ **HTTPS:** `https://frogs.noteflix.tech` hiển thị website
✅ **SSL:** Certificate valid (ổ khóa xanh)
✅ **Deploy:** Code deploy thành công
✅ **Functional:** Tất cả features hoạt động

---

## 📚 Documentation Links

### Setup Guides:
- [SUBDOMAIN_SETUP.md](SUBDOMAIN_SETUP.md) - Complete subdomain setup
- [DNS_SETUP_GUIDE.md](DNS_SETUP_GUIDE.md) - DNS configuration
- [docs/DEPLOYMENT_INDEX.md](DEPLOYMENT_INDEX.md) - All deployment docs

### Deploy Options:
- [docs/GITHUB_ACTIONS_QUICKSTART.md](GITHUB_ACTIONS_QUICKSTART.md) - Auto deploy
- [docs/QUICK_START.md](QUICK_START.md) - Deploy script
- [docs/DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Manual deploy

### Troubleshooting:
- [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) - All errors
- [SSH_HOST_KEY_FIX.md](SSH_HOST_KEY_FIX.md) - SSH issues

---

## 💡 Tips for Success

1. **Làm từng phase một** - Đừng vội
2. **Test sau mỗi bước** - Tìm lỗi sớm
3. **Đợi DNS propagate** - Đừng vội cài SSL
4. **Document changes** - Ghi lại những gì đã làm
5. **Keep backups** - Backup trước khi thay đổi

---

## 🎯 Final Checklist

Hoàn thành khi:

- [ ] Website accessible: https://frogs.noteflix.tech
- [ ] SSL certificate valid
- [ ] All pages load correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Deploy workflow working (if using auto-deploy)
- [ ] Monitoring setup (optional)
- [ ] Backups configured (optional)

---

**🎊 Congratulations when done!**

Your website is live at: **https://frogs.noteflix.tech** 🚀

