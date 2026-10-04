# Sổ tay xử lý sự cố — Hire-Host (bootnode.cloud)

Tài liệu tổng hợp lỗi đã gặp, cách fix, và phương pháp khoanh vùng lỗi
từ tầng thấp (DB) đến tầng cao (người dùng) cho hệ thống Docker Compose:
`frontend (Nginx)` → `backend (Spring Boot)` → `MySQL`, phía trước là `Cloudflare`.

---

## I. Kiến trúc luồng request

```
Người dùng (điện thoại/PC)
   → DNS / Cloudflare            (172.67.x)
      → Nginx frontend           (container web_rental_frontend, port 80)
         → Backend Spring Boot   (container web_rental_backend, port 8081)
            → MySQL              (container web_rental_mysql, port 3306)
            → Redis              (container web_rental_redis)
```

Tầng nào đứt thì tầng trên báo lỗi **chung chung** (502 / dialect / connection
refused). Vì vậy phải **bóc từng lớp** để tìm chặng đứt.

---

## II. Các lỗi đã sửa trong code

| # | Lỗi | Cách fix |
|---|-----|----------|
| 1 | Payment tin `amount` người dùng gửi | Lấy số tiền từ `order.totalPrice`; lệch → HTTP 400 |
| 2 | BANKING/VNPAY/CASH tự duyệt + cấp host | Tạo payment `PENDING`, admin phải xác nhận; thêm endpoint + nút admin |
| 3 | Deploy không giới hạn email | Allowlist domain/email (mặc định `student.ctu.edu.vn`), giữ quyền cho site đã tồn tại |
| 4 | Double-charge / đơn hủy vẫn xác nhận được | Khoá bi quan, chặn trạng thái, fail payment khi hủy đơn |
| 5 | Scheduler huỷ đơn thủ công sau 15 phút | Giữ đơn thủ công 24h (cấu hình qua `MANUAL_PENDING_TIMEOUT_MINUTES`) |

---

## III. Sự cố production & cách xử lý

| Hiện tượng | Nguyên nhân thật | Fix |
|-----------|------------------|-----|
| `git pull` báo "local changes would be overwritten" | `docker-compose.yml` trên server có sửa | `git pull --autostash` |
| Backend crash: `Unable to determine Dialect` | **Sai mật khẩu MySQL** (`Access denied`) | Reset mật khẩu root |
| `502 Bad Gateway` | (1) backend chết; (2) nginx cache IP backend cũ | Restart frontend + `nginx.conf` dùng `resolver` |
| Nguy cơ mất dữ liệu | Volume thật là `hire-host-new_mysql_data`, compose có thể trỏ `myweb_mysql_data` | Ghim tên volume |

### Lệnh fix nhanh

```bash
# git pull an toàn khi có sửa local
git pull --autostash

# 502 do nginx cache IP backend cũ
docker restart web_rental_frontend

# reset mật khẩu MySQL (giữ dữ liệu) — đổi đúng tên volume
docker stop web_rental_mysql
docker run --rm -d --name mysql-reset \
  -v hire-host-new_mysql_data:/var/lib/mysql \
  mysql:8.0 mysqld --skip-grant-tables
sleep 15
docker exec mysql-reset mysql -uroot -e \
  "FLUSH PRIVILEGES; ALTER USER 'root'@'%' IDENTIFIED BY '<MAT_KHAU_TRONG_ENV>';"
docker exec mysql-reset mysql -uroot -e \
  "ALTER USER 'root'@'localhost' IDENTIFIED BY '<MAT_KHAU_TRONG_ENV>';"
docker rm -f mysql-reset
docker start web_rental_mysql
docker restart web_rental_backend
```

---

## IV. Phương pháp khoanh vùng lỗi (từ thấp → cao)

### Nguyên tắc vàng
> Đừng tin thông báo lỗi bề mặt. Đọc dòng `Caused by` **sâu nhất**.
> Và **test từng chặng** để tìm chặng nào "đứt".

### Thang chẩn đoán 9 bước

**1. Xác nhận triệu chứng ngoài cùng.** Trình duyệt 502, remote address
Cloudflare (172.67.x) → lỗi ở origin.

