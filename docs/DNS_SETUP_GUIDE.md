# 🌐 DNS Setup Guide - frogs.noteflix.tech

Hướng dẫn cấu hình DNS cho subdomain `frogs.noteflix.tech`.

---

## ⚡ Quick Setup

### Thông tin DNS cần thêm:

```
Type: A
Name: frogs
Value: [IP_VPS_CỦA_BẠN]
TTL: 3600
```

**Thay `[IP_VPS_CỦA_BẠN]` bằng IP thật!**

---

## 📋 Chi Tiết Từng Bước

### Bước 1: Đăng nhập vào trang quản lý domain

Truy cập trang quản lý của **noteflix.tech** (nơi bạn mua domain).

Các nhà cung cấp phổ biến:
- **GoDaddy:** DNS Management
- **Namecheap:** Advanced DNS
- **Cloudflare:** DNS
- **Google Domains:** DNS
- **Các nhà VN:** Quản lý DNS / Zone File

---

### Bước 2: Thêm DNS Record

#### Cách 1: Qua giao diện web (phổ biến nhất)

**Tìm phần DNS Records / DNS Management**

**Thêm record mới:**

| Field | Value | Ghi chú |
|-------|-------|---------|
| **Type** | `A` | Bắt buộc phải là A record |
| **Name** | `frogs` | KHÔNG phải `frogs.noteflix.tech` |
| **Value/IP** | `123.45.67.89` | IP VPS của bạn |
| **TTL** | `3600` hoặc `Auto` | 1 giờ (có thể để mặc định) |

**Screenshot ví dụ (các provider khác nhau):**

**GoDaddy:**
```
Type: A
Name: frogs
Value: 123.45.67.89
TTL: 1 Hour
```

**Namecheap:**
```
Type: A Record
Host: frogs
Value: 123.45.67.89
TTL: Automatic
```

**Cloudflare:**
```
Type: A
Name: frogs
IPv4 address: 123.45.67.89
TTL: Auto
Proxy status: DNS only (cloud màu xám)
```

---

#### Cách 2: Qua file Zone (Advanced)

Nếu provider cho phép edit Zone file:

```bind
frogs.noteflix.tech.    IN    A    123.45.67.89
```

Hoặc:
```bind
frogs    3600    IN    A    123.45.67.89
```

---

### Bước 3: Lưu thay đổi

- Click **Save** / **Add Record** / **Save Changes**
- Một số provider cần click thêm **Apply Changes**

---

### Bước 4: Đợi DNS propagate

**Thời gian:**
- Nhanh: 5-15 phút
- Trung bình: 30 phút - 2 giờ
- Chậm: Tối đa 24-48 giờ (hiếm)

**TTL (Time To Live) ảnh hưởng:**
- TTL 300 (5 phút) → Update nhanh
- TTL 3600 (1 giờ) → Standard
- TTL 86400 (24 giờ) → Update chậm

---

## ✅ Kiểm Tra DNS

### Kiểm tra từ terminal:

```bash
# Cách 1: ping
ping frogs.noteflix.tech
# Phải trả về IP VPS của bạn

# Cách 2: dig (chi tiết)
dig frogs.noteflix.tech
# Xem phần ANSWER SECTION

# Cách 3: nslookup
nslookup frogs.noteflix.tech
# Phải hiển thị IP VPS

# Cách 4: dig với DNS server cụ thể
dig frogs.noteflix.tech @8.8.8.8
# Test với Google DNS
```

### Kiểm tra online:

**Các tools online:**
- https://dnschecker.org
  - Nhập: `frogs.noteflix.tech`
  - Type: `A`
  - Check từ nhiều locations

- https://www.whatsmydns.net
  - Nhập: `frogs.noteflix.tech`
  - Type: `A`

- https://mxtoolbox.com/DNSLookup.aspx
  - Nhập: `frogs.noteflix.tech`

---

## 🔧 Troubleshooting

### ❌ DNS không resolve

**Vấn đề:** `ping frogs.noteflix.tech` không trả về IP

**Checklist:**

1. **Kiểm tra Name field:**
   - ✅ Đúng: `frogs`
   - ❌ Sai: `frogs.noteflix.tech`
   - ❌ Sai: `@`
   - ❌ Sai: `www.frogs`

2. **Kiểm tra Type:**
   - ✅ Đúng: `A`
   - ❌ Sai: `CNAME`, `MX`, `TXT`

