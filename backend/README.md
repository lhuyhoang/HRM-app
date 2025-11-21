# HRM Application - Backend API

Backend RESTful API cho ứng dụng quản lý nhân sự (HRM) được xây dựng theo mô hình MVC với PHP và MySQL.

## 🏗️ Kiến trúc

### Mô hình MVC
- **Models**: Xử lý logic dữ liệu và tương tác với MySQL
- **Controllers**: Xử lý yêu cầu từ frontend và điều phối logic
- **Views**: Trả về dữ liệu JSON (không có giao diện HTML)

### Công nghệ sử dụng
- PHP 8.0+
- MySQL 5.7+ / MariaDB 10.2+
- PDO cho database operations
- JWT cho authentication
- RESTful API architecture

## 📁 Cấu trúc thư mục

```
backend/
├── config/
│   ├── Config.php          # Cấu hình ứng dụng
│   └── Database.php        # Kết nối database (Singleton)
├── models/
│   ├── BaseModel.php       # Model cơ sở với CRUD operations
│   ├── UserModel.php       # Xử lý users & authentication
│   ├── DepartmentModel.php # Xử lý phòng ban
│   ├── PositionModel.php   # Xử lý vị trí/chức danh
│   ├── EmployeeModel.php   # Xử lý nhân viên
│   ├── SalaryModel.php     # Xử lý lương
│   ├── AttendanceModel.php # Xử lý chấm công
│   ├── LeaveModel.php      # Xử lý nghỉ phép
│   ├── PerformanceModel.php# Xử lý đánh giá hiệu suất
│   └── DashboardModel.php  # Thống kê tổng quan
├── controllers/
│   ├── BaseController.php        # Controller cơ sở
│   ├── AuthController.php        # Login/Register/Logout
│   ├── DepartmentController.php  # CRUD Departments
│   ├── PositionController.php    # CRUD Positions
│   ├── EmployeeController.php    # CRUD Employees
│   ├── SalaryController.php      # Quản lý lương
│   ├── AttendanceController.php  # Quản lý chấm công
│   ├── LeaveController.php       # Quản lý nghỉ phép
│   ├── PerformanceController.php # Quản lý đánh giá
│   └── DashboardController.php   # Thống kê
├── middleware/
│   └── AuthMiddleware.php  # JWT authentication
├── utils/
│   ├── JWTHandler.php      # JWT encode/decode
│   ├── Response.php        # Standardized API responses
│   └── Validator.php       # Input validation
├── index.php               # API Router (entry point)
├── .htaccess              # URL rewriting
├── database.sql           # Database schema & sample data
├── API_DOCUMENTATION.md   # API documentation
└── README.md             # This file
```

## 🚀 Cài đặt

### 1. Yêu cầu hệ thống
- XAMPP/WAMP/MAMP với PHP 8.0+
- MySQL 5.7+ hoặc MariaDB 10.2+
- Apache với mod_rewrite enabled

### 2. Cài đặt database

```bash
mysql -u root -p

mysql -u root -p < backend/database.sql
```

Hoặc sử dụng phpMyAdmin:
1. Mở http://localhost/phpmyadmin
2. Tạo database mới tên `hrm_app`
3. Import file `backend/database.sql`

### 3. Cấu hình

Chỉnh sửa file `backend/config/Database.php` nếu cần:

```php
private $host = 'localhost';
private $db_name = 'hrm_app';
private $username = 'root';
private $password = '';  // Thay đổi nếu có password
```

Chỉnh sửa file `backend/config/Config.php` nếu cần:

```php
// JWT Secret Key - Thay đổi trong production
const JWT_SECRET_KEY = 'your-secret-key-change-this-in-production-2024';

// Token expiration time (seconds)
const JWT_EXPIRATION = 3600; // 1 hour

// CORS - Thay đổi trong production
const ALLOW_ORIGIN = '*'; // Hoặc 'http://yourdomain.com'
```

### 4. Cấu hình Apache

Đảm bảo mod_rewrite được bật trong Apache:

**Windows (XAMPP)**:
1. Mở `xampp/apache/conf/httpd.conf`
2. Tìm và uncomment: `LoadModule rewrite_module modules/mod_rewrite.so`
3. Restart Apache

File `.htaccess` đã được tạo sẵn trong thư mục backend.

### 5. Test API

Kiểm tra API hoạt động:

```bash
# Test endpoint
curl http://localhost/hrmapp/backend/api/auth/login

# Nếu nhận được response JSON -> API hoạt động!
```

## 📖 Sử dụng API

### Authentication

#### 1. Login
```bash
curl -X POST http://localhost/hrmapp/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response:
```json
{
  "success": true,
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "username": "admin",
      "full_name": "Administrator"
    }
  }
}
```

#### 2. Sử dụng Token

Sau khi login, sử dụng token trong header:

```bash
curl -X GET http://localhost/hrmapp/backend/api/departments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Tài khoản mặc định

- **Username**: `admin`
- **Password**: `admin123`

## 🗂️ Database Schema

### Bảng chính

