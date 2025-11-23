# HRM Application - Hệ thống Quản lý Nhân sự

Version: 1.0.0 | PHP 8.0+ | MySQL 8.0+ | License: MIT

Hệ thống quản lý nhân sự toàn diện với các chức năng: quản lý nhân viên, phòng ban, vị trí, bảng lương, chấm công, nghỉ phép và đánh giá hiệu suất.

==================================

## MỤC LỤC

- [Tính năng](#tính-năng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Cách sử dụng](#cách-sử-dụng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Xử lý lỗi](#xử-lý-lỗi)
- [Bảo mật](#bảo-mật)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

==================================

## TÍNH NĂNG

### Xác thực & Phân quyền
- Đăng nhập/Đăng ký với JWT Authentication
- Bảo vệ API với AuthMiddleware
- Token tự động làm mới
- Đăng xuất an toàn

### Quản lý Nhân viên
- CRUD nhân viên (Thêm, Sửa, Xóa, Xem)
- Tìm kiếm và lọc nhân viên
- Liên kết với phòng ban và vị trí
- Quản lý thông tin lương

### Quản lý Phòng ban
- CRUD phòng ban
- Thống kê số lượng nhân viên theo phòng ban
- Kiểm tra ràng buộc trước khi xóa

### Quản lý Vị trí
- CRUD vị trí công việc
- Gán nhiều phòng ban cho một vị trí (Many-to-Many)
- Quản lý lương cơ bản theo vị trí

### Quản lý Bảng lương
- Payroll: Tính toán lương (cơ bản + thưởng - khấu trừ)
- Salary Payment: Quản lý thanh toán lương
- Trạng thái: Đợi duyệt -> Đã duyệt -> Đã thanh toán
- Lịch sử lương theo tháng/năm

### Quản lý Chấm công
- Chấm công theo phòng ban và ngày
- Trạng thái: Có mặt, Vắng mặt, Đi trễ, Làm từ xa
- Thống kê chấm công theo ngày
- Ghi chú cho từng bản ghi

### Quản lý Nghỉ phép
- Tạo đơn xin nghỉ
- Duyệt/Từ chối đơn nghỉ
- Kiểm tra trùng lịch nghỉ
- Lịch sử nghỉ phép

### Đánh giá Hiệu suất
- Đánh giá nhân viên theo kỳ
- 4 mức độ: Xuất sắc, Tốt, Trung bình, Kém
- Ghi chú chi tiết
- Lịch sử đánh giá

### Dashboard & Thống kê
- Tổng quan hệ thống (nhân viên, phòng ban, vị trí)
- Thống kê chấm công theo ngày
- Danh sách phòng ban với số lượng nhân viên

==================================

## YÊU CẦU HỆ THỐNG

### Backend
- PHP >= 8.0
- MySQL >= 8.0 hoặc MariaDB >= 10.5
- Apache/Nginx với mod_rewrite
- PDO Extension
- JSON Extension

### Frontend
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- LocalStorage support

### Development
- XAMPP/WAMP/LAMP (khuyến nghị XAMPP)
- Git (optional)
- VS Code hoặc PhpStorm (khuyến nghị)

==================================

## CÀI ĐẶT

### Bước 1: Clone hoặc tải project

```bash
# Clone từ Git
git clone https://github.com/lhuyhoang/HRM-app.git

# Hoặc giải nén file zip vào thư mục
C:\xampp\htdocs\hrmapp\
```

### Bước 2: Import Database

1. Mở phpMyAdmin: http://localhost/phpmyadmin
2. Tạo database mới tên `hrm_db`:

```sql
CREATE DATABASE hrm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Import file SQL:
   - Click vào database `hrm_db`
   - Tab "Import"
   - Chọn file `backend/database/hrm_db.sql`
   - Click "Go"

### Bước 3: Cấu hình Database

Mở file `backend/config/Config.php` và chỉnh sửa:

```php
class Config
{
    const DB_HOST = 'localhost';      // Host database
    const DB_NAME = 'hrm_db';         // Tên database
    const DB_USER = 'root';           // Username MySQL
    const DB_PASS = '';               // Password MySQL (để trống nếu dùng XAMPP)
    
    const JWT_SECRET_KEY = 'your-secret-key-here-change-in-production';
    const JWT_EXPIRATION = 86400;     // Token hết hạn sau 24h
}
```

QUAN TRỌNG: Đổi JWT_SECRET_KEY thành chuỗi ngẫu nhiên phức tạp trước khi deploy production!

### Bước 4: Cấu hình Apache (XAMPP)

Đảm bảo Apache đang chạy và mod_rewrite được enable:

1. Mở C:/xampp/apache/conf/httpd.conf
2. Tìm dòng: #LoadModule rewrite_module modules/mod_rewrite.so
3. Xóa dấu # để enable
4. Restart Apache

### Bước 5: Khởi động ứng dụng

1. Truy cập: http://localhost/hrmapp/frontend/pages/login.html
2. Đăng nhập với tài khoản mặc định:
   - Username: admin
   - Password: admin123

==================================

## CẤU HÌNH

### Cấu hình CORS (nếu cần)

Nếu frontend và backend ở domain khác nhau, thêm vào `backend/index.php`:

```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
```

### Cấu hình JWT Token

Trong `backend/config/Config.php`:

```php
// Thời gian token hết hạn (giây)
const JWT_EXPIRATION = 86400;  // 24 giờ
// const JWT_EXPIRATION = 604800;  // 7 ngày
// const JWT_EXPIRATION = 2592000; // 30 ngày

// Secret key để mã hóa JWT
const JWT_SECRET_KEY = 'your-very-strong-secret-key-min-32-characters';
```

### Cấu hình Timezone

Trong `backend/index.php`:

```php
date_default_timezone_set('Asia/Ho_Chi_Minh');
```

==================================

## CÁCH SỬ DỤNG

### 1. Đăng nhập

URL: http://localhost/hrmapp/frontend/pages/login.html

Tài khoản mặc định:
- Username: admin
- Password: admin123

Sau khi đăng nhập thành công:
- Token JWT được lưu vào localStorage
- Tự động redirect đến Dashboard
- Token được gửi kèm trong mỗi API request

### 2. Dashboard

Chức năng:
- Xem tổng số nhân viên, phòng ban, vị trí
- Thống kê chấm công theo ngày (chọn ngày)
- Danh sách phòng ban với số lượng nhân viên

Các thao tác:
- Chọn ngày để xem thống kê chấm công
- Click vào các menu để điều hướng

### 3. Quản lý Nhân viên

Thêm nhân viên mới:
1. Click "HR Management" -> "Employees"
2. Click nút "Thêm nhân viên"
3. Điền thông tin:
   - Họ và Tên (required)
   - Số điện thoại (10 số, bắt đầu 0)
   - Email (format hợp lệ)
   - Phòng ban (chọn từ dropdown)
   - Vị trí (chọn từ dropdown)
   - Lương
   - Ngày vào làm
4. Click "Lưu"

Sửa nhân viên:
1. Click icon Edit ở hàng nhân viên
2. Chỉnh sửa thông tin
3. Click "Cập nhật"

Xóa nhân viên:
1. Click icon Delete
2. Xác nhận xóa
3. LUU Y: Không thể xóa nếu nhân viên có:
   - Bản ghi lương chưa thanh toán
   - Đơn nghỉ phép đang chờ duyệt

### 4. Quản lý Phòng ban

Thêm phòng ban:
1. Click "HR Management" -> "Departments"
2. Nhập tên phòng ban
3. Nhập mô tả (optional)
4. Click "Thêm phòng ban"

Xóa phòng ban:
- LUU Y: Không thể xóa nếu phòng ban có nhân viên
- Cần chuyển nhân viên sang phòng ban khác trước

### 5. Quản lý Vị trí

Thêm vị trí:
1. Click "HR Management" -> "Positions"
2. Nhập tên vị trí
3. Nhập lương cơ bản
4. Click "Thêm vị trí"

Gán phòng ban cho vị trí:
1. Click icon Add ở cột hành động
2. Chọn phòng ban từ dropdown
3. Phòng ban xuất hiện dưới tên vị trí
4. Click vào badge phòng ban để xóa

### 6. Quản lý Bảng lương

6.1. Payroll (Tính lương)

1. Click "Salary Management" -> "Payroll"
2. Chọn nhân viên
3. Hệ thống tự động điền:
   - Lương cơ bản (từ vị trí)
   - Tháng/Năm hiện tại
4. Nhập:
   - Thưởng (bonus)
   - Khấu trừ (deduction)
5. Lương thực lĩnh tự động tính: base + bonus - deduction
6. Click icon Save để lưu

Lưu ý:
- Mỗi nhân viên chỉ có 1 bản ghi lương/tháng
- Nếu đã tồn tại -> tự động cập nhật
- Nếu chưa có -> tạo mới

6.2. Salary Payment (Thanh toán)

1. Click "Salary Management" -> "Salary Payment"
2. Xem danh sách bản ghi lương với trạng thái:
   - Đợi duyệt (pending)
   - Đã duyệt (approved)
   - Đã thanh toán (paid)

Quy trình thanh toán:
- Pending -> Click icon Approve -> Approved
- Approved -> Click icon Pay -> Paid
- Paid -> Không thể thay đổi

Sửa bản ghi lương:
1. Click icon Edit
2. Popup hiện ra với thông tin hiện tại
3. Chỉnh sửa thưởng/khấu trừ
4. Click "Cập nhật"

### 7. Quản lý Chấm công

Chấm công hàng loạt:
1. Click "Attendance"
2. Chọn phòng ban
3. Chọn ngày
4. Danh sách nhân viên phòng ban hiển thị
5. Chọn trạng thái cho từng nhân viên:
   - Có mặt (present)
   - Vắng mặt (absent)
   - Đi trễ (late)
   - Làm từ xa (remote)
6. Nhập ghi chú (optional)
7. Click "Lưu chấm công"

Xem lịch sử:
- Bảng bên dưới hiển thị bản ghi của ngày đã chọn
- Click icon Delete để xóa bản ghi

### 8. Quản lý Nghỉ phép

Tạo đơn xin nghỉ:
1. Click "HR Management" -> "Leaves"
2. Click "Thêm đơn xin nghỉ"
3. Điền:
   - Chọn nhân viên
   - Ngày bắt đầu
   - Ngày kết thúc
   - Lý do
4. Click "Thêm"

Duyệt/Từ chối:
- Icon Approve: Chuyển trạng thái sang "Đã duyệt"
- Icon Reject: Chuyển trạng thái sang "Từ chối"
- Icon Delete: Xóa đơn

Trạng thái:
- Đang chờ (pending)
- Đã duyệt (approved)
- Từ chối (rejected)

### 9. Đánh giá Hiệu suất

Thêm đánh giá:
1. Click "HR Management" -> "Performance"
2. Chọn nhân viên
3. Chọn kỳ đánh giá (Q1, Q2, Q3, Q4 hoặc Năm)
4. Chọn xếp hạng:
   - Xuất sắc (5/5)
   - Tốt (4/5)
   - Trung bình (3/5)
   - Kém (2/5)
5. Nhập nhận xét
6. Click "Thêm đánh giá"

Sửa đánh giá:
- Click icon Edit
- Chỉnh sửa xếp hạng/nhận xét
- Click "Cập nhật"

### 10. Cài đặt

Thông tin tài khoản:
- Xem thông tin user đang đăng nhập
- Hiển thị username, email

Đổi mật khẩu:
1. Nhập mật khẩu hiện tại
2. Nhập mật khẩu mới (min 6 ký tự)
3. Nhập lại mật khẩu mới
4. Click "Đổi mật khẩu"

Quản lý dữ liệu:
- Sao lưu dữ liệu: Export dữ liệu ra file JSON
- Xóa cache: Xóa localStorage (cẩn thận!)

==================================

## KIẾN TRÚC HỆ THỐNG

### Kiến trúc tổng quan

```
CLIENT (Browser)
  |
  |-- HTML + CSS + JavaScript
  |   |-- Login/Register
  |   |-- Dashboard
  |   |-- CRUD Interfaces
  |
  v
HTTP Requests (JSON + JWT Token)
  |
  v
BACKEND (PHP)
  |
  |-- index.php (Router)
  |   |-- Parse URL
  |   |-- Route to Controller
  |
  |-- AuthMiddleware
  |   |-- Verify JWT Token
  |   |-- Check Permissions
  |
  |-- Controllers
  |   |-- Validation
  |   |-- Business Logic
  |   |-- Call Models
  |
  |-- Models
  |   |-- SQL Queries
  |   |-- CRUD Operations
  |
  v
DATABASE (MySQL)
  |-- users, employees, departments, positions
  |-- salaries, attendance, leaves, performance_reviews
```

### Luồng xử lý request

1. Login Flow:

```
User nhập username/password
    |
    v
POST /api/auth/login
    |
    v
AuthController::login()
    |-- Validate input
    |-- UserModel::verifyCredentials()
    |   |-- Query database
    |   |-- Verify password hash
    |-- JWTHandler::encode([user_id, username])
    |-- Response::success([token, user])
    |
    v
Frontend lưu token vào localStorage
    |
    v
Redirect -> dashboard.html
```

2. Protected API Request Flow:

```
User click "Employees"
    |
    v
GET /api/employees
Header: Authorization: Bearer token
    |
    v
index.php (Router)
    |-- Parse URL -> resource='employees', method='GET'
    |-- Check route requires auth -> YES
    |-- Call AuthMiddleware::authenticate()
        |-- Extract token from header
        |-- JWTHandler::decode(token)
        |   |-- Verify signature
        |   |-- Check expiration
        |   |-- Return payload [user_id, username]
        |-- If valid -> Continue
        |-- If invalid -> Response 401
    |
    v
EmployeeController::index()
    |-- EmployeeModel::getAllWithDetails()
    |   |-- SQL: SELECT e.*, d.name, p.title 
    |          FROM employees e
    |          LEFT JOIN departments d...
    |          LEFT JOIN positions p...
    |-- Format data
    |-- Response::success([employees])
    |
    v
Frontend nhận JSON -> Render table
```

3. Create Employee Flow:

```
User điền form -> Click "Lưu"
    |
    v
POST /api/employees
Body: {"full_name": "Nguyen Van A", "email": "a@example.com", ...}
Header: Authorization: Bearer token
    |
    v
AuthMiddleware::authenticate() -> Valid token
    |
    v
EmployeeController::create()
    |-- Get request body
    |-- Validator::required([full_name, email, phone, ...])
    |   |-- Check all required fields present
    |-- Validator::email($email)
    |   |-- Check valid email format
    |-- Validator::phone($phone)
    |   |-- Check 10 digits, starts with 0
    |-- EmployeeModel::findByEmail($email)
    |   |-- Check duplicate email
    |-- EmployeeModel::create($data)
    |   |-- INSERT INTO employees (...) VALUES (...)
    |   |-- Return employee_id
    |-- Response::created([id => 123], "Employee created")
    |
    v
Frontend nhận response
    |-- Show success message
    |-- Close modal
    |-- Reload employee list
```

4. Salary Calculation Flow:

```
User chọn nhân viên -> Nhập bonus/deduction -> Click Save
    |
    v
POST /api/salaries
Body: {
    "employee_id": 5,
    "month": 11,
    "year": 2025,
    "bonus": 2000000,
    "deduction": 500000
}
    |
    v
SalaryController::create()
    |-- Get employee data
    |   |-- EmployeeModel::getById(5)
    |-- Get base_salary from employee.salary
    |-- Calculate net_salary = base + bonus - deduction
    |-- Check if salary exists for this month
    |   |-- SalaryModel::getByEmployeeAndMonth(5, 11, 2025)
    |-- IF EXISTS:
    |   |-- SalaryModel::update(id, {...})
    |-- IF NOT EXISTS:
    |   |-- SalaryModel::create({
    |         employee_id: 5,
    |         base_salary: 15000000,
    |         bonus: 2000000,
    |         deduction: 500000,
    |         net_salary: 16500000,
    |         payment_status: "pending",
    |         month: 11,
    |         year: 2025
    |     })
    |-- Response::created([id, net_salary])
    |
    v
Frontend cập nhật bảng
```

==================================

## API DOCUMENTATION

### Base URL
```
http://localhost/hrmapp/backend/api
```

### Authentication

Tất cả API (trừ /auth/login và /auth/register) đều yêu cầu JWT token trong header:

```
Authorization: Bearer eyJhbGci...
```

### Endpoints

#### Auth APIs

| Method | Endpoint | Mô tả | Auth Required |
|--------|----------|-------|---------------|
| POST | /auth/register | Đăng ký tài khoản mới | NO |
| POST | /auth/login | Đăng nhập | NO |
| GET | /auth/verify | Xác thực token | YES |
| POST | /auth/logout | Đăng xuất | YES |

POST /auth/login

Request:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@hrm.com",
      "full_name": "Administrator"
    }
  }
}
```

Errors:
- 401: Invalid credentials
- 422: Missing required fields

#### Employee APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /employees | Lấy danh sách nhân viên |
| GET | /employees/{id} | Lấy thông tin 1 nhân viên |
| POST | /employees | Thêm nhân viên mới |
| PUT | /employees/{id} | Cập nhật nhân viên |
| DELETE | /employees/{id} | Xóa nhân viên |

GET /employees

Response (200):
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "employees": [
      {
        "id": 1,
        "full_name": "Nguyen Van A",
        "email": "a@example.com",
        "phone": "0901234567",
        "department_id": 1,
        "department_name": "IT",
        "position_id": 2,
        "position_title": "Developer",
        "salary": 15000000,
        "hire_date": "2024-01-15",
        "status": "active"
      }
    ]
  }
}
```

POST /employees

Request:
```json
{
  "full_name": "Tran Thi B",
  "email": "b@example.com",
  "phone": "0987654321",
  "department_id": 1,
  "position_id": 3,
  "salary": 12000000,
  "hire_date": "2025-01-01"
}
```

Response (201):
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": "5"
  }
}
```