**2. Test ngay trên server, bỏ Cloudflare.**
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/api/v1/announcements
```
- 200 → lỗi ở Cloudflare Tunnel.
- 502 → lỗi ở origin → đi tiếp.

**3. Backend có sống không?**
```bash
docker compose ps
docker logs --tail=40 web_rental_backend
```
- `Restarting`/`Exited` → nhảy Bước 6.
- `Started WebRentalApplication` → Bước 4.

**4. Bỏ nginx, test thẳng backend trong mạng docker.**
```bash
docker exec web_rental_frontend \
  curl -s -o /dev/null -w "%{http_code}\n" http://backend:8081/api/v1/announcements
```
- 200 → backend/DB ổn, lỗi ở nginx → Bước 5.
- Lỗi → backend/DB → Bước 6.

**5. Đọc log nginx để biết nó gọi ai.**
```bash
docker logs --tail=40 web_rental_frontend
```
Dạng lỗi:
```
connect() failed (111: Connection refused) ... upstream: "http://172.18.0.4:8081/..."
```
→ nginx gọi IP cũ. So với IP hiện tại:
```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' web_rental_backend
```
Khác → nginx cache IP → `docker restart web_rental_frontend`.

**6. Backend chết: đọc log từ dưới lên.**
```
Unable to determine Dialect without JDBC metadata
```
Đây là **hệ quả**. Truy tiếp `Caused by` sâu nhất:
```
Caused by: java.sql.SQLException: Access denied for user 'root'@'172.18.0.4' (using password: YES)
```
→ Thật ra là **sai mật khẩu MySQL**.

**7. Kiểm tra tầng DB — xác định volume + test đăng nhập.**
```bash
docker inspect web_rental_mysql --format '{{range .Mounts}}{{println .Type .Name .Destination}}{{end}}'
docker compose exec mysql-db mysql -uroot -p"$(grep '^MYSQL_ROOT_PASSWORD=' .env | cut -d= -f2-)" -e "SELECT 'OK'"
```

**8. So mật khẩu backend gửi vs DB nhận.**
```bash
docker inspect web_rental_backend --format '{{range .Config.Env}}{{println .}}{{end}}' | grep SPRING_DATASOURCE
```
Lưu ý: MySQL chỉ đọc `MYSQL_ROOT_PASSWORD` **một lần duy nhất lúc tạo volume**.
Đổi `.env` sau đó không đổi được mật khẩu DB.

**9. Fix tận gốc.** Reset mật khẩu root về đúng `.env` (xem mục III).

### Bảng suy luận nhanh

| Nếu... | ...thì lỗi nằm ở |
|--------|------------------|
| `docker exec curl backend` = 200, `curl localhost` = 502 | nginx ↔ backend (DNS/IP cache) |
| `curl localhost` = 200, URL công khai = 502 | Cloudflare ↔ nginx (tunnel) |
| backend crash, log có `Dialect` | tầng DB (đọc `Caused by`) |
| backend crash, log `Access denied` | mật khẩu/tài khoản DB |
| DB login OK nhưng backend vẫn lỗi | env/URL truyền vào container (`docker compose config`) |

> Tư duy: **bypass từng lớp** bằng cách gọi trực tiếp lớp bên trong.
> Chặng nào đổi từ lỗi sang OK khi bypass chính là chặng bị lỗi.

---

## V. Bộ lệnh tổng hợp

```bash
# Sức khỏe tổng quát
docker compose ps
docker compose logs --tail=40 web_rental_backend
docker logs --tail=40 web_rental_frontend

# Test từng tầng
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/api/v1/announcements
docker exec web_rental_frontend curl -s -o /dev/null -w "%{http_code}\n" http://backend:8081/api/v1/announcements

# IP & volume & env
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' web_rental_backend
docker inspect web_rental_mysql --format '{{range .Mounts}}{{println .Type .Name .Destination}}{{end}}'
docker inspect web_rental_backend --format '{{range .Config.Env}}{{println .}}{{end}}' | grep SPRING_DATASOURCE
docker compose config

# Fix nhanh
docker restart web_rental_frontend
```

---

## VI. Phòng tránh tái diễn

1. **Ghim tên volume** trong `docker-compose.yml` để không trỏ sang volume rỗng:
   ```yaml
   volumes:
     mysql_data:
       name: hire-host-new_mysql_data
   ```
2. **Không đổi** `MYSQL_ROOT_PASSWORD` sau khi đã tạo volume.
3. `nginx.conf` dùng `resolver 127.0.0.11` để tự cập nhật IP backend.
4. **Backup DB định kỳ** trước mọi thay đổi lớn.