1. **users** - Tài khoản đăng nhập
2. **departments** - Phòng ban
3. **positions** - Vị trí/Chức danh (liên kết với departments)
4. **employees** - Nhân viên (liên kết với departments và positions)
5. **salaries** - Lương (liên kết với employees)
6. **attendance** - Chấm công (liên kết với employees)
7. **leaves** - Nghỉ phép (liên kết với employees)
8. **performance_reviews** - Đánh giá hiệu suất (liên kết với employees)

### Relationships

```
departments (1) ----< (N) positions
     |                      |
     |                      |
     └─────< employees >────┘
                |
                ├──── salaries (1:1)
                ├──── attendance (1:N)
                ├──── leaves (1:N)
                └──── performance_reviews (1:N)
```

## 🔐 Security Features

1. **Password Hashing**: Sử dụng `password_hash()` với bcrypt
2. **JWT Authentication**: Token-based authentication với expiration
3. **SQL Injection Prevention**: Sử dụng PDO prepared statements
4. **XSS Protection**: Input sanitization
5. **CORS Headers**: Cấu hình CORS cho frontend
6. **Input Validation**: Comprehensive validation cho tất cả inputs

## 🎯 API Endpoints

Xem chi tiết trong file `API_DOCUMENTATION.md`

### Tổng quan:

- **Auth**: `/api/auth/*` - Login, Register, Logout, Verify
- **Departments**: `/api/departments` - CRUD phòng ban
- **Positions**: `/api/positions` - CRUD vị trí
- **Employees**: `/api/employees` - CRUD nhân viên + search
- **Salaries**: `/api/salaries` - Quản lý lương + payroll
- **Attendance**: `/api/attendance` - Chấm công + summary
- **Leaves**: `/api/leaves` - Nghỉ phép + approval
- **Performance**: `/api/performance` - Đánh giá + statistics
- **Dashboard**: `/api/dashboard/*` - Stats, distribution, activities

## 🛠️ OOP Features

### 1. Classes & Inheritance
```php
BaseModel (abstract)
    ├── UserModel extends BaseModel
    ├── EmployeeModel extends BaseModel
    └── ... (các models khác)

BaseController (abstract)
    ├── AuthController extends BaseController
    ├── EmployeeController extends BaseController
    └── ... (các controllers khác)
```

### 2. Encapsulation
- Private properties với getters/setters
- Protected methods trong base classes
- Database connection singleton

### 3. Polymorphism
- Override methods trong subclasses
- Dynamic method resolution

### 4. Abstraction
- Abstract base classes
- Interface-like design patterns

## 🧪 Testing

### Manual Testing với cURL

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost/hrmapp/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.token')

# 2. Get departments
curl -X GET http://localhost/hrmapp/backend/api/departments \
  -H "Authorization: Bearer $TOKEN"

# 3. Create department
curl -X POST http://localhost/hrmapp/backend/api/departments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Dept","description":"Test"}'
```

### Testing với Postman

1. Import collection từ API_DOCUMENTATION.md
2. Tạo environment variable `base_url` = `http://localhost/hrmapp/backend/api`
3. Tạo environment variable `token` sau khi login
4. Test các endpoints

## 🐛 Troubleshooting

### Lỗi 404 Not Found
- Kiểm tra mod_rewrite đã bật
- Kiểm tra file `.htaccess` tồn tại
- Kiểm tra base path trong `index.php`

### Lỗi Database Connection
- Kiểm tra MySQL đang chạy
- Kiểm tra credentials trong `Database.php`
- Kiểm tra database `hrm_app` đã được tạo

### Lỗi CORS
- Kiểm tra CORS headers trong `Config.php`
- Đảm bảo frontend và backend chạy đúng domain/port

### Token không hợp lệ
- Kiểm tra token chưa hết hạn (1 hour)
- Kiểm tra format header: `Authorization: Bearer <token>`
- Kiểm tra JWT_SECRET_KEY khớp

## 📚 Modules (12+)

1. **AuthModule** - Authentication & Authorization
2. **UserModule** - User Management
3. **DepartmentModule** - Department Management
4. **PositionModule** - Position Management
5. **EmployeeModule** - Employee Management
6. **EmployeeSearchModule** - Employee Search
7. **SalaryModule** - Salary Management
8. **AttendanceModule** - Attendance Tracking
9. **LeaveModule** - Leave Management
10. **PerformanceModule** - Performance Reviews
11. **DashboardModule** - Dashboard & Statistics
12. **ReportModule** - Payroll & Reports

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "status": 200,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "status": 400,
  "message": "Error message",
  "errors": [ ... ]
}
```

## 📝 License

MIT License - Dự án học tập

## 👨‍💻 Development

### Code Style
- PSR-12 coding standards
- Camel case cho methods/variables
- Pascal case cho class names
- Clear naming conventions

### Git Workflow
```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

## 🚀 Deployment

### Production Checklist

- [ ] Thay đổi JWT_SECRET_KEY
- [ ] Thay đổi database credentials
- [ ] Cấu hình CORS cho domain cụ thể
- [ ] Disable error display
- [ ] Enable HTTPS
- [ ] Backup database
- [ ] Test tất cả endpoints
- [ ] Monitor logs

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Apache/PHP error logs
2. MySQL error logs
3. Browser console (CORS errors)
4. API_DOCUMENTATION.md

---

**Happy Coding! 🎉**