Errors:
- 409: Email already exists
- 422: Validation failed

#### Department APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /departments | Lấy danh sách phòng ban |
| POST | /departments | Thêm phòng ban |
| PUT | /departments/{id} | Cập nhật phòng ban |
| DELETE | /departments/{id} | Xóa phòng ban |

#### Position APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /positions | Lấy danh sách vị trí |
| POST | /positions | Thêm vị trí |
| PUT | /positions/{id} | Cập nhật vị trí |
| DELETE | /positions/{id} | Xóa vị trí |
| POST | /positions/{id}/departments/{deptId} | Gán phòng ban cho vị trí |
| DELETE | /positions/{id}/departments/{deptId} | Xóa phòng ban khỏi vị trí |

#### Salary APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /salaries | Lấy danh sách bảng lương |
| POST | /salaries | Tạo bản ghi lương |
| PUT | /salaries/{id} | Cập nhật bản ghi lương |
| PATCH | /salaries/{id}/status | Cập nhật trạng thái thanh toán |
| DELETE | /salaries/{id} | Xóa bản ghi lương |

PATCH /salaries/{id}/status

Request:
```json
{
  "payment_status": "approved"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Payment status updated successfully"
}
```

Status values: pending | approved | paid

#### Attendance APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /attendance | Lấy danh sách chấm công |
| POST | /attendance | Tạo bản ghi chấm công |
| PUT | /attendance/{id} | Cập nhật chấm công |
| DELETE | /attendance/{id} | Xóa bản ghi chấm công |
| GET | /attendance/summary | Thống kê chấm công |

