# 🤖 Cấu Hình GitHub Actions Auto-Deploy

Hướng dẫn này sẽ giúp bạn cấu hình GitHub Actions để tự động deploy lên VPS mỗi khi push code.

## 📋 Tổng Quan

**GitHub Actions** sẽ tự động:
- ✅ Phát hiện khi bạn push code lên GitHub
- ✅ Kết nối SSH vào VPS
- ✅ Pull code mới nhất
- ✅ Phân quyền files
- ✅ Reload Nginx

**Kết quả:** Mỗi lần `git push`, website tự động cập nhật! 🚀

---

## 🛠️ Cài Đặt (5 bước)

### Bước 1: Tạo SSH Key cho GitHub Actions

Chạy trên **máy local** của bạn:

```bash
# Tạo SSH key mới (không cần passphrase)
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_key

# Bạn sẽ có 2 files:
# - ~/.ssh/github_actions_key (private key - GIỮ BÍ MẬT)
# - ~/.ssh/github_actions_key.pub (public key)
```

### Bước 2: Thêm Public Key vào VPS

```bash
# Copy public key
cat ~/.ssh/github_actions_key.pub

# SSH vào VPS
ssh root@YOUR_VPS_IP

# Thêm public key vào authorized_keys
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Thoát VPS
exit
```

**Test kết nối:**
```bash
ssh -i ~/.ssh/github_actions_key root@YOUR_VPS_IP
# Nếu đăng nhập được mà không cần password = thành công!
```

### Bước 3: Lấy Private Key

```bash
# Hiển thị private key
cat ~/.ssh/github_actions_key

# Copy TOÀN BỘ nội dung (bao gồm cả -----BEGIN... và -----END...)
```

### Bước 4: Cấu hình GitHub Secrets

1. Mở repository trên GitHub
2. Vào **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Thêm các secrets sau:

#### Secret 1: VPS_HOST
```
Name: VPS_HOST
Value: xxx.xxx.xxx.xxx
# (IP VPS của bạn, hoặc domain nếu có)
```

#### Secret 2: VPS_USERNAME
```
Name: VPS_USERNAME
Value: root
# (hoặc username khác nếu bạn dùng)
```

#### Secret 3: VPS_SSH_KEY
```
Name: VPS_SSH_KEY
Value: (paste toàn bộ private key ở bước 3)
# Bắt đầu từ -----BEGIN OPENSSH PRIVATE KEY-----
# Kết thúc ở -----END OPENSSH PRIVATE KEY-----
```

#### Secret 4: VPS_PORT
```
Name: VPS_PORT
Value: 22
# (Port SSH, thường là 22)
```

#### Secret 5: DEPLOY_PATH
```
Name: DEPLOY_PATH
Value: /var/www/frogs
# (Đường dẫn deploy trên VPS)
```

#### Secret 6: REPO_URL (chỉ cho deploy.yml)
```
Name: REPO_URL
Value: https://github.com/YOUR_USERNAME/frogs.git
# (URL repository của bạn)
```

**Tổng cộng 6 secrets:**
- ✅ VPS_HOST
- ✅ VPS_USERNAME
- ✅ VPS_SSH_KEY
- ✅ VPS_PORT
- ✅ DEPLOY_PATH
- ✅ REPO_URL

### Bước 5: Push code lên GitHub

```bash
cd /Users/nguyencong/Workspace/frogs

# Thêm files
git add .
git commit -m "Add GitHub Actions auto-deploy"

# Push lên GitHub
git push origin main
```

**Ngay sau khi push:**
1. Vào tab **Actions** trên GitHub
2. Bạn sẽ thấy workflow đang chạy! 🏃
3. Click vào để xem logs real-time
4. Sau ~1-2 phút, website sẽ tự động cập nhật!

---

## 🎯 Chọn Workflow Phù Hợp

Có **2 workflows** trong thư mục `.github/workflows/`:

### 1. `deploy.yml` (Git-based) - Khuyến nghị

**Ưu điểm:**
- ✅ Nhanh hơn (chỉ pull thay đổi)
- ✅ Giữ được git history trên VPS
- ✅ Dễ rollback nếu cần

**Nhược điểm:**
- ❌ Repository phải public hoặc VPS phải có deploy key

**Khi nào dùng:**
- Repository public
- Muốn track git history trên VPS
- Muốn rollback dễ dàng

### 2. `deploy-rsync.yml` (Rsync-based)

**Ưu điểm:**
- ✅ Hoạt động với private repo
- ✅ Kiểm soát được files được deploy
- ✅ Tự động xóa files không cần thiết

**Nhược điểm:**
- ❌ Chậm hơn (upload toàn bộ files)
- ❌ Không có git history trên VPS

**Khi nào dùng:**
- Repository private
- Chỉ muốn deploy một số files cụ thể
- Không cần git trên VPS

### Chọn workflow:

**Chỉ giữ 1 trong 2 files:**

```bash
# Nếu chọn deploy.yml (Git)
rm .github/workflows/deploy-rsync.yml

# Nếu chọn deploy-rsync.yml (Rsync)
rm .github/workflows/deploy.yml
```

---

## 🔄 Sử Dụng Hàng Ngày

### Deploy tự động:
```bash
# Làm việc như bình thường
git add .
git commit -m "Update feature X"
git push

# GitHub Actions tự động deploy! 🎉
```

### Deploy thủ công từ GitHub UI:
1. Vào tab **Actions**
2. Chọn workflow **Deploy to VPS**
3. Click **Run workflow** → **Run workflow**

