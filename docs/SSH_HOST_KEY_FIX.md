# 🔧 Quick Fix: SSH Host Key Changed

## ❌ Lỗi Bạn Gặp

```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Host key verification failed.
```

---

## ✅ Fix Ngay (30 giây)

### Cách 1: Xóa theo dòng (Nhanh nhất)

Nếu lỗi báo: `Offending ECDSA key in /Users/xxx/.ssh/known_hosts:24`

```bash
# macOS:
sed -i '' '24d' ~/.ssh/known_hosts

# Linux:
sed -i '24d' ~/.ssh/known_hosts
```
**Thay `24` bằng số dòng trong lỗi của bạn!**

---

### Cách 2: Xóa theo IP/hostname

```bash
# Thay YOUR_VPS_IP bằng IP thật (vd: 123.45.67.89)
ssh-keygen -R YOUR_VPS_IP
```

---

### Cách 3: Xóa hết (Nếu 2 cách trên không work)

```bash
rm ~/.ssh/known_hosts
```

---

## 🔄 SSH Lại

```bash
ssh root@YOUR_VPS_IP

# Lần đầu sẽ hỏi:
# Are you sure you want to continue connecting (yes/no)?

# Gõ: yes

# ✅ Done!
```

---

## ❓ Tại Sao Lỗi Này?

Lỗi này xảy ra khi:
- ✅ **VPS reinstall/rebuild** (phổ biến nhất - AN TOÀN)
- ✅ IP VPS thay đổi
- ✅ VPS restored từ backup
- ⚠️ Man-in-the-middle attack (rất hiếm)

**Nếu bạn vừa reinstall VPS → Hoàn toàn bình thường!**

---

## 🔒 Bảo Mật

### ✅ An toàn khi:
- Bạn vừa reinstall VPS
- Bạn vừa thay đổi VPS
- Provider thông báo về maintenance

### ⚠️ Cẩn thận khi:
- KHÔNG có thay đổi gì với VPS
- Xuất hiện đột ngột
- Liên hệ provider để confirm

---

## 📚 Các Lỗi Khác?

Xem đầy đủ: **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

---

**Fix xong rồi? Deploy thôi! 🚀**

