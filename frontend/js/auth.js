import { showAlert } from './uiHelpers.js';
import apiService from './apiService.js';

export const login = async (username, password) => {
    try {
        const response = await apiService.auth.login(username, password);
        if (response.success) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
};

export const logout = async () => {
    try {
        await apiService.auth.logout();
    } catch (error) {
        console.error('Logout error:', error);
    }
};

export const isAuthenticated = () => {
    return apiService.auth.isAuthenticated();
};
// Helper function to show alert in auth forms
const showAuthAlert = (message, type = 'error') => {
    const alertContainer = document.getElementById('auth-alert');
    if (!alertContainer) return;

    const alertClass = type === 'error' ? 'auth-alert-error' : 'auth-alert-success';
    const icon = type === 'error' ? '⚠️' : '✓';

    alertContainer.innerHTML = `
        <div class="auth-alert ${alertClass}">
            <span class="auth-alert-icon">${icon}</span>
            <span>${message}</span>
        </div>
    `;

    // Auto hide after 5 seconds
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
};

export const renderLogin = async (container, onLoginSuccess, onShowRegister) => {
    try {
        const response = await fetch('frontend/pages/login.html');
        const html = await response.text();
        container.innerHTML = html;

        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const loginBtn = e.target.querySelector('button[type="submit"]');
            const originalText = loginBtn.innerHTML;

            loginBtn.innerHTML = 'Signing in<span class="auth-loading"></span>';
            loginBtn.disabled = true;

            const success = await login(username, password);
            if (success) {
                showAuthAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => onLoginSuccess(), 1000);
            } else {
                showAuthAlert('Invalid username or password!', 'error');
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });

        const regLink = document.getElementById('goto-register');
        if (regLink) {
            regLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof onShowRegister === 'function') {
                    onShowRegister();
                }
            });
        }
    } catch (error) {
        console.error('Error loading login page:', error);
        showAlert('Cannot load login page', 'error');
    }
};