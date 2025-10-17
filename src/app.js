import * as Auth from './auth.js';
import * as EmployeeDB from './employeeDb.js';
import * as DeptDB from './department.js';
import * as AddEmployee from './addEmployee.js';
import * as SearchEmployee from './searchEmployee.js';
import * as Department from './department.js';

const authContainer = document.getElementById('auth-container');
const mainDashboard = document.getElementById('main-dashboard');
const appContainer = document.getElementById('app-container');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logout-btn');
const routes = {
    'addEmployee': AddEmployee.render,
    'searchEmployee': SearchEmployee.render,
    'department': Department.render,
    'dashboard': (container) => {
        container.innerHTML = `
            <h2>Chào mừng đến với Hệ thống HRM!</h2>
            <p>Chọn một chức năng từ menu bên trái để bắt đầu.</p>
        `;
    },
    'positions': Position.render,
    'salary': Salary.render,
};
const navigateTo = (moduleName) => {
    const renderFunction = routes[moduleName];
    if (renderFunction) {
        renderFunction(appContent);
    } else {
        routes['dashboard'](appContent);
    }
};
const showDashboard = () => {
    authContainer.classList.add('hidden');
    mainDashboard.classList.remove('hidden');
    navigateTo('dashboard');
};
const showLogin = () => {
    mainDashboard.classList.add('hidden');
    authContainer.classList.remove('hidden');
    Auth.renderLogin(authContainer, showDashboard);
};
const handleLogout = () => {
    Auth.logout();
    showLogin();
};
constinitializeApp = () => {
    EmployeeDB.init();
    DeptDB.init();
    if (Auth.isAuthenticated()) {
        showDashboard();
    } else {
        showLogin();
    }
};
sidebar.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.tagName === 'A' && e.target.dataset.module) {
        const moduleName = e.target.dataset.module;
        navigateTo(moduleName);
    }
});
logoutBtn.addEventListener('click', handleLogout);
document.addEventListener('DOMContentLoaded', initializeApp);