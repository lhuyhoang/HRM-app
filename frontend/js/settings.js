import { showAlert, showConfirm } from './uiHelpers.js';
import apiService from './apiService.js';

let systemStartTime = Date.now();

const loadUserProfile = async () => {
    try {
        const response = await apiService.auth.verify();

        if (response.success && response.data) {
            const user = response.data;

            const fullnameEl = document.getElementById('user-fullname');
            const emailEl = document.getElementById('user-email');
            const usernameEl = document.getElementById('user-username');

            if (fullnameEl) fullnameEl.textContent = user.full_name || '-';
            if (emailEl) emailEl.textContent = user.email || '-';
            if (usernameEl) usernameEl.textContent = user.username || '-';
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
    }
};



const checkApiStatus = async () => {
    const apiStatusEl = document.getElementById('api-status');
    if (!apiStatusEl) return;

    try {
        const response = await fetch('http://localhost/hrmapp/backend/api/health');
        if (response.ok) {
            apiStatusEl.innerHTML = '<span style="color: #10b981;">✓ Hoạt động bình thường</span>';
        } else {
            apiStatusEl.innerHTML = '<span style="color: #ef4444;">✗ Có lỗi</span>';
        }
    } catch (error) {
        apiStatusEl.innerHTML = '<span style="color: #ef4444;">✗ Không kết nối được</span>';
    }
};

const updateUptime = () => {
    const uptimeElement = document.getElementById('system-uptime');
    if (!uptimeElement) return; // Guard clause if element not found

    const uptime = Date.now() - systemStartTime;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    uptimeElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
};

const handlePasswordChange = async (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Xác thực dữ liệu
    if (newPassword.length < 6) {
        showAlert('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert('Mật khẩu xác nhận không khớp', 'error');
        return;
    }

    if (currentPassword === newPassword) {
        showAlert('Mật khẩu mới phải khác mật khẩu hiện tại', 'error');
        return;
    }

    try {
        const response = await apiService.auth.changePassword(currentPassword, newPassword);

        if (response.success) {
            showAlert('Đổi mật khẩu thành công');
            event.target.reset();
        } else {
            showAlert(response.message || 'Đổi mật khẩu thất bại', 'error');
        }
    } catch (error) {
        console.error('Password change error:', error);
        showAlert('Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra', 'error');
    }
};

const handleBackupData = async () => {
    const confirmed = await showConfirm('Bạn có chắc muốn tạo bản sao lưu dữ liệu?');
    if (!confirmed) return;

    try {
        showAlert('Đang tạo bản sao lưu...', 'info');

        // Xuất tất cả dữ liệu
        const [employees, departments, positions, attendance, leaves, performance, salaries] = await Promise.all([
            apiService.employees.getAll(),
            apiService.departments.getAll(),
            apiService.positions.getAll(),
            apiService.attendance.getAll(),
            apiService.leaves.getAll(),
            apiService.performance.getAll(),
            apiService.salaries.getAll()
        ]);

        const backupData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            data: {
                employees: employees.data || [],
                departments: departments.data || [],
                positions: positions.data || [],
                attendance: attendance.data || [],
                leaves: leaves.data || [],
                performance: performance.data || [],
                salaries: salaries.data || []
            }
        };

        // Tạo liên kết tải xuống
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hrm-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('Sao lưu dữ liệu thành công');
    } catch (error) {
        console.error('Backup error:', error);
        showAlert('Không thể tạo bản sao lưu', 'error');
    }
};

const handleClearCache = async () => {
    const confirmed = await showConfirm('Bạn có chắc muốn xóa cache? Hệ thống sẽ tải lại dữ liệu.');
    if (!confirmed) return;

    try {
        // Xóa cache localStorage (trừ JWT token)
        const token = localStorage.getItem('jwt_token');
        localStorage.clear();
        if (token) {
            localStorage.setItem('jwt_token', token);
        }

        // Xóa sessionStorage
        sessionStorage.clear();

        // Tải lại thống kê
        await loadSystemStats();

        showAlert('Đã xóa cache thành công');
    } catch (error) {
        console.error('Clear cache error:', error);
        showAlert('Không thể xóa cache', 'error');
    }
};

export const render = async (container) => {
    // Tải mẫu HTML
    try {
        const response = await fetch('../pages/settings.html?v=1');
        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        console.error('Failed to load settings template:', error);
        container.innerHTML = '<div class="error">Không thể tải trang cài đặt</div>';
        return;
    }

    // Tải thông tin người dùng
    await loadUserProfile();

    // Kiểm tra trạng thái API
    await checkApiStatus();

    // Bắt đầu đếm thời gian hoạt động
    setInterval(updateUptime, 1000);
    updateUptime();

    // Các sự kiện lắng nghe
    const changePasswordForm = container.querySelector('#change-password-form');
    changePasswordForm?.addEventListener('submit', handlePasswordChange);

    const backupBtn = container.querySelector('#backup-data');
    backupBtn?.addEventListener('click', handleBackupData);

    const clearCacheBtn = container.querySelector('#clear-cache');
    clearCacheBtn?.addEventListener('click', handleClearCache);
};

export default { render };
