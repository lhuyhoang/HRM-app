# BÁO CÁO DỰ ÁN HRM APPLICATION

**Họ và tên:** [Lò Huy Hoàng]
**Lớp:** [WD1306]
**Ngày hoàn thành:** 23/11/2025

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mục tiêu
Xây dựng hệ thống quản lý nhân sự (HRM) hoàn chỉnh với đầy đủ chức năng CRUD, authentication, và tích hợp frontend-backend.

### 1.2. Công nghệ sử dụng
- **Backend:** PHP 8.0+ (OOP), MySQL 8.0, PDO
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Authentication:** JWT (JSON Web Token)
- **Architecture:** MVC Pattern, RESTful API

### 1.3. Phạm vi chức năng
- Xác thực người dùng (JWT Authentication)
- Quản lý nhân viên, phòng ban, vị trí
- Quản lý bảng lương (payroll + payment)
- Chấm công theo phòng ban
- Quản lý nghỉ phép và đánh giá hiệu suất
- Dashboard với thống kê

---

## 2. CHI TIẾT TRIỂN KHAI CÁC MODULE

### 2.1. Module Authentication (Xác thực)

#### Backend Implementation

**Cấu trúc:**
```
backend/
├── controllers/AuthController.php
├── models/UserModel.php
├── utils/JWTHandler.php
└── middleware/AuthMiddleware.php
```

**AuthController.php - Xử lý đăng nhập/đăng ký:**
```php
class AuthController {
    // 1. Login: Xác thực và tạo JWT token
    public function login(): void {
        $credentials = json_decode(file_get_contents('php://input'), true);
        $user = $this->model->verifyCredentials($credentials);
        
        if (!$user) {
            Response::unauthorized('Invalid credentials');
            return;
        }
        
        // Tạo JWT token
        $token = JWTHandler::encode([
            'user_id' => $user['id'],
            'username' => $user['username']
        ]);
        
        Response::success(['token' => $token, 'user' => $user]);
    }
}
```

**JWTHandler.php - Mã hóa/giải mã token:**
- Sử dụng HMAC SHA-256 để tạo signature
- Token format: `header.payload.signature`
- Tự động thêm thời gian hết hạn (exp)

**AuthMiddleware.php - Bảo vệ API:**
```php
public static function authenticate(): void {
    $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $payload = JWTHandler::decode($token);
    
    if (!$payload) {
        Response::unauthorized('Invalid token');
        exit;
    }
    
    $_REQUEST['user_id'] = $payload['user_id'];
}
```

#### Frontend Implementation

**auth.js - Xử lý form login:**
```javascript
async function handleLogin(credentials) {
    const response = await apiService.post('/auth/login', credentials);
    
    if (response.success) {
        // Lưu token vào localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect đến dashboard
        window.location.href = 'dashboard.html';
    }
}
```

**apiService.js - Tự động gửi token:**
```javascript
async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            ...options.headers
        }
    };
    
    const response = await fetch(this.baseURL + endpoint, config);
    
    // Auto logout nếu token hết hạn
    if (response.status === 401) {
        this.handleUnauthorized();
    }
    
    return response.json();
}
```

#### Thách thức gặp phải:
1. **Token hết hạn:** Token expires sau 24h nhưng user vẫn đang sử dụng
   - **Giải pháp:** Frontend kiểm tra response 401 và tự động logout + redirect về login

2. **CORS Error:** Backend từ chối request từ frontend
   - **Giải pháp:** Thêm CORS headers vào backend/index.php:
   ```php
   header('Access-Control-Allow-Origin: *');
   header('Access-Control-Allow-Headers: Content-Type, Authorization');
   ```

3. **Password bị expose:** Ban đầu trả về cả password hash trong response
   - **Giải pháp:** Dùng `unset($user['password'])` trước khi gửi response

---

### 2.2. Module Employee Management (Quản lý nhân viên)

#### Backend Implementation

**EmployeeModel.php - Truy vấn database:**
```php
// JOIN nhiều bảng để lấy thông tin đầy đủ
public function getAllWithDetails(): array {
    $sql = "SELECT e.*, 
                   d.name as department_name,
                   p.title as position_title
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN positions p ON e.position_id = p.id
            ORDER BY e.created_at DESC";
    
    $stmt = $this->db->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll();
}
```

