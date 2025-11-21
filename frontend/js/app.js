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
    // Check if user is already authenticated
    if (apiService.auth.isAuthenticated()) {
        redirectToDashboard();
        return;
    }

    // Redirect to login page when clicking login buttons
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