### Xem logs deploy:
1. Tab **Actions** trên GitHub
2. Click vào workflow run mới nhất
3. Xem chi tiết từng bước

---

## 🐛 Xử Lý Lỗi

### Lỗi: "Permission denied (publickey)"

**Nguyên nhân:** SSH key chưa được thêm vào VPS

**Giải pháp:**
```bash
# Trên VPS, kiểm tra authorized_keys
cat ~/.ssh/authorized_keys

# Đảm bảo public key đã có trong file này
# Kiểm tra quyền:
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Lỗi: "Host key verification failed"

**Giải pháp:** GitHub Actions cần biết host key của VPS

Thêm bước này vào workflow (đã có sẵn trong deploy-rsync.yml):
```yaml
- name: Setup SSH
  run: ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts
```

### Lỗi: "git pull failed"

**Nguyên nhân:** VPS chưa clone repo

**Giải pháp:** SSH vào VPS và clone repo lần đầu:
```bash
ssh root@VPS_IP
cd /var/www
git clone https://github.com/username/frogs.git frogs
```

### Lỗi: "nginx: command not found"

**Nguyên nhân:** Nginx chưa được cài

**Giải pháp:** Chạy `setup-vps.sh` hoặc cài Nginx manual

### Workflow không chạy

**Kiểm tra:**
1. File workflow ở đúng vị trí: `.github/workflows/deploy.yml`
2. Đã push lên branch `main` hoặc `master`
3. Tab Actions không bị disable (Settings → Actions → Allow all actions)

---

## 🔒 Bảo Mật

### ✅ Best Practices:

1. **Dùng SSH Key thay vì password**
   - ✅ Đã làm trong hướng dẫn này

2. **Giới hạn quyền của SSH key**
   ```bash
   # Trên VPS, tạo user riêng cho deploy (tùy chọn)
   adduser github-deployer
   usermod -aG www-data github-deployer
   
   # Thêm public key vào user này
   su - github-deployer
   mkdir -p ~/.ssh
   echo "PUBLIC_KEY" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   
   # Cấp quyền sudo cho một số lệnh cụ thể
   sudo visudo
   # Thêm: github-deployer ALL=(ALL) NOPASSWD: /usr/sbin/nginx, /bin/systemctl
   ```

3. **Không lưu secrets trong code**
   - ✅ Dùng GitHub Secrets

4. **Rotate SSH keys định kỳ**
   - Tạo key mới mỗi 6-12 tháng

5. **Monitor workflow runs**
   - Kiểm tra logs thường xuyên
   - Bật notifications cho failed runs

### ⚠️ Warnings:

- ❌ KHÔNG commit private key vào repository
- ❌ KHÔNG share GitHub Secrets
- ❌ KHÔNG dùng password authentication
- ❌ KHÔNG disable sudo password nếu không cần thiết

---

## 📊 Workflow Monitoring

### Enable Email Notifications:

GitHub tự động gửi email khi workflow failed.

**Cấu hình:**
1. GitHub Settings → Notifications
2. Enable "Actions" notifications

### Slack/Discord Notifications (Advanced):

Thêm vào cuối workflow:
```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🚀 Advanced: Deploy theo Environments

### Tạo nhiều environments (dev, staging, production):

```yaml
on:
  push:
    branches:
      - main        # → production
      - staging     # → staging
      - develop     # → development

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: 
      name: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
    
    steps:
      # Deploy với secrets khác nhau theo environment
```

**Setup:**
1. Settings → Environments
2. Tạo environments: production, staging
3. Add secrets riêng cho mỗi environment

---

## 📝 Checklist Hoàn Thành

- [ ] Đã tạo SSH key
- [ ] Public key đã được thêm vào VPS
- [ ] Test SSH connection thành công
- [ ] Đã thêm 6 secrets vào GitHub
- [ ] Đã chọn workflow (deploy.yml hoặc deploy-rsync.yml)
- [ ] Đã push code lên GitHub
- [ ] Workflow chạy thành công (check tab Actions)
- [ ] Website tự động cập nhật sau khi push

---

## 🎓 Tài Liệu Tham Khảo

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SSH Action](https://github.com/appleboy/ssh-action)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## 💡 Tips & Tricks

### 1. Deploy chỉ khi test pass:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test  # hoặc test command của bạn
  
  deploy:
    needs: test  # Chỉ deploy khi test pass
    runs-on: ubuntu-latest
    steps:
      # ... deploy steps
```

### 2. Deploy với tag:

```yaml
on:
  push:
    tags:
      - 'v*'  # Deploy khi push tag v1.0.0, v2.0.0...
```

### 3. Skip deploy với commit message:

```yaml
jobs:
  deploy:
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    # ...
```

Sau đó commit với: `git commit -m "Update README [skip ci]"`

### 4. Thời gian deploy:

Thêm vào workflow để track thời gian:
```yaml
- name: Deployment start time
  run: echo "DEPLOY_START=$(date +%s)" >> $GITHUB_ENV
  
# ... deploy steps ...

- name: Deployment duration
  run: |
    DEPLOY_END=$(date +%s)
    DURATION=$((DEPLOY_END - DEPLOY_START))
    echo "⏱️ Deployment took $DURATION seconds"
```

---

**Chúc bạn setup thành công! 🎉**

Sau khi setup xong, mỗi lần `git push` là website tự động cập nhật!

Need help? Check the **Actions** tab trên GitHub để xem logs chi tiết.