#### Leave APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /leaves | Lấy danh sách đơn nghỉ |
| POST | /leaves | Tạo đơn xin nghỉ |
| PATCH | /leaves/{id}/status | Duyệt/Từ chối đơn |
| DELETE | /leaves/{id} | Xóa đơn nghỉ |

#### Performance APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /performance | Lấy danh sách đánh giá |
| POST | /performance | Tạo đánh giá |
| PUT | /performance/{id} | Cập nhật đánh giá |
| DELETE | /performance/{id} | Xóa đánh giá |

==================================

## DATABASE SCHEMA

### Sơ đồ quan hệ

```
users                    employees               departments
+------------------+     +------------------+    +------------------+
| id (PK)          |     | id (PK)          |    | id (PK)          |
| username         |     | full_name        |    | name             |
| password         |     | email            |----| description      |
| email            |     | phone            |    | created_at       |
| full_name        |     | department_id ---+    +------------------+
| created_at       |     | position_id -----+
+------------------+     | salary           |    positions
                         | hire_date        |    +------------------+
                         | status           |----| id (PK)          |
                         | created_at       |    | title            |
                         +--------+---------+    | department_id    |
                                  |              | base_salary      |
        +-------------------------+              | created_at       |
        |                         |              +--------+---------+
        |                         |                       |
salaries            attendance    leaves    position_departments
+----------------+  +------------+ +----------------+  +------------------+
| id (PK)        |  | id (PK)    | | id (PK)        |  | position_id (FK) |
| employee_id ---+  | emp_id ----+ | employee_id ---+  | department_id(FK)|
| base_salary    |  | date       | | start_date     |  | created_at       |
| bonus          |  | status     | | end_date       |  +------------------+
| deduction      |  | notes      | | leave_type     |
| net_salary     |  | created_at | | status         |  performance_reviews
| payment_status |  +------------+ | reason         |  +------------------+
| month          |                 | created_at     |  | id (PK)          |
| year           |                 +----------------+  | employee_id -----+
| created_at     |                                     | review_period    |
+----------------+                                     | rating           |
                                                       | category         |
                                                       | comments         |
                                                       | created_at       |
                                                       +------------------+
```