**EmployeeController.php - Business logic:**
```php
public function create(): void {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // 1. Validation
    $errors = Validator::required($data, ['full_name', 'email', 'phone']);
    if (!empty($errors)) {
        Response::validationError('Missing fields', $errors);
        return;
    }
    
    // 2. Check duplicate email
    if ($this->model->emailExists($data['email'])) {
        Response::error('Email already exists', 409);
        return;
    }
    
    // 3. Create employee
    $employeeId = $this->model->create($data);
    Response::created(['id' => $employeeId]);
}
```

#### Frontend Implementation

**employeeManager.js - CRUD operations:**
```javascript
class EmployeeManager {
    async loadEmployees() {
        const response = await apiService.get('/employees');
        this.employees = response.data.employees;
        this.renderTable();
    }
    
    async createEmployee(employeeData) {
        // Validate trước khi gửi
        if (!this.validateForm(employeeData)) {
            return;
        }
        
        const response = await apiService.post('/employees', employeeData);
        
        if (response.success) {
            showNotification('Thêm nhân viên thành công', 'success');
            this.loadEmployees(); // Reload table
            this.closeModal();
        }
    }
    
    renderTable() {
        const tbody = document.getElementById('employeeTableBody');
        tbody.innerHTML = this.employees.map(emp => `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.full_name}</td>
                <td>${emp.email}</td>
                <td>${emp.phone}</td>
                <td>${emp.department_name || 'N/A'}</td>
                <td>${emp.position_title || 'N/A'}</td>
                <td>
                    <button onclick="employeeManager.editEmployee(${emp.id})">
                        Sửa
                    </button>
                    <button onclick="employeeManager.deleteEmployee(${emp.id})">
                        Xóa
                    </button>
                </td>
            </tr>
        `).join('');
    }
}
```

#### Thách thức gặp phải:
1. **N+1 Query Problem:** Ban đầu query riêng lẻ cho department và position
   - **Giải pháp:** Dùng LEFT JOIN để lấy tất cả trong 1 query

2. **Email validation:** Frontend validation không đủ, cần validate cả backend
   - **Giải pháp:** Tạo Validator.php với method `email()` sử dụng `filter_var()`

3. **Modal không clear data:** Khi đóng modal mà không submit, data cũ vẫn còn
   - **Giải pháp:** Reset form trong method `closeModal()`:
   ```javascript
   closeModal() {
       document.getElementById('employeeForm').reset();
       this.editingEmployeeId = null;
   }
   ```

---

### 2.3. Module Salary Management (Quản lý lương)

#### Backend Implementation

**Đặc điểm quan trọng:**
- Có 2 sub-modules: **Payroll** (tính lương) và **Salary Payment** (thanh toán)
- Payroll: Tạo/cập nhật bản ghi lương
- Payment: Thay đổi trạng thái (pending -> approved -> paid)

**SalaryController.php - Xử lý payroll:**
```php
public function create(): void {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Lấy thông tin nhân viên để có base_salary
    $employee = $this->employeeModel->getById($data['employee_id']);
    
    // Tính net salary
    $netSalary = $employee['salary'] + $data['bonus'] - $data['deduction'];
    
    $salaryData = [
        'employee_id' => $data['employee_id'],
        'base_salary' => $employee['salary'],
        'bonus' => $data['bonus'],
        'deduction' => $data['deduction'],
        'net_salary' => $netSalary,
        'month' => $data['month'],
        'year' => $data['year'],
        'payment_status' => 'pending'
    ];
    
    // Check xem đã có bản ghi cho tháng này chưa
    $existing = $this->model->getByEmployeeAndMonth(
        $data['employee_id'], 
        $data['month'], 
        $data['year']
    );
    
    if ($existing) {
        // Update
        $this->model->update($existing['id'], $salaryData);
    } else {
        // Create new
        $this->model->create($salaryData);
    }
}

// Cập nhật trạng thái thanh toán
public function updateStatus($id): void {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $this->model->update($id, [
        'payment_status' => $data['payment_status']
    ]);
    
    Response::success(['message' => 'Status updated']);
}
```

#### Frontend Implementation

