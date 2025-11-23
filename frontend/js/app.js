import apiService from './apiService.js?v=2';

const navLoginBtn = document.getElementById('nav-login-btn');
const heroLoginBtn = document.getElementById('hero-login-btn');

const redirectToDashboard = () => {
    window.location.href = '/hrmapp/frontend/pages/dashboard.html';
};

const redirectToLogin = () => {
    window.location.href = '/hrmapp/frontend/pages/login.html';
};

const initializeApp = () => {
    // Kiểm tra nếu người dùng đã đăng nhập
    if (apiService.auth.isAuthenticated()) {
        redirectToDashboard();
        return;
    }

    // Chuyển hướng đến trang đăng nhập khi nhấp nút
    navLoginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        redirectToLogin();
    });

    heroLoginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        redirectToLogin();
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
