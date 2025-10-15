# 🐸 Frogs - Pathfinding Visualizer

Một ứng dụng web tương tác để visualize các thuật toán tìm đường (pathfinding algorithms) với 2 con ếch di chuyển đến đích.

![Project Preview](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Tính Năng

- 🎮 **Interactive Grid** - Vẽ tường, đặt điểm đích bằng chuột
- 🧠 **Custom Algorithm** - Viết và test thuật toán của riêng bạn
- 👀 **Step-by-step Mode** - Xem từng bước thực thi của thuật toán
- 🎬 **Replay System** - Xem lại quá trình tìm đường
- 🏗️ **Maze Generator** - Tự động tạo mê cung ngẫu nhiên
- 📊 **Visual States** - Hiển thị trạng thái: visited, exploring, path...
- ⌨️ **Keyboard Shortcuts** - Điều khiển nhanh bằng phím tắt
- 📱 **Responsive Design** - Hoạt động tốt trên mọi thiết bị

## 🚀 Cài Đặt & Chạy Local

### Yêu cầu
Chỉ cần một trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge...)

### Chạy dự án

1. Clone repository:
```bash
git clone https://github.com/yourusername/frogs.git
cd frogs
```

2. Mở file `index.html` bằng trình duyệt:
```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Hoặc dùng Live Server:
```bash
# Nếu có Python
python3 -m http.server 8000

# Nếu có Node.js
npx serve .

# Sau đó mở http://localhost:8000
```

## 📖 Hướng Dẫn Sử Dụng

### Điều khiển cơ bản:

- **Click trái** - Vẽ/xóa tường
- **Click phải** - Đặt điểm đích (🏁)
- **Enter** - Chạy thuật toán
- **Shift+Enter** - Chạy từng bước
- **Space** - Bước tiếp theo (khi ở chế độ step)
- **R** - Reset grid
- **W** - Random walls
- **H** - Hiển thị hướng dẫn

### Viết thuật toán:

1. Chuyển sang tab **Source Code**
2. Viết code JavaScript sử dụng API:
   - `api.gridSize` - Kích thước grid
   - `api.FROG1_START, api.FROG2_START` - Vị trí bắt đầu
   - `api.DESTINATION` - Vị trí đích
   - `api.isValid(row, col)` - Kiểm tra ô hợp lệ
   - `api.visualize(type, row, col)` - Visualize trạng thái
   - `api.step()` - Pause cho step mode

3. Return kết quả:
```javascript
return {
    distance: 10,
    path: [[r1, c1, r2, c2], ...]
}
```

## 📦 Deploy Lên VPS

> **📚 [Xem tất cả tài liệu](docs/DEPLOYMENT_INDEX.md)** | **🔄 [So sánh phương pháp](docs/DEPLOYMENT_COMPARISON.md)** | **🔧 [Troubleshooting](docs/TROUBLESHOOTING.md)**
> 
> **🌐 Domain:** [Setup frogs.noteflix.tech](docs/SUBDOMAIN_SETUP.md)

### Cách 1: GitHub Actions - Auto Deploy 🤖 (Khuyến nghị nhất)

**Deploy tự động mỗi khi push code!**

```bash
# Setup một lần duy nhất
# Xem hướng dẫn chi tiết trong GITHUB_ACTIONS_SETUP.md

# Sau đó chỉ cần:
git add .
git commit -m "Update feature"
git push

# ✨ Website tự động cập nhật!
```

**Xem hướng dẫn:** [GITHUB_ACTIONS_SETUP.md](docs/GITHUB_ACTIONS_SETUP.md)

### Cách 2: Deploy Script - Semi-Auto

1. **Cài đặt VPS** (chạy trên VPS):
```bash
wget https://raw.githubusercontent.com/yourusername/frogs/main/setup-vps.sh
sudo bash setup-vps.sh
```

2. **Deploy từ máy local**:
```bash
./deploy.sh
# Script sẽ hỏi thông tin VPS lần đầu
```

### Cách 3: Manual Deploy

Xem hướng dẫn chi tiết trong [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

**Quick Steps:**
```bash
# 1. SSH vào VPS
ssh root@your-vps-ip

# 2. Cài Nginx
sudo apt update && sudo apt install nginx -y

# 3. Upload code
# (Trên máy local)
scp -r ./* root@your-vps-ip:/var/www/frogs/

# 4. Cấu hình Nginx
sudo nano /etc/nginx/sites-available/frogs
# Copy nội dung từ nginx-config-template.conf

# 5. Kích hoạt
sudo ln -s /etc/nginx/sites-available/frogs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🛠️ Cấu Trúc Dự Án

```
frogs/
├── index.html              # File HTML chính
├── style.css               # Styles
├── script.js               # JavaScript chính
├── sample.js               # Sample algorithm (nếu có)
├── README.md               # File này
├── DEPLOYMENT_GUIDE.md     # Hướng dẫn deploy chi tiết
├── deploy.sh               # Script deploy tự động
├── setup-vps.sh            # Script cài đặt VPS
└── nginx-config-template.conf  # Template Nginx config
```

## 🎯 Các Thuật Toán Mẫu

Dự án đi kèm với thuật toán BFS (Breadth-First Search) để tìm đường ngắn nhất cho 2 con ếch.

Bạn có thể thử implement:
- **A\*** - Tìm đường thông minh hơn với heuristic
- **Dijkstra** - Tìm đường ngắn nhất có trọng số
- **DFS** - Depth-First Search
- **Greedy Best-First** - Tham lam về phía đích

## 📋 To-Do List

- [ ] Thêm nhiều thuật toán mẫu
- [ ] Import/Export algorithm code
- [ ] Thêm animation settings
- [ ] Multiple destination support
- [ ] Weighted cells (chi phí di chuyển khác nhau)
- [ ] Dark mode
- [ ] Share algorithm via URL

## 🤝 Đóng Góp

Contributions, issues và feature requests đều được chào đón!

1. Fork project
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

This project is [MIT](LICENSE) licensed.

## 👨‍💻 Tác Giả

**Nguyen Cong**

## 🙏 Credits

- Inspired by Pathfinding Visualizer projects
- Icons: Unicode Emoji
- Fonts: System fonts

---

**Enjoy coding! 🚀**

Nếu thấy dự án hữu ích, hãy cho một ⭐️ nhé!