**salary.js - Dual interface:**
```javascript
class SalaryManager {
    constructor() {
        this.currentView = 'payroll'; // hoặc 'payment'
    }
    
    // Payroll view: Tính toán và lưu lương
    async calculateSalary(employeeId, bonus, deduction) {
        const employee = await this.getEmployeeById(employeeId);
        const baseSalary = employee.salary;
        
        const netSalary = baseSalary + bonus - deduction;
        
        // Hiển thị preview
        document.getElementById('netSalaryPreview').textContent = 
            this.formatCurrency(netSalary);
        
        return {
            employee_id: employeeId,
            bonus: bonus,
            deduction: deduction,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        };
    }
    
    // Payment view: Quản lý trạng thái
    async changePaymentStatus(salaryId, newStatus) {
        const response = await apiService.patch(
            `/salaries/${salaryId}/status`,
            { payment_status: newStatus }
        );
        
        if (response.success) {
            this.loadSalaries();
        }
    }
    
    renderPaymentTable() {
        // Hiển thị với màu sắc theo status
        const statusColors = {
            pending: 'orange',
            approved: 'blue',
            paid: 'green'
        };
        
        // Render với action buttons phù hợp với status
        // pending: show approve button
        // approved: show pay button
        // paid: no button
    }
}
```

#### Thách thức gặp phải:
1. **Duplicate salary records:** Nhiều bản ghi lương cho cùng nhân viên/tháng
   - **Giải pháp:** Thêm UNIQUE constraint `(employee_id, month, year)` và logic update/create

2. **Real-time calculation:** Net salary không tự động cập nhật khi nhập bonus/deduction
   - **Giải pháp:** Dùng event listeners:
   ```javascript
   document.getElementById('bonus').addEventListener('input', this.updateNetSalary);
   document.getElementById('deduction').addEventListener('input', this.updateNetSalary);
   ```

3. **Status workflow:** Có thể nhảy từ pending thẳng sang paid
   - **Giải pháp:** Validate workflow ở backend:
   ```php
   if ($currentStatus === 'pending' && $newStatus === 'paid') {
       Response::error('Must approve before paying', 400);
   }
   ```

---

### 2.4. Module Attendance (Chấm công)

#### Backend Implementation

**Đặc điểm:**
- Chấm công theo phòng ban
- Một ngày có thể chấm công cho nhiều nhân viên cùng lúc
- Có 4 trạng thái: present, absent, late, remote

**AttendanceController.php:**
```php
public function create(): void {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check duplicate
    if ($this->model->existsForDate($data['employee_id'], $data['date'])) {
        Response::error('Attendance already recorded', 409);
        return;
    }
    
    $id = $this->model->create($data);
    Response::created(['id' => $id]);
}

// Lấy thống kê theo ngày
public function getSummary(): void {
    $date = $_GET['date'] ?? date('Y-m-d');
    
    $sql = "SELECT status, COUNT(*) as count
            FROM attendance
            WHERE date = :date
            GROUP BY status";
    
    $stats = $this->model->executeQuery($sql, ['date' => $date]);
    Response::success(['stats' => $stats]);
}
```

#### Frontend Implementation

**attendance.js - Bulk attendance:**
```javascript
class AttendanceManager {
    async loadEmployeesByDepartment(departmentId) {
        const response = await apiService.get(
            `/employees?department_id=${departmentId}`
        );
        
        this.employees = response.data.employees;
        this.renderAttendanceForm();
    }
    
    renderAttendanceForm() {
        const container = document.getElementById('attendanceForm');
        
        container.innerHTML = this.employees.map(emp => `
            <div class="attendance-row">
                <span>${emp.full_name}</span>
                <select id="status-${emp.id}">
                    <option value="present">Có mặt</option>
                    <option value="absent">Vắng mặt</option>
                    <option value="late">Đi trễ</option>
                    <option value="remote">Làm từ xa</option>
                </select>
                <input type="text" id="notes-${emp.id}" placeholder="Ghi chú">
            </div>
        `).join('');
    }
    
    async submitBulkAttendance() {
        const date = document.getElementById('attendanceDate').value;
        const attendanceRecords = [];
        
        for (const emp of this.employees) {
            const status = document.getElementById(`status-${emp.id}`).value;
            const notes = document.getElementById(`notes-${emp.id}`).value;
            
            attendanceRecords.push({
                employee_id: emp.id,
                date: date,
                status: status,
                notes: notes
            });
        }
        
        // Gửi từng record (hoặc có thể batch ở backend)
        for (const record of attendanceRecords) {
            await apiService.post('/attendance', record);
        }
        
        showNotification('Chấm công thành công', 'success');
    }
}
```

#### Thách thức gặp phải:
1. **Bulk insert performance:** Gửi từng request cho mỗi nhân viên chậm
   - **Giải pháp ban đầu:** Chấp nhận vì đơn giản
   - **Cải tiến sau:** Có thể tạo endpoint `/attendance/bulk` để insert nhiều records

2. **Date picker format:** HTML date input trả về YYYY-MM-DD nhưng display theo locale
   - **Giải pháp:** Luôn dùng format YYYY-MM-DD để gửi API, format display ở frontend

3. **Duplicate prevention:** User có thể submit 2 lần cho cùng 1 ngày
   - **Giải pháp:** 
     - Backend: Check `existsForDate()` trước khi insert
     - Frontend: Disable button sau khi click, load existing records để show

---

### 2.5. Module Position-Department (Many-to-Many)

#### Backend Implementation

**Đặc điểm đặc biệt:**
- Một vị trí có thể thuộc nhiều phòng ban
- Cần junction table `position_departments`

**PositionDepartmentModel.php:**
```php
class PositionDepartmentModel extends BaseModel {
    protected $table = 'position_departments';
    
    public function addDepartment($positionId, $departmentId) {
        $sql = "INSERT INTO {$this->table} (position_id, department_id) 
                VALUES (:position_id, :department_id)";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'position_id' => $positionId,
                'department_id' => $departmentId
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Duplicate entry
                throw new Exception("Department already linked");
            }
            throw $e;
        }
    }
    
    public function getDepartmentsByPosition($positionId) {
        $sql = "SELECT d.* FROM departments d 
                INNER JOIN position_departments pd ON d.id = pd.department_id 
                WHERE pd.position_id = :position_id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['position_id' => $positionId]);
        return $stmt->fetchAll();
    }
}
```

**PositionController.php:**
```php
// POST /positions/{id}/departments/{deptId}
public function addDepartment($positionId, $departmentId): void {
    try {
        $this->pdModel->addDepartment($positionId, $departmentId);
        Response::created(['message' => 'Department added']);
    } catch (Exception $e) {
        Response::error($e->getMessage(), 400);
    }
}

// DELETE /positions/{id}/departments/{deptId}
public function removeDepartment($positionId, $departmentId): void {
    $this->pdModel->removeDepartment($positionId, $departmentId);
    Response::success(['message' => 'Department removed']);
}
```

#### Frontend Implementation

**position.js - Dynamic department badges:**
```javascript
renderPositionTable() {
    tbody.innerHTML = this.positions.map(pos => `
        <tr>
            <td>${pos.id}</td>
            <td>${pos.title}</td>
            <td>
                <div class="department-badges">
                    ${pos.additional_departments.map(dept => `
                        <span class="badge" onclick="positionManager.removeDept(${pos.id}, ${dept.id})">
                            ${dept.name} ×
                        </span>
                    `).join('')}
                    <button onclick="positionManager.showAddDeptModal(${pos.id})">
                        + Thêm
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async addDepartmentToPosition(positionId, departmentId) {
    const response = await apiService.post(
        `/positions/${positionId}/departments/${departmentId}`
    );
    
    if (response.success) {
        this.loadPositions(); // Reload để cập nhật badges
    }
}
```

#### Thách thức gặp phải:
1. **Complex JOIN query:** Cần JOIN 3 bảng (positions, position_departments, departments)
   - **Giải pháp:** Tách thành 2 queries riêng cho clarity:
     ```php
     $positions = $this->getAllWithDepartment();
     foreach ($positions as &$position) {
         $position['additional_departments'] = 
             $this->pdModel->getDepartmentsByPosition($position['id']);
     }
     ```

2. **UI/UX cho add department:** Modal hay dropdown inline?
   - **Giải pháp:** Dùng inline dropdown để UX tốt hơn, không cần mở modal

3. **Delete confirmation:** User có thể xóa nhầm department
   - **Giải pháp:** Hiển thị confirm dialog trước khi xóa

---

## 3. KIỂM TRA VÀ DEBUGGING

### 3.1. Kiểm tra Backend

**1. Test Database Connection:**
```php
// backend/config/test_connection.php
try {
    $db = Database::getInstance()->getConnection();
    echo "Database connected successfully!";
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
```

**2. Test API Endpoints với Postman/Thunder Client:**
```
POST http://localhost/hrmapp/backend/api/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123"
}

Response:
{
    "success": true,
    "data": {
        "token": "eyJhbGci...",
        "user": {...}
    }
}
```

**3. Kiểm tra SQL Queries:**
```php
// Thêm logging trong Model
public function create($data) {
    $sql = "INSERT INTO {$this->table} ...";
    error_log("SQL: " . $sql); // Log query
    error_log("Data: " . json_encode($data)); // Log data
    
    $stmt = $this->db->prepare($sql);
    $stmt->execute($data);
}
```

**4. PHP Error Logging:**
```php
// backend/index.php
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php-errors.log');
```

### 3.2. Kiểm tra Frontend

**1. Browser DevTools Console:**
```javascript
// Log mọi API request
console.log('API Request:', endpoint, data);