### Chi tiết các bảng

#### users
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### departments
```sql
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### positions
```sql
CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    department_id INT NULL,
    base_salary DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);
```

#### position_departments (Junction table - Many-to-Many)
```sql
CREATE TABLE position_departments (
    position_id INT NOT NULL,
    department_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (position_id, department_id),
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);
```

#### employees
```sql
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department_id INT,
    position_id INT,
    salary DECIMAL(15,2),
    hire_date DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (position_id) REFERENCES positions(id)
);
```

#### salaries
```sql
CREATE TABLE salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    base_salary DECIMAL(15,2) NOT NULL,
    bonus DECIMAL(15,2) DEFAULT 0,
    deduction DECIMAL(15,2) DEFAULT 0,
    net_salary DECIMAL(15,2) NOT NULL,
    payment_status ENUM('pending', 'approved', 'paid') DEFAULT 'pending',
    month INT NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_employee_month_year (employee_id, month, year)
);
```

#### attendance
```sql
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'remote') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

#### leaves
```sql
CREATE TABLE leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

#### performance_reviews
```sql
CREATE TABLE performance_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    review_period VARCHAR(50) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    category ENUM('excellent', 'good', 'average', 'poor') NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

==================================

## XỬ LÝ LỖI

### HTTP Status Codes

