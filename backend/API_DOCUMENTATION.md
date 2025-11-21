# HRM Application - API Documentation

## Tổng quan

Backend API cho ứng dụng quản lý nhân sự (HRM) được xây dựng theo kiến trúc RESTful với PHP và MySQL.

**Base URL**: `http://localhost/hrmapp/backend/api`

**Authentication**: JWT Token (Bearer Token)

## Authentication

### 1. Đăng ký
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "username": "user123",
  "password": "password123",
  "full_name": "Nguyễn Văn A"
}

Response (201 Created):
{
  "success": true,
  "status": 201,
  "message": "Registration successful",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "username": "user123",
      "full_name": "Nguyễn Văn A"
    }
  }
}
```

### 2. Đăng nhập
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "username": "admin",
  "password": "admin123"
}

Response (200 OK):
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

### 3. Đăng xuất
```
POST /api/auth/logout
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "message": "Logout successful"
}
```

### 4. Xác thực Token
```
GET /api/auth/verify
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "message": "Token valid",
  "data": {
    "id": 1,
    "username": "admin",
    "full_name": "Administrator"
  }
}
```

---

## Departments (Phòng ban)

**Tất cả endpoints yêu cầu authentication**

### 1. Lấy danh sách phòng ban
```
GET /api/departments
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "name": "Nhân sự",
      "description": "Phòng Quản lý Nhân sự",
      "employee_count": 2,
      "created_at": "2024-11-16 10:00:00"
    }
  ]
}
```

### 2. Lấy thông tin phòng ban
```
GET /api/departments/{id}
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": {
    "id": 1,
    "name": "Nhân sự",
    "description": "Phòng Quản lý Nhân sự"
  }
}
```

### 3. Tạo phòng ban mới
```
POST /api/departments
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "IT Department",
  "description": "Information Technology"
}

Response (201 Created):
{
  "success": true,
  "status": 201,
  "message": "Department created successfully",
  "data": {
    "id": 6,
    "name": "IT Department",
    "description": "Information Technology"
  }
}
```

### 4. Cập nhật phòng ban
```
PUT /api/departments/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "IT Department Updated",
  "description": "Updated description"
}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "message": "Department updated successfully",
  "data": {
    "id": 6,
    "name": "IT Department Updated",
    "description": "Updated description"
  }
}
```

### 5. Xóa phòng ban
```
DELETE /api/departments/{id}
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "message": "Department deleted successfully"
}
```

---

## Positions (Vị trí)

### 1. Lấy danh sách vị trí
```
GET /api/positions
GET /api/positions?department_id=1
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "title": "Giám đốc Nhân sự",
      "department_id": 1,
      "department_name": "Nhân sự",
      "base_salary": 30000000,
      "employee_count": 1
    }
  ]
}
```

### 2. Tạo vị trí mới
```
POST /api/positions
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "title": "Senior Developer",
  "department_id": 2,
  "base_salary": 25000000,
  "description": "Senior Software Developer"
}

Response (201 Created):
{
  "success": true,
  "status": 201,
  "message": "Position created successfully",
  "data": { ... }
}
```

### 3. Cập nhật vị trí
```
PUT /api/positions/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "title": "Lead Developer",
  "department_id": 2,
  "base_salary": 30000000
}
```

### 4. Xóa vị trí
```
DELETE /api/positions/{id}
Authorization: Bearer {token}
```

---

## Employees (Nhân viên)

### 1. Lấy danh sách nhân viên
```
GET /api/employees
GET /api/employees?department_id=1
GET /api/employees?position_id=2
GET /api/employees?department_id=1&position_id=2
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "full_name": "Nguyễn Văn An",
      "email": "nguyenvanan@company.com",
      "phone": "0901234567",
      "address": "123 Nguyễn Huệ, Q1, TP.HCM",
      "department_id": 1,
      "department_name": "Nhân sự",
      "position_id": 1,
      "position_title": "Giám đốc Nhân sự",
      "base_salary": 30000000,
      "hire_date": "2020-01-15"
    }
  ]
}
```

### 2. Tìm kiếm nhân viên
```
GET /api/employees/search?q=Nguyen
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": [ ... ]
}
```

### 3. Lấy thông tin nhân viên
```
GET /api/employees/{id}
Authorization: Bearer {token}
```

### 4. Tạo nhân viên mới
```
POST /api/employees
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "full_name": "Trần Văn B",
  "email": "tranvanb@company.com",
  "phone": "0912345678",
  "address": "123 Street",
  "department_id": 2,
  "position_id": 4,
  "hire_date": "2024-11-16"
}

