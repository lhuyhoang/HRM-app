# 🚀 HƯỚNG DẪN SETUP BACKEND - NHANH

## ✅ Các bước đã hoàn thành:

### 1. ✅ Import Database
```bash
C:\xampp\mysql\bin\mysql.exe -u root -e "SOURCE c:/xampp/htdocs/hrmapp/backend/database.sql"
```

### 2. ✅ Fix Admin Password
```bash
C:\xampp\mysql\bin\mysql.exe -u root -e "SOURCE c:/xampp/htdocs/hrmapp/backend/fix_password.sql"
```

### 3. ✅ Fix Routing Logic
File `index.php` đã được sửa để routing hoạt động đúng.

## 🎯 Backend đã HOẠT ĐỘNG!

### Test API:

#### 1. Login:
```powershell
$body = '{"username":"admin","password":"admin123"}'
$response = Invoke-RestMethod -Uri "http://localhost/hrmapp/backend/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.token
echo $token
```

#### 2. Get Departments:
```powershell
$headers = @{Authorization = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost/hrmapp/backend/api/departments" -Method Get -Headers $headers
```

#### 3. Get Employees:
```powershell
Invoke-RestMethod -Uri "http://localhost/hrmapp/backend/api/employees" -Method Get -Headers $headers
```

## 📊 Dữ liệu có sẵn:

- **Users**: 1 admin account
  - Username: `admin`
  - Password: `admin123`

- **Departments**: 5 phòng ban
- **Positions**: 10 vị trí
- **Employees**: 10 nhân viên
- **Salaries**: 10 records
- **Attendance**: Multiple records
- **Leaves**: 4 leave requests
- **Performance Reviews**: 10 reviews

## 🌐 API Endpoints:

Base URL: `http://localhost/hrmapp/backend/api`

### Authentication:
- POST `/auth/login` - Login
- POST `/auth/register` - Register
- POST `/auth/logout` - Logout
- GET `/auth/verify` - Verify token

### Resources (Require Auth):
- `/departments` - CRUD operations
- `/positions` - CRUD operations
- `/employees` - CRUD + search
- `/salaries` - View & update
- `/attendance` - CRUD + summary
- `/leaves` - CRUD + approval
- `/performance` - CRUD + statistics
- `/dashboard/stats` - Dashboard data

## 🔧 Troubleshooting:

### Nếu gặp lỗi 404:
1. Kiểm tra Apache đang chạy
2. Kiểm tra mod_rewrite enabled
3. Kiểm tra file `.htaccess` tồn tại

### Nếu gặp lỗi Database:
1. Kiểm tra MySQL đang chạy
2. Import lại database.sql
3. Kiểm tra credentials trong `config/Database.php`

### Nếu gặp lỗi Login:
1. Chạy lại fix_password.sql
2. Kiểm tra username/password

## 📁 Files Utilities:

- `test.php` - Test backend setup
- `debug.php` - Debug routing
- `fix_password.sql` - Fix admin password

## ✨ Next Steps:

1. Test tất cả endpoints trong Postman
2. Kết nối frontend với backend
3. Replace localStorage calls với API calls
4. Update frontend để sử dụng JWT token

## 🎉 All Done!

Backend của bạn đã sẵn sàng sử dụng!

Xem chi tiết API trong file: `API_DOCUMENTATION.md`