| Code | Tên | Khi nào xảy ra |
|------|-----|----------------|
| 200 | OK | Request thành công |
| 201 | Created | Tạo resource mới thành công |
| 400 | Bad Request | Dữ liệu request không hợp lệ |
| 401 | Unauthorized | Token không hợp lệ hoặc hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | Dữ liệu bị trùng (email, username) |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Lỗi server (database, PHP) |

### Format lỗi

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {
    "field_name": "Specific error for this field"
  }
}
```

### Xử lý lỗi phổ biến

1. Token hết hạn (401)

Frontend tự động xử lý:
```javascript
if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/hrmapp/frontend/pages/login.html';
}
```

Giải pháp: User cần đăng nhập lại

2. Email đã tồn tại (409)

Backend:
```php
if ($this->model->findByEmail($data['email'])) {
    Response::error('Email already exists', 409);
}
```

Giải pháp: Dùng email khác

3. Validation failed (422)

Backend:
```php
$errors = Validator::required($data, ['full_name', 'email']);
if (!empty($errors)) {
    Response::validationError('Missing required fields', $errors);
}
```

Giải pháp: Điền đầy đủ các trường bắt buộc

4. Cannot delete with dependencies

Backend:
```php
$employeeCount = $this->model->getEmployeeCount($id);
if ($employeeCount > 0) {
    Response::error("Cannot delete department with {$employeeCount} employees", 400);
}
```

Giải pháp: Xóa/chuyển các resource phụ thuộc trước

==================================

## BẢO MẬT

### 1. JWT Authentication

Cơ chế:
- Token được mã hóa với HMAC SHA-256
- Chứa chữ ký số để phát hiện giả mạo
- Có thời gian hết hạn (24h)
- Secret key được lưu trong Config.php

Best practices:
```php
// GOOD: Đổi secret key trước khi deploy
const JWT_SECRET_KEY = 'random-string-min-32-characters-abc123xyz';