3. **Kiểm tra Value/IP:**
   - Phải là IP address (vd: `123.45.67.89`)
   - KHÔNG phải domain name

4. **Đã Save chưa?**
   - Một số provider cần 2 bước: Add → Save

5. **Đợi thêm:**
   - Đợi ít nhất 15-30 phút
   - Clear DNS cache trên máy local

---

### ❌ DNS resolve nhưng sai IP

**Nguyên nhân:** Cache DNS cũ

**Giải pháp:**

```bash
# Clear DNS cache - macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Clear DNS cache - Windows
ipconfig /flushdns

# Clear DNS cache - Linux
sudo systemd-resolve --flush-caches
# hoặc
sudo service nscd restart
```

**Hoặc đợi TTL expire** (thường 1 giờ)

---

### ❌ Chỉ resolve được từ một số locations

**Nguyên nhân:** DNS chưa propagate hết

**Giải pháp:**
- Đợi thêm thời gian
- Check trên https://dnschecker.org

---

### ❌ Provider không cho phép thêm subdomain

**Rất hiếm, nhưng nếu gặp:**

**Giải pháp 1:** Dùng Cloudflare (Free DNS)
1. Add domain vào Cloudflare
2. Update nameservers
3. Quản lý DNS trên Cloudflare

**Giải pháp 2:** Dùng IP trực tiếp
- Deploy với IP thay vì domain
- Không có SSL từ Let's Encrypt

---

## 🎓 Hiểu Thêm Về DNS

### A Record là gì?

**A Record** (Address Record):
- Map domain/subdomain → IP address
- Chỉ cho IPv4
- Ví dụ: `frogs.noteflix.tech` → `123.45.67.89`

### TTL là gì?

**TTL** (Time To Live):
- Thời gian cache DNS record
- Đơn vị: giây
- 3600 = 1 giờ
- Càng thấp = update càng nhanh (nhưng tốn băng thông)

### DNS Propagation là gì?

**DNS Propagation:**
- Quá trình update DNS trên toàn thế giới
- DNS servers cache records theo TTL
- Vì thế cần thời gian để update hết

---

## 📊 Common DNS Records (Tham khảo)

| Type | Mục đích | Ví dụ |
|------|----------|-------|
| **A** | Domain → IPv4 | `frogs.noteflix.tech` → `123.45.67.89` |
| **AAAA** | Domain → IPv6 | `frogs.noteflix.tech` → `2001:db8::1` |
| **CNAME** | Alias → Domain | `www.frogs` → `frogs.noteflix.tech` |
| **MX** | Email server | `noteflix.tech` → `mail.noteflix.tech` |
| **TXT** | Text info | SPF, DKIM, verification |

**Lưu ý:** Cho subdomain `frogs`, chỉ cần **A record**!

---

## ✅ After DNS Setup

Sau khi DNS đã resolve:

1. **Setup Nginx:** [SUBDOMAIN_SETUP.md](SUBDOMAIN_SETUP.md)
2. **Install SSL:** `sudo certbot --nginx -d frogs.noteflix.tech`
3. **Deploy code:** GitHub Actions hoặc manual
4. **Test:** https://frogs.noteflix.tech

---

## 💡 Pro Tips

### 1. Lower TTL before making changes:
```
Trước khi update DNS:
- Set TTL = 300 (5 phút)
- Đợi 1 TTL period
- Update record
- Đợi propagate
- Set TTL về 3600
```

### 2. Use Cloudflare for faster updates:
- Cloudflare propagates trong vài phút
- Free SSL included
- DDoS protection

### 3. Test với nhiều DNS servers:
```bash
dig frogs.noteflix.tech @8.8.8.8        # Google
dig frogs.noteflix.tech @1.1.1.1        # Cloudflare
dig frogs.noteflix.tech @208.67.222.222 # OpenDNS
```

---

## 🆘 Need Help?

**Common issues:**
- Wrong Name field → Use `frogs` not `frogs.noteflix.tech`
- Wrong Type → Must be `A`
- Not saved → Click Save/Apply
- Cache → Clear local DNS cache

**Still stuck?**
- Screenshot DNS settings
- Check with `dig frogs.noteflix.tech`
- Wait at least 30 minutes
- Contact domain provider support

---

**Next:** [SUBDOMAIN_SETUP.md](SUBDOMAIN_SETUP.md) - Complete setup guide

---

**Good luck! 🚀**

Your subdomain will be: **frogs.noteflix.tech**

