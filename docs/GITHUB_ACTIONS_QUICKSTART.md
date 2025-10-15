# ⚡ GitHub Actions - Quick Start

Deploy tự động trong 10 phút!

## 🎯 Mục tiêu

Sau khi setup xong:
```bash
git push
```
→ Website tự động cập nhật! 🚀

---

## 📋 Chuẩn Bị

Bạn cần:
- ✅ VPS đã cài Nginx (chạy `setup-vps.sh` nếu chưa)
- ✅ Repository trên GitHub
- ✅ 10 phút thời gian

---

## 🚀 Setup (4 bước)

### 1️⃣ Tạo SSH Key

**Trên máy local:**
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions -N ""
```

### 2️⃣ Copy Public Key lên VPS

```bash
# Hiển thị public key
cat ~/.ssh/github_actions.pub

# SSH vào VPS
ssh root@YOUR_VPS_IP

# Thêm vào authorized_keys
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys

# Exit VPS
exit
```

### 3️⃣ Thêm Secrets vào GitHub

1. Mở repo trên GitHub
2. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Thêm 6 secrets:

| Secret Name | Value | Ví dụ |
|-------------|-------|-------|
| `VPS_HOST` | IP VPS của bạn | `123.45.67.89` |
| `VPS_USERNAME` | Username SSH | `root` |
| `VPS_SSH_KEY` | Private key (xem bên dưới) | `-----BEGIN...` |
| `VPS_PORT` | Port SSH | `22` |
| `DEPLOY_PATH` | Đường dẫn trên VPS | `/var/www/frogs` |
| `REPO_URL` | URL repository | `https://github.com/user/frogs.git` |

**Lấy VPS_SSH_KEY:**
```bash
cat ~/.ssh/github_actions
# Copy TOÀN BỘ output (bao gồm cả BEGIN và END)
```

### 4️⃣ Push Code

```bash
cd /Users/nguyencong/Workspace/frogs

git add .
git commit -m "Setup GitHub Actions"
git push origin main
```

**Vào tab Actions trên GitHub để xem deploy progress!** 🎉

---

## ✅ Test Connection Trước

Trước khi deploy thật, test SSH connection:

1. Tab **Actions** trên GitHub
2. Chọn **Test VPS Connection**
3. Click **Run workflow**
4. Nếu thấy ✅ = thành công!

---

## 🎯 Sử Dụng

### Deploy:
```bash
# Làm thay đổi trong code
git add .
git commit -m "Your message"
git push

# GitHub Actions tự động deploy!
```

### Xem logs:
- Tab **Actions** → Click workflow run mới nhất

### Deploy manual:
- Tab **Actions** → **Deploy to VPS** → **Run workflow**

---

## 🐛 Gặp Lỗi?

### Test SSH local trước:
```bash
ssh -i ~/.ssh/github_actions root@YOUR_VPS_IP
```

Nếu không kết nối được → Kiểm tra lại Bước 2

### Workflow failed:
1. Tab Actions → Click vào failed run
2. Xem logs để tìm lỗi
3. Thường gặp:
   - **Permission denied**: Public key chưa đúng → Làm lại Bước 2
   - **Host key verification**: Thêm vào workflow (đã có sẵn)
   - **nginx not found**: Chạy `setup-vps.sh` trên VPS

---

## 📚 Chi Tiết Đầy Đủ

Xem [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) để:
- Hiểu chi tiết từng bước
- Advanced configurations
- Security best practices
- Troubleshooting đầy đủ

---

## 🎉 Kết Quả

Sau khi setup xong:
- ✅ Mỗi lần `git push` → Website tự động cập nhật
- ✅ Không cần SSH vào VPS nữa
- ✅ Deployment history trên GitHub
- ✅ Rollback dễ dàng bằng `git revert`

**Happy deploying! 🚀**