// BAD: KHÔNG dùng secret key đơn giản
const JWT_SECRET_KEY = '123456';
```

### 2. Password Hashing

```php
// Mã hóa password khi đăng ký
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Verify password khi đăng nhập
if (password_verify($inputPassword, $hashedPassword)) {
    // Password correct
}
```

Lưu ý:
- Không bao giờ lưu password dạng plain text
- Sử dụng PASSWORD_DEFAULT (bcrypt)
- Cost factor tự động tăng theo sức mạnh CPU

### 3. SQL Injection Prevention

```php
// GOOD: Dùng prepared statements
$sql = "SELECT * FROM users WHERE email = :email";
$stmt = $this->db->prepare($sql);
$stmt->bindValue(':email', $email);
$stmt->execute();

// BAD: KHÔNG concatenate trực tiếp
$sql = "SELECT * FROM users WHERE email = '$email'";
```

### 4. XSS Prevention

Frontend:
```javascript
// Luôn escape user input khi render HTML
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// GOOD: Sử dụng
element.textContent = userInput;  // Auto-escaped

// BAD: Tránh
element.innerHTML = userInput;    // XSS risk
```

### 5. CORS Configuration

Chỉ cho phép origin cụ thể:
```php
// Production: Chỉ định domain cụ thể
$allowed_origins = [
    'https://yourdomain.com',
    'https://app.yourdomain.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
```

### 6. Input Validation

```php
// Email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::validationError('Invalid email format');
}