Response (201 Created):
{
  "success": true,
  "status": 201,
  "message": "Employee created successfully",
  "data": { ... }
}
```

### 5. Cập nhật nhân viên
```
PUT /api/employees/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "full_name": "Trần Văn B Updated",
  "email": "tranvanb@company.com",
  "phone": "0912345678",
  "department_id": 2,
  "position_id": 5
}
```

### 6. Xóa nhân viên
```
DELETE /api/employees/{id}
Authorization: Bearer {token}
```

---

## Salaries (Lương)

### 1. Lấy danh sách lương
```
GET /api/salaries
GET /api/salaries?department_id=1
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "employee_id": 1,
      "employee_name": "Nguyễn Văn An",
      "base_salary": 30000000,
      "bonus": 5000000,
      "deduction": 0,
      "net_salary": 35000000,
      "notes": "Thưởng hiệu suất Q1"
    }
  ]
}
```

### 2. Lấy lương theo nhân viên
```
GET /api/salaries/employee/{employee_id}
Authorization: Bearer {token}
```

### 3. Cập nhật lương
```
PUT /api/salaries/{employee_id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "bonus": 3000000,
  "deduction": 500000,
  "notes": "Bonus and penalty"
}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "message": "Salary updated successfully",
  "data": { ... }
}
```

### 4. Tổng hợp bảng lương
```
GET /api/salaries/payroll
GET /api/salaries/payroll?department_id=1
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": {
    "employee_count": 10,
    "total_base_salary": 234000000,
    "total_bonus": 36000000,
    "total_deduction": 500000,
    "total_net_salary": 269500000
  }
}
```

---

## Attendance (Chấm công)

### 1. Lấy danh sách chấm công
```
GET /api/attendance
GET /api/attendance?department_id=1
GET /api/attendance?employee_id=1
GET /api/attendance?date=2024-11-16
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "employee_id": 1,
      "employee_name": "Nguyễn Văn An",
      "date": "2024-11-16",
      "status": "present",
      "notes": null
    }
  ]
}
```

### 2. Chấm công
```
POST /api/attendance
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "employee_id": 1,
  "date": "2024-11-16",
  "status": "present",
  "notes": "On time"
}

Response (201 Created):
{
  "success": true,
  "status": 201,
  "message": "Attendance marked successfully",
  "data": { ... }
}
```

### 3. Cập nhật chấm công
```
PUT /api/attendance/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "status": "late",
  "notes": "Late 30 minutes"
}
```

### 4. Xóa chấm công
```
DELETE /api/attendance/{id}
Authorization: Bearer {token}
```

### 5. Thống kê chấm công
```
GET /api/attendance/{employee_id}/summary
GET /api/attendance/{employee_id}/summary?start_date=2024-11-01&end_date=2024-11-30
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": {
    "total_days": 20,
    "present_days": 18,
    "absent_days": 0,
    "late_days": 2
  }
}
```

---

## Leaves (Nghỉ phép)

### 1. Lấy danh sách nghỉ phép
```
GET /api/leaves
GET /api/leaves?status=pending
GET /api/leaves?employee_id=1
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "employee_id": 2,
      "employee_name": "Trần Thị Bình",
      "leave_type": "sick",
      "start_date": "2024-11-19",
      "end_date": "2024-11-21",
      "reason": "Nghỉ ốm",
      "status": "pending",
      "total_days": 3
    }
  ]
}
```

### 2. Tạo yêu cầu nghỉ phép
```
POST /api/leaves
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "employee_id": 1,
  "leave_type": "annual",
  "start_date": "2024-12-20",
  "end_date": "2024-12-25",
  "reason": "Family vacation"
}

