import { showAlert, showConfirm } from './uiHelpers.js';
import apiService from './apiService.js';

let systemStartTime = Date.now();

/**
 * Load user profile information
 */
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

/**
 * Load system statistics
 */
const loadSystemStats = async () => {
    try {
        // Get employees count
        const employeesResponse = await apiService.employees.getAll();
        const employeesCount = employeesResponse.success ? employeesResponse.data.length : 0;
        const totalEmployeesEl = document.getElementById('total-employees');
        if (totalEmployeesEl) totalEmployeesEl.textContent = employeesCount;

        // Get departments count
        const departmentsResponse = await apiService.departments.getAll();
        const departmentsCount = departmentsResponse.success ? departmentsResponse.data.length : 0;
        const totalDepartmentsEl = document.getElementById('total-departments');
        if (totalDepartmentsEl) totalDepartmentsEl.textContent = departmentsCount;

        // Get positions count
        const positionsResponse = await apiService.positions.getAll();
        const positionsCount = positionsResponse.success ? positionsResponse.data.length : 0;
        const totalPositionsEl = document.getElementById('total-positions');
        if (totalPositionsEl) totalPositionsEl.textContent = positionsCount;

        // Get today's attendance count
        const attendanceResponse = await apiService.attendance.getAll();
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendanceResponse.success
            ? attendanceResponse.data.filter(a => a.date === today).length
            : 0;
        const totalAttendanceEl = document.getElementById('total-attendance');
        if (totalAttendanceEl) totalAttendanceEl.textContent = todayAttendance;

    } catch (error) {
        console.error('Failed to load system stats:', error);
        showAlert('Không thể tải thống kê hệ thống', 'error');
    }
};

/**
 * Check API status
 */
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

/**
 * Update system uptime
 */
const updateUptime = () => {
    const uptimeElement = document.getElementById('system-uptime');
    if (!uptimeElement) return; // Guard clause if element not found

    const uptime = Date.now() - systemStartTime;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    uptimeElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
};

/**
 * Handle password change
 */
const handlePasswordChange = async (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validation
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

/**
 * Handle backup data
 */
const handleBackupData = async () => {
    const confirmed = await showConfirm('Bạn có chắc muốn tạo bản sao lưu dữ liệu?');
    if (!confirmed) return;

    try {
        showAlert('Đang tạo bản sao lưu...', 'info');

        // Export all data
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

        // Create download link
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

/**
 * Handle clear cache
 */
const handleClearCache = async () => {
    const confirmed = await showConfirm('Bạn có chắc muốn xóa cache? Hệ thống sẽ tải lại dữ liệu.');
    if (!confirmed) return;

    try {
        // Clear localStorage cache (except JWT token)
        const token = localStorage.getItem('jwt_token');
        localStorage.clear();
        if (token) {
            localStorage.setItem('jwt_token', token);
        }

        // Clear sessionStorage
        sessionStorage.clear();

        // Reload stats
        await loadSystemStats();

        showAlert('Đã xóa cache thành công');
    } catch (error) {
        console.error('Clear cache error:', error);
        showAlert('Không thể xóa cache', 'error');
    }
};

/**
 * Initialize settings page
 */
export const render = async (container) => {
    // Load HTML template
    try {
        const response = await fetch('../pages/settings.html?v=1');
        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        console.error('Failed to load settings template:', error);
        container.innerHTML = '<div class="error">Không thể tải trang cài đặt</div>';
        return;
    }

    // Load user profile
    await loadUserProfile();

    // Load system stats
    await loadSystemStats();

    // Check API status
    await checkApiStatus();

    // Start uptime counter
    setInterval(updateUptime, 1000);
    updateUptime();

    // Event listeners
    const changePasswordForm = container.querySelector('#change-password-form');
    changePasswordForm?.addEventListener('submit', handlePasswordChange);

    const refreshStatsBtn = container.querySelector('#refresh-stats');
    refreshStatsBtn?.addEventListener('click', async () => {
        refreshStatsBtn.disabled = true;
        refreshStatsBtn.innerHTML = '<span>⏳</span> Đang tải...';
        await loadSystemStats();
        refreshStatsBtn.disabled = false;
        refreshStatsBtn.innerHTML = '<span>🔄</span> Làm mới';
        showAlert('Đã làm mới thống kê');
    });

    const backupBtn = container.querySelector('#backup-data');
    backupBtn?.addEventListener('click', handleBackupData);

    const clearCacheBtn = container.querySelector('#clear-cache');
    clearCacheBtn?.addEventListener('click', handleClearCache);
};

export default { render };