// Log response
console.log('API Response:', response);

// Check token
console.log('Token:', localStorage.getItem('token'));
```

**2. Network Tab:**
- Kiểm tra request headers có token không
- Kiểm tra response status (200, 401, 500...)
- Xem request payload và response data

**3. LocalStorage Inspection:**
```javascript
// Application Tab -> Local Storage
// Check:
localStorage.getItem('token')
localStorage.getItem('user')
```

**4. Frontend Validation Testing:**
```javascript
// Test với invalid data
const invalidData = {
    email: 'not-an-email', // Should fail
    phone: '123' // Should fail (not 10 digits)
};

// Test empty required fields
const emptyData = {
    full_name: '' // Should show error
};
```

### 3.3. Integration Testing

**Test toàn bộ luồng:**
1. **Authentication Flow:**
   - Login với credentials đúng -> Lưu token -> Redirect dashboard
   - Login sai -> Show error message
   - Logout -> Clear token -> Redirect login

2. **CRUD Flow:**
   - Create employee -> Verify trong database
   - Edit employee -> Check updated values
   - Delete employee -> Check cascade delete (salary records)

3. **Business Logic Flow:**
   - Create salary -> Calculate net_salary correct
   - Approve salary -> Status changes to "approved"
   - Try approve again -> Should prevent (already approved)

### 3.4. Common Bugs và Fixes

**Bug 1: CORS Error**
```
Access to fetch blocked by CORS policy
```
Fix: Thêm headers vào backend/index.php

**Bug 2: 404 Not Found cho API**
```
404 Not Found: /api/employees
```
Fix: Check mod_rewrite enabled và .htaccess exists

**Bug 3: Token không gửi đi**
```
401 Unauthorized
```
Fix: Check Authorization header format: "Bearer {token}"

**Bug 4: SQL Error - Column not found**
```
SQLSTATE[42S22]: Column not found
```
Fix: Check column names trong query match với database schema

---

## 4. KẾT LUẬN

### 4.1. Bài học kinh nghiệm

**1. OOP trong PHP:**
- Inheritance (BaseModel -> EmployeeModel) giúp tái sử dụng code
- Dependency Injection giúp testing dễ dàng hơn
- Static methods trong Utility classes (JWTHandler, Response, Validator)

**2. RESTful API Design:**
- Consistent URL structure: `/resource` hoặc `/resource/{id}`
- Đúng HTTP methods: GET (read), POST (create), PUT (update), DELETE (delete)
- Proper status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized)

**3. Frontend Architecture:**
- Separation of concerns: apiService.js, auth.js, các manager.js riêng
- Event-driven programming với async/await
- DOM manipulation và state management

**4. Security Best Practices:**
- JWT thay vì session (stateless, scalable)
- Password hashing với bcrypt
- Prepared statements chống SQL injection
- Input validation cả frontend lẫn backend

### 4.2. Hướng phát triển

**Chức năng có thể thêm:**
- Email notifications khi approve/reject leave
- Export Excel cho salary reports
- File upload cho employee avatar
- Real-time notifications với WebSocket
- Advanced search và filters
- Audit logs (track who changed what)

**Cải tiến kỹ thuật:**
- Migrate sang TypeScript cho type safety
- Sử dụng frontend framework (React/Vue) thay vì Vanilla JS
- Implement caching (Redis) cho performance
- Add unit tests và integration tests
- CI/CD pipeline với GitHub Actions

### 4.3. Đánh giá chung

**Điểm mạnh:**
- Architecture rõ ràng, dễ maintain
- Code organized theo MVC pattern
- Security được quan tâm (JWT, validation)
- Full-stack implementation hoàn chỉnh

**Điểm cần cải thiện:**
- Frontend có thể sử dụng framework hiện đại
- Thiếu automated testing
- Error handling có thể chi tiết hơn
- Documentation code có thể tốt hơn

**Tổng kết:** Dự án đã hoàn thành đầy đủ các yêu cầu về chức năng và kỹ thuật, áp dụng được các kiến thức OOP, MVC, RESTful API, và JWT Authentication. Code có cấu trúc tốt, dễ mở rộng và bảo trì.
