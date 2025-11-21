CREATE DATABASE IF NOT EXISTS hrm_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hrm_app;

DROP TABLE IF EXISTS performance_reviews;
DROP TABLE IF EXISTS leaves;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS salaries;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    last_login DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    base_salary DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_title_dept (title, department_id),
    INDEX idx_department (department_id),
    INDEX idx_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
e
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NULL,
    department_id INT NOT NULL,
    position_id INT NOT NULL,
    hire_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_name (full_name),
    INDEX idx_department (department_id),
    INDEX idx_position (position_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE,
    bonus DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    deduction DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL DEFAULT 'present',
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee_date (employee_id, date),
    INDEX idx_employee (employee_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type ENUM('sick', 'annual', 'personal', 'other') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee (employee_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE performance_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    review_period VARCHAR(7) NOT NULL, 
    rating DECIMAL(3,2) NOT NULL,
    category ENUM('excellent', 'good', 'average', 'poor') NOT NULL,
    comments TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee_period (employee_id, review_period),
    INDEX idx_employee (employee_id),
    INDEX idx_period (review_period),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert admin user (password: admin123)
INSERT INTO users (username, password, full_name, created_at) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', NOW());

INSERT INTO departments (name, description, created_at) VALUES
('Nhân sự', 'Phòng Quản lý Nhân sự', NOW()),
('Kỹ thuật', 'Phòng Kỹ thuật và Công nghệ', NOW()),
('Kinh doanh', 'Phòng Kinh doanh và Marketing', NOW()),
('Tài chính', 'Phòng Tài chính Kế toán', NOW()),
('Hành chính', 'Phòng Hành chính Tổng hợp', NOW());

INSERT INTO positions (title, department_id, base_salary, description, created_at) VALUES
('Giám đốc Nhân sự', 1, 30000000, 'Quản lý toàn bộ hoạt động nhân sự', NOW()),
('Chuyên viên Nhân sự', 1, 15000000, 'Xử lý công việc tuyển dụng và đào tạo', NOW()),
('Trưởng phòng Kỹ thuật', 2, 35000000, 'Quản lý đội ngũ kỹ thuật', NOW()),
('Lập trình viên Senior', 2, 25000000, 'Phát triển phần mềm', NOW()),
('Lập trình viên Junior', 2, 12000000, 'Hỗ trợ phát triển phần mềm', NOW()),
('Giám đốc Kinh doanh', 3, 32000000, 'Quản lý hoạt động kinh doanh', NOW()),
('Nhân viên Kinh doanh', 3, 13000000, 'Chăm sóc khách hàng và bán hàng', NOW()),
('Kế toán trưởng', 4, 28000000, 'Quản lý tài chính', NOW()),
('Kế toán viên', 4, 14000000, 'Xử lý sổ sách kế toán', NOW()),
('Trưởng phòng Hành chính', 5, 22000000, 'Quản lý hành chính', NOW());

INSERT INTO employees (full_name, email, phone, address, department_id, position_id, hire_date, created_at) VALUES
('Nguyễn Văn An', 'nguyenvanan@company.com', '0901234567', '123 Nguyễn Huệ, Q1, TP.HCM', 1, 1, '2020-01-15', NOW()),
('Trần Thị Bình', 'tranthibinh@company.com', '0912345678', '456 Lê Lợi, Q1, TP.HCM', 1, 2, '2021-03-20', NOW()),
('Lê Văn Cường', 'levancuong@company.com', '0923456789', '789 Trần Hưng Đạo, Q5, TP.HCM', 2, 3, '2019-06-10', NOW()),
('Phạm Thị Dung', 'phamthidung@company.com', '0934567890', '321 Võ Văn Tần, Q3, TP.HCM', 2, 4, '2020-08-25', NOW()),
('Hoàng Văn Em', 'hoangvanem@company.com', '0945678901', '654 Điện Biên Phủ, Bình Thạnh, TP.HCM', 2, 5, '2022-01-12', NOW()),
('Võ Thị Phương', 'vothiphuong@company.com', '0956789012', '987 Cách Mạng Tháng 8, Q10, TP.HCM', 3, 6, '2019-11-05', NOW()),
('Đặng Văn Giang', 'dangvangiang@company.com', '0967890123', '147 Nguyễn Thị Minh Khai, Q3, TP.HCM', 3, 7, '2021-07-18', NOW()),
('Bùi Thị Hoa', 'buithihoa@company.com', '0978901234', '258 Lý Thường Kiệt, Q11, TP.HCM', 4, 8, '2020-04-22', NOW()),
('Trương Văn Inh', 'truongvaninh@company.com', '0989012345', '369 Hai Bà Trưng, Q1, TP.HCM', 4, 9, '2021-09-30', NOW()),
('Đinh Thị Kim', 'dinhthikim@company.com', '0990123456', '741 Pasteur, Q1, TP.HCM', 5, 10, '2020-02-14', NOW());

INSERT INTO salaries (employee_id, bonus, deduction, notes, created_at) VALUES
(1, 5000000, 0, 'Thưởng hiệu suất Q1', NOW()),
(2, 2000000, 0, 'Thưởng dự án', NOW()),
(3, 8000000, 0, 'Thưởng quản lý tốt', NOW()),
(4, 3000000, 500000, 'Thưởng - Phạt đi muộn', NOW()),
(5, 1000000, 0, 'Thưởng tháng', NOW()),
(6, 6000000, 0, 'Thưởng doanh số', NOW()),
(7, 2500000, 0, 'Thưởng hoàn thành KPI', NOW()),
(8, 4000000, 0, 'Thưởng đúng hạn báo cáo', NOW()),
(9, 1500000, 0, 'Thưởng tháng', NOW()),
(10, 3000000, 0, 'Thưởng quản lý', NOW());

INSERT INTO attendance (employee_id, date, status, created_at) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'present', NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'present', NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'present', NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'present', NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'present', NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'present', NOW()),
(1, CURDATE(), 'present', NOW()),
(2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'present', NOW()),
(2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'late', NOW()),
(2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'present', NOW()),
(2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'present', NOW()),
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'present', NOW()),
(3, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'present', NOW()),
(3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'present', NOW()),
(3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'present', NOW()),
(4, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'present', NOW()),
(4, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'present', NOW()),
(5, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'late', NOW());

INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status, created_at) VALUES
(2, 'sick', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Nghỉ ốm', 'pending', NOW()),
(4, 'annual', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'Nghỉ phép năm', 'pending', NOW()),
(5, 'personal', DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Việc gia đình', 'approved', NOW()),
(7, 'annual', DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'Du lịch', 'pending', NOW());

INSERT INTO performance_reviews (employee_id, review_period, rating, category, comments, created_at) VALUES
(1, '2024-10', 4.8, 'excellent', 'Xuất sắc trong công việc quản lý', NOW()),
(2, '2024-10', 4.2, 'good', 'Hoàn thành tốt nhiệm vụ', NOW()),
(3, '2024-10', 4.9, 'excellent', 'Lãnh đạo đội ngũ rất tốt', NOW()),
(4, '2024-10', 4.5, 'excellent', 'Kỹ năng lập trình xuất sắc', NOW()),
(5, '2024-10', 3.8, 'good', 'Đang phát triển tốt', NOW()),
(6, '2024-10', 4.7, 'excellent', 'Doanh số vượt mục tiêu', NOW()),
(7, '2024-10', 4.0, 'good', 'Chăm sóc khách hàng tốt', NOW()),
(8, '2024-10', 4.6, 'excellent', 'Báo cáo chính xác và đúng hạn', NOW()),
(9, '2024-10', 4.1, 'good', 'Làm việc cẩn thận', NOW()),
(10, '2024-10', 4.3, 'good', 'Quản lý văn phòng hiệu quả', NOW());

CREATE OR REPLACE VIEW v_employee_details AS
SELECT 
    e.id,
    e.full_name,
    e.email,
    e.phone,
    e.address,
    e.hire_date,
    d.name as department_name,
    p.title as position_title,
    p.base_salary,
    COALESCE(s.bonus, 0) as bonus,
    COALESCE(s.deduction, 0) as deduction,
    (p.base_salary + COALESCE(s.bonus, 0) - COALESCE(s.deduction, 0)) as net_salary
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN positions p ON e.position_id = p.id
LEFT JOIN salaries s ON e.id = s.employee_id;

SELECT 'Database schema created successfully!' as message;
SELECT CONCAT('Total employees: ', COUNT(*)) as info FROM employees;
SELECT CONCAT('Total departments: ', COUNT(*)) as info FROM departments;
SELECT CONCAT('Total positions: ', COUNT(*)) as info FROM positions;
