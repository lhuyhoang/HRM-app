import * as Auth from './auth.js?v=6';
import * as EmployeeDB from './employeeDb.js?v=2';
import * as DeptDB from './department.js?v=2';
import * as EmployeeManager from './employeeManager.js?v=2';
import * as Department from './department.js?v=2';
import * as Position from './position.js?v=2';
import * as Salary from './salary.js?v=2';
import * as Attendance from './attendance.js?v=2';
import * as Leaves from './leaves.js?v=2';
import * as Performance from './performance.js?v=2';
import * as Settings from './settings.js?v=1';

const logoutBtn = document.getElementById('logout-btn');
const sidebar = document.getElementById('sidebar');
const appContent = document.getElementById('app-content');

const breadcrumbConfig = {
    'dashboard': [
        { label: 'Dashboard', href: '#', module: 'dashboard' }
    ],
    'employees': [
        { label: 'Dashboard', href: '#', module: 'dashboard' },
        { label: 'HR Management', href: null },
        { label: 'Employees', href: '#', module: 'employees' }
    ],
    'departments': [
        { label: 'Dashboard', href: '#', module: 'dashboard' },
        { label: 'HR Management', href: null },
        { label: 'Departments', href: '#', module: 'departments' }
    ],
    'positions': [
        { label: 'Dashboard', href: '#', module: 'dashboard' },
        { label: 'HR Management', href: null },
        { label: 'Positions', href: '#', module: 'positions' }
    ],
    'salary-payroll': [
        { label: 'Dashboard', href: '#', module: 'dashboard' },
        { label: 'Salary Management', href: null },
        { label: 'Payroll', href: '#', module: 'salary-payroll' }
    ],
    'salary-payment': [
        { label: 'Dashboard', href: '#', module: 'dashboard' },
        { label: 'Salary Management', href: null },
        { label: 'Salary Payment', href: '#', module: 'salary-payment' }
    ],
    'attendance': [
        { label: 'Dashboard', href: '#', module: 'dashboard' },
        { label: 'Attendance', href: '#', module: 'attendance' }
    ],
    'leaves': [
        { label: 'Dashboard', href: '#', module: 'dashboard' },
        { label: 'HR Management', href: null },
        { label: 'Leaves', href: '#', module: 'leaves' }
    ],
    'performance': [
        { label: 'Dashboard', href: '#', module: 'dashboard' },
        { label: 'HR Management', href: null },
        { label: 'Performance', href: '#', module: 'performance' }
    ],
    'settings': [
        { label: 'Dashboard', href: '#', module: 'dashboard' },
        { label: 'Settings', href: '#', module: 'settings' }
    ]
};
const renderBreadcrumb = (moduleName) => {
    const breadcrumbs = breadcrumbConfig[moduleName] || breadcrumbConfig['dashboard'];
    const items = breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        if (isLast) {
            return `<span class="breadcrumb-item active">${crumb.label}</span>`;
        } else if (crumb.href) {
            return `<span class="breadcrumb-item"><a href="${crumb.href}" data-module="${crumb.module}">${crumb.label}</a></span>`;
        } else {
            return `<span class="breadcrumb-item">${crumb.label}</span>`;
        }
    }).join('');

    return `<nav class="breadcrumb">${items}</nav>`;
};