Response (201 Created):
{
  "success": true,
  "status": 201,
  "message": "Leave request created successfully",
  "data": { ... }
}
```

### 3. Cập nhật yêu cầu nghỉ phép
```
PUT /api/leaves/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "leave_type": "annual",
  "start_date": "2024-12-20",
  "end_date": "2024-12-26",
  "reason": "Updated reason"
}
```

### 4. Duyệt/Từ chối nghỉ phép
```
PUT /api/leaves/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "status": "approved"  // hoặc "rejected"
}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "message": "Leave status updated successfully",
  "data": { ... }
}
```

### 5. Xóa yêu cầu nghỉ phép
```
DELETE /api/leaves/{id}
Authorization: Bearer {token}
```

---

## Performance (Đánh giá hiệu suất)

### 1. Lấy danh sách đánh giá
```
GET /api/performance
GET /api/performance?employee_id=1
GET /api/performance?period=2024-10
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "employee_id": 1,
      "employee_name": "Nguyễn Văn An",
      "review_period": "2024-10",
      "rating": 4.8,
      "category": "excellent",
      "comments": "Xuất sắc trong công việc quản lý"
    }
  ]
}
```

### 2. Tạo đánh giá
```
POST /api/performance
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "employee_id": 1,
  "review_period": "2024-11",
  "rating": 4.5,
  "category": "excellent",
  "comments": "Great performance"
}

Response (201 Created):
{
  "success": true,
  "status": 201,
  "message": "Performance review created successfully",
  "data": { ... }
}
```

### 3. Cập nhật đánh giá
```
PUT /api/performance/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "rating": 4.7,
  "category": "excellent",
  "comments": "Updated comments"
}
```

### 4. Xóa đánh giá
```
DELETE /api/performance/{id}
Authorization: Bearer {token}
```

### 5. Điểm trung bình
```
GET /api/performance/{employee_id}/average
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": {
    "average_rating": 4.65
  }
}
```

---

## Dashboard (Thống kê)

### 1. Thống kê tổng quan
```
GET /api/dashboard/stats
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": {
    "total_employees": 10,
    "total_departments": 5,
    "total_positions": 10,
    "pending_leaves": 3,
    "today_attendance": 7
  }
}
```

### 2. Phân bố nhân viên theo phòng ban
```
GET /api/dashboard/distribution
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": [
    {
      "name": "Kỹ thuật",
      "employee_count": 3
    },
    {
      "name": "Nhân sự",
      "employee_count": 2
    }
  ]
}
```

### 3. Hoạt động gần đây
```
GET /api/dashboard/activities
GET /api/dashboard/activities?limit=20
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": [
    {
      "type": "employee",
      "name": "Nguyễn Văn An",
      "created_at": "2024-11-16 10:00:00"
    },
    {
      "type": "leave",
      "name": "Trần Thị Bình - sick",
      "created_at": "2024-11-15 14:30:00"
    }
  ]
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "status": 422,
  "message": "Validation failed",
  "errors": [
    "Field 'email' is required",
    "Field 'password' is required"
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "status": 401,
  "message": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "success": false,
  "status": 404,
  "message": "Resource not found"
}
```

### Conflict (409)
```json
{
  "success": false,
  "status": 409,
  "message": "Email already exists"
}
```

### Server Error (500)
```json
{
  "success": false,
  "status": 500,
  "message": "Internal server error"
}
```

---

## Enums & Constants

### Leave Types
- `sick` - Nghỉ ốm
- `annual` - Nghỉ phép năm
- `personal` - Nghỉ việc riêng
- `other` - Khác

### Leave Status
- `pending` - Chờ duyệt
- `approved` - Đã duyệt
- `rejected` - Từ chối

### Attendance Status
- `present` - Có mặt
- `absent` - Vắng mặt
- `late` - Đi muộn

### Performance Categories
- `excellent` - Xuất sắc
- `good` - Tốt
- `average` - Trung bình
- `poor` - Kém

---

## Setup Instructions

### 1. Tạo Database
```bash
mysql -u root -p < backend/database.sql
```

### 2. Cấu hình Database
Chỉnh sửa `backend/config/Database.php` với thông tin database của bạn:
```php
private $host = 'localhost';
private $db_name = 'hrm_app';
private $username = 'root';
private $password = '';
```

### 3. Test API
Sử dụng Postman hoặc cURL để test các endpoints:
```bash
# Login
curl -X POST http://localhost/hrmapp/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get departments
curl -X GET http://localhost/hrmapp/backend/api/departments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Notes

- Tất cả dates sử dụng format: `YYYY-MM-DD`
- Tất cả datetime sử dụng format: `YYYY-MM-DD HH:MM:SS`
- Review period format: `YYYY-MM`
- Timezone: Asia/Ho_Chi_Minh (UTC+7)
- Token expiration: 1 hour (3600 seconds)
- Default admin account: username=`admin`, password=`admin123`
