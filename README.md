# HRM-app

<<<<<<< HEAD
Ứng dụng quản lý nhân sự (HRM) chạy trực tiếp trên trình duyệt, lưu dữ liệu bằng LocalStorage. Không cần server hay cài đặt thêm.
=======
Ứng dụng quản lý nhân sự (HRM) chạy trực tiếp trên trình duyệt, lưu dữ liệu bằng LocalStorage. Không cần server.
>>>>>>> 507f28d1e3b6bcd060aa7f2c1e84911077e55e65

## Tính năng chính
- Đăng nhập/Đăng ký, quản lý phiên (session) với thời hạn hết hạn tự động.
- Quản lý Phòng ban và Vị trí.
- Thêm/Sửa nhân viên; lọc và tìm kiếm nhân viên.
- Bảng lương: cập nhật thưởng/khấu trừ, lọc theo phòng ban.
- Chấm công: chỉ cho phép hôm nay hoặc ngày quá khứ; chọn theo chuỗi Phòng ban → Vị trí → Nhân viên.
- Nghỉ phép: tạo yêu cầu nghỉ, duyệt/từ chối; chọn theo chuỗi Phòng ban → Vị trí → Nhân viên.
- Đánh giá hiệu suất: lưu đánh giá theo kỳ (tháng); chọn theo chuỗi Phòng ban → Vị trí → Nhân viên.
- Dashboard: hiển thị số phòng ban và số nhân viên.

## Cấu trúc thư mục
```
index.html
style.css
src/
  addEmployee.js
  app.js
  attendance.js
  auth.js
  department.js
  editEmployee.js
  employeeDb.js
  leaves.js
  performance.js
  position.js
  register.js
  salary.js
  searchEmployee.js
  uiHelpers.js
```

## Cách chạy (không cần server)
1. Mở file `index.html` bằng trình duyệt (Chrome/Edge/Firefox phiên bản mới).
2. Hoặc mở thư mục dự án bằng VS Code và dùng tiện ích "Live Server" để chạy `index.html` (tùy chọn).

## Tài khoản & Đăng nhập
- Lần chạy đầu, ứng dụng tự khởi tạo tài khoản quản trị:
  - Username: `admin`
  - Password: `admin123`
- Bạn có thể:
  - Đăng ký tài khoản mới ở màn đăng nhập (nút "Đăng ký").
  - Đăng nhập bằng tài khoản vừa đăng ký hoặc tài khoản admin.
- Phiên đăng nhập (session) được lưu trong LocalStorage với thời hạn 1 giờ. Hết hạn sẽ yêu cầu đăng nhập lại.
- Đăng xuất sẽ xóa session và quay về màn đăng nhập.

## Hướng dẫn nhanh theo module
- Phòng ban (`Departments`):
  - Thêm/Xóa phòng ban.
- Vị trí (`Positions`):
  - Thêm/Xóa vị trí, gán vị trí theo Phòng ban, nhập lương cơ bản.
- Nhân viên (`Add/Search/Edit Employee`):
  - Thêm nhân viên: chọn Phòng ban trước, Vị trí sẽ hiển thị theo phòng ban.
  - Sửa thông tin nhân viên (tên, phòng ban, vị trí, lương...).
  - Tìm kiếm nhân viên theo từ khóa.
- Bảng lương (`Salary`):
  - Lọc theo Phòng ban.
  - Cập nhật Thưởng và Khấu trừ; hệ thống tính Thực lĩnh = Lương cơ bản + Thưởng - Khấu trừ.
- Chấm công (`Attendance`):
  - Chọn theo chuỗi Phòng ban → Vị trí → Nhân viên.
  - Ngày chấm công chỉ được là hôm nay hoặc ngày trong quá khứ (không cho phép ngày tương lai).
  - Xóa bản ghi chấm công khi cần.
- Nghỉ phép (`Leaves`):
  - Chọn theo chuỗi Phòng ban → Vị trí → Nhân viên.
  - Tạo yêu cầu nghỉ: ngày kết thúc phải ≥ ngày bắt đầu.
  - Duyệt/Từ chối/Xóa yêu cầu.
- Hiệu suất (`Performance`):
  - Chọn theo chuỗi Phòng ban → Vị trí → Nhân viên.
  - Lưu đánh giá theo kỳ (input dạng tháng), xếp loại và nhận xét.
<<<<<<< HEAD

## Lưu ý dữ liệu & giới hạn
- Ứng dụng lưu dữ liệu trong LocalStorage của trình duyệt theo các khóa:
  - `hrm_users`, `hrm_session`
  - `hrm_departments`, `hrm_positions`, `hrm_employees`
  - `hrm_attendance_records`, `hrm_leave_requests`, `hrm_performance_reviews`
- Dữ liệu là cục bộ cho trình duyệt/máy bạn; xóa cache hoặc dùng trình duyệt khác sẽ không còn dữ liệu.
- ID phòng ban/vị trí tạo bằng `Date.now()` (đơn giản, phù hợp demo).
- Màn Chấm công giới hạn ngày không vượt quá hôm nay; Nghỉ phép cho phép chọn tương lai (nhưng ngày kết thúc phải ≥ ngày bắt đầu).
=======
>>>>>>> 507f28d1e3b6bcd060aa7f2c1e84911077e55e65