const routes = {
    'employees': EmployeeManager.render,
    'departments': Department.render,
    'positions': Position.render,
    'salary-payroll': async (container) => {
        await Salary.render(container, 'payroll');
    },
    'salary-payment': async (container) => {
        await Salary.render(container, 'payment');
    },
    'attendance': Attendance.render,
    'leaves': Leaves.render,
    'performance': Performance.render,
    'settings': Settings.render,
    'dashboard': async (container) => {
        try {
            const departments = await DeptDB.getAllDepartments();
            const employees = await EmployeeDB.getAllEmployees();
            const positions = await Position.getAllPositions();

            const deptCount = departments.length;
            const empCount = employees.length;
            const posCount = positions.length;

            container.innerHTML = `
                <h2>Dashboard - Tổng quan hệ thống</h2>
                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
                    <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Tổng nhân viên</div>
                        <div style="font-size: 32px; font-weight: bold;">${empCount}</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Phòng ban</div>
                        <div style="font-size: 32px; font-weight: bold;">${deptCount}</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Vị trí</div>
                        <div style="font-size: 32px; font-weight: bold;">${posCount}</div>
                    </div>
                </div>
                
                <div style="margin-top: 40px;">
                    <h3>Chấm công theo ngày</h3>
                    <div id="attendance-summary" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-top: 20px;">
                    </div>
                </div>

                <div style="margin-top: 40px;">
                    <h3>Danh sách phòng ban</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-top: 20px;">
                        ${departments.map(dept => {
                const deptEmployees = employees.filter(emp =>
                    Number(emp.department_id || emp.departmentId) === Number(dept.id)
                );
                return `
                                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                    <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">${dept.name}</div>
                                    <div style="font-size: 14px; color: #6b7280;">${deptEmployees.length} nhân viên</div>
                                    ${dept.description ? `<div style="font-size: 13px; color: #9ca3af; margin-top: 8px;">${dept.description}</div>` : ''}
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;

            // Hiển thị bảng tổng hợp chấm công
            setTimeout(() => {
                const attendanceSummaryDiv = document.getElementById('attendance-summary');
                if (!attendanceSummaryDiv) return;

                const attendanceRecords = Attendance.getAllRecords();

                // Lấy ngày hôm nay làm mặc định
                const today = new Date().toISOString().split('T')[0];

                const renderAttendanceForDate = (selectedDate) => {
                    const dayRecords = attendanceRecords.filter(r => r.date === selectedDate);

                    const stats = {
                        present: 0,
                        absent: 0,
                        late: 0,
                        remote: 0,
                        total: dayRecords.length
                    };

                    dayRecords.forEach(record => {
                        const status = record.status;
                        if (status === 'present') stats.present++;
                        else if (status === 'absent') stats.absent++;
                        else if (status === 'late') stats.late++;
                        else if (status === 'remote') stats.remote++;
                    });

                    const dateObj = new Date(selectedDate);
                    const formattedDate = dateObj.toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    const tableHtml = `
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Chọn ngày:</label>
                            <input type="date" id="attendance-date-picker" value="${selectedDate}" style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        </div>
                        <div style="margin-bottom: 15px; font-size: 16px; font-weight: 500; color: #374151;">${formattedDate}</div>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                                    <th style="padding: 12px; text-align: center; font-weight: 600;">Có mặt</th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600;">Vắng mặt</th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600;">Đi trễ</th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600;">Từ xa</th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600;">Tổng</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid #e5e7eb;">
                                    <td style="padding: 16px; text-align: center;">
                                        <span style="background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 12px; font-weight: 600; font-size: 18px;">${stats.present}</span>
                                    </td>
                                    <td style="padding: 16px; text-align: center;">
                                        <span style="background: #fee2e2; color: #991b1b; padding: 8px 16px; border-radius: 12px; font-weight: 600; font-size: 18px;">${stats.absent}</span>
                                    </td>
                                    <td style="padding: 16px; text-align: center;">
                                        <span style="background: #fed7aa; color: #92400e; padding: 8px 16px; border-radius: 12px; font-weight: 600; font-size: 18px;">${stats.late}</span>
                                    </td>
                                    <td style="padding: 16px; text-align: center;">
                                        <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 12px; font-weight: 600; font-size: 18px;">${stats.remote}</span>
                                    </td>
                                    <td style="padding: 16px; text-align: center; font-weight: 700; font-size: 18px;">${stats.total}</td>
                                </tr>
                            </tbody>
                        </table>
                    `;

                    attendanceSummaryDiv.innerHTML = tableHtml;

                    // Thêm sự kiện lắng nghe cho bộ chọn ngày
                    const datePicker = document.getElementById('attendance-date-picker');
                    if (datePicker) {
                        datePicker.addEventListener('change', (e) => {
                            renderAttendanceForDate(e.target.value);
                        });
                    }
                };

                // Hiển thị ban đầu với ngày hôm nay
                renderAttendanceForDate(today);
            }, 100);
        } catch (error) {
            console.error('Dashboard error:', error);
            container.innerHTML = `
                    < h2 > Dashboard - Tổng quan hệ thống</h2 >
                <p>Đang tải dữ liệu...</p>
            `;
        }
    }
};

const navigateTo = async (moduleName) => {
    const breadcrumb = renderBreadcrumb(moduleName);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper';

    appContent.innerHTML = breadcrumb;
    appContent.appendChild(contentWrapper);

    const renderFunction = routes[moduleName];
    if (renderFunction) {
        await renderFunction(contentWrapper);
    } else {
        await routes['dashboard'](contentWrapper);
    }

    // Lưu route hiện tại vào localStorage
    localStorage.setItem('current_route', moduleName);
};

const handleLogout = async () => {
    await Auth.logout();
    window.location.href = '../../index.html';
};

const initializeDashboard = async () => {
    if (!Auth.isAuthenticated()) {
        window.location.href = '../../index.html';
        return;
    }

    await EmployeeDB.init();
    await DeptDB.init();
    await Position.init();
    Attendance.init();
    Leaves.init();
    Performance.init();

    // Khôi phục route từ localStorage hoặc mặc định là dashboard
    const savedRoute = localStorage.getItem('current_route') || 'dashboard';
    await navigateTo(savedRoute);
};

sidebar.addEventListener('click', async (e) => {
    if (e.target.classList.contains('submenu-toggle')) {
        e.preventDefault();
        const parentLi = e.target.closest('.has-submenu');
        parentLi.classList.toggle('active');
        return;
    }
    if (e.target.tagName === 'A' && e.target.dataset.module) {
        e.preventDefault();
        const moduleName = e.target.dataset.module;
        await navigateTo(moduleName);
    }
});

appContent.addEventListener('click', async (e) => {
    if (e.target.tagName === 'A' && e.target.dataset.module) {
        e.preventDefault();
        const moduleName = e.target.dataset.module;
        await navigateTo(moduleName);
    }
});
logoutBtn.addEventListener('click', handleLogout);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}
