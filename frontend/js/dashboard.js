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
    'salary': [
        { label: 'Dashboard', href: '#', module: 'dashboard' },
        { label: 'Salary Management', href: '#', module: 'salary' }
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
    'salary': Salary.render,
    'attendance': Attendance.render,
    'leaves': Leaves.render,
    'performance': Performance.render,
    'settings': Settings.render,
    'dashboard': async (container) => {
        try {
            const departments = await DeptDB.getAllDepartments();
            const employees = await EmployeeDB.getAllEmployees();
            const deptCount = departments.length;
            const empCount = employees.length;
            container.innerHTML = `
                <h2>Welcome to HRM System!</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Departments</div>
                        <div class="stat-value">${deptCount}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Employees</div>
                        <div class="stat-value">${empCount}</div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Dashboard error:', error);
            container.innerHTML = `
                <h2>Welcome to HRM System!</h2>
                <p>Loading data...</p>
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