// Phone validation (VN format)
if (!preg_match('/^0[0-9]{9}$/', $phone)) {
    Response::validationError('Invalid phone number');
}

// Sanitize input
$clean_input = htmlspecialchars(strip_tags($input), ENT_QUOTES, 'UTF-8');
```

==================================

## DEPLOYMENT (PRODUCTION)

### 1. Checklist trước khi deploy

- [ ] Đổi JWT_SECRET_KEY thành chuỗi ngẫu nhiên mạnh
- [ ] Đổi database password
- [ ] Xóa tài khoản test/demo
- [ ] Tắt error reporting: error_reporting(0)
- [ ] Enable HTTPS
- [ ] Cấu hình CORS chính xác
- [ ] Backup database
- [ ] Test trên staging environment

### 2. Cấu hình Production

backend/config/Config.php:
```php
class Config
{
    // Database
    const DB_HOST = 'your-production-db-host';
    const DB_NAME = 'your-production-db-name';
    const DB_USER = 'your-production-db-user';
    const DB_PASS = 'strong-password-here';
    
    // JWT
    const JWT_SECRET_KEY = 'very-strong-random-key-min-32-chars';
    const JWT_EXPIRATION = 86400;
    
    // Environment
    const ENVIRONMENT = 'production';
}
```

backend/index.php:
```php
if (Config::ENVIRONMENT === 'production') {
    error_reporting(0);
    ini_set('display_errors', 0);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
```

### 3. .htaccess Security

```apache
# Bảo vệ thư mục config
<Directory /path/to/backend/config>
    Require all denied
</Directory>

# Chỉ cho phép truy cập qua HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Tắt directory listing
Options -Indexes

# Bảo vệ file .env, .git
<FilesMatch "^\.">
    Require all denied
</FilesMatch>
```

==================================

## TROUBLESHOOTING

### Lỗi kết nối database

Triệu chứng:
```
SQLSTATE[HY000] [1045] Access denied for user 'root'@'localhost'
```

Giải pháp:
1. Kiểm tra MySQL đang chạy
2. Kiểm tra username/password trong Config.php
3. Test kết nối:
   ```bash
   php backend/config/test_connection.php
   ```

### Token không hợp lệ

Triệu chứng:
```json
{"success": false, "message": "Invalid or expired token"}
```

Giải pháp:
1. Kiểm tra token trong localStorage
2. Kiểm tra JWT_SECRET_KEY có đúng không
3. Xóa localStorage và đăng nhập lại
4. Kiểm tra token có hết hạn chưa

### CORS Error

Triệu chứng:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

Giải pháp:
```php
// backend/index.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### 404 Not Found

Triệu chứng: API trả về 404 thay vì dữ liệu

Giải pháp:
1. Kiểm tra mod_rewrite đã enable
2. Kiểm tra file .htaccess tồn tại
3. Kiểm tra URL có đúng format: /api/resource

==================================

## CHANGELOG

### Version 1.0.0 (2025-11-23)
- Initial release
- Hoàn thành tất cả chức năng core
- JWT Authentication
- CRUD cho tất cả modules
- Dashboard với thống kê
- Quản lý bảng lương với payroll và payment
- Chấm công theo phòng ban
- Many-to-many relationship: Position-Department

==================================

## HỖ TRỢ

### Báo lỗi (Bug Report)
Nếu phát hiện lỗi, vui lòng tạo issue với thông tin:
- Mô tả lỗi
- Các bước tái hiện
- Screenshot (nếu có)
- Browser/PHP version

### Liên hệ
- GitHub: https://github.com/lhuyhoang/HRM-app
- Email: lhuyhoang@example.com

==================================

## LICENSE

MIT License - Free to use for personal and commercial projects.

==================================

## CREDITS

Developed by HRM Team

Technologies used:
- PHP 8.0+
- MySQL 8.0
- Vanilla JavaScript (ES6+)
- HTML5 + CSS3
- JWT for authentication
- PDO for database
- RESTful API design

==================================

## ROADMAP

### Phiên bản tương lai (v2.0)

- [ ] Tích hợp email notifications
- [ ] Export Excel/PDF cho reports
- [ ] Multi-language support (EN/VI)
- [ ] Advanced analytics dashboard
- [ ] Mobile responsive optimization
- [ ] Real-time notifications với WebSocket
- [ ] File upload (avatar, documents)
- [ ] Advanced search & filters
- [ ] Audit logs
- [ ] 2FA (Two-Factor Authentication)

==================================

Cảm ơn bạn đã sử dụng HRM Application!