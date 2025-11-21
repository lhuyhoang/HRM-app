import { showAlert } from './uiHelpers.js?v=2';
import apiService from './apiService.js?v=2';

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

export const render = async (container, onRegistered) => {
    try {
        // Load register HTML from file
        const response = await fetch('frontend/pages/register.html');
        const html = await response.text();
        container.innerHTML = html;

        const form = container.querySelector('#register-form');
        const backBtn = container.querySelector('#register-back-btn');
        const gotoLoginLink = container.querySelector('#goto-login');

        // Back button handler
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof onRegistered === 'function') {
                    onRegistered();
                }
            });
        }

        // "Already have an account" link handler
        if (gotoLoginLink) {
            gotoLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof onRegistered === 'function') {
                    onRegistered();
                }
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = container.querySelector('#reg-fullname').value.trim();
            const username = container.querySelector('#reg-username').value.trim();
            const password = container.querySelector('#reg-password').value;
            const confirm = container.querySelector('#reg-confirm').value;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Validation
            if (!fullName || !username || !password || !confirm) {
                showAuthAlert('Please fill in all fields', 'error');
                return;
            }

            if (username.length < 3) {
                showAuthAlert('Username must be at least 3 characters', 'error');
                return;
            }

            if (password.length < 6) {
                showAuthAlert('Password must be at least 6 characters', 'error');
                return;
            }

            if (password !== confirm) {
                showAuthAlert('Passwords do not match', 'error');
                return;
            }

            // Disable button and show loading
            submitBtn.innerHTML = 'Creating account<span class="auth-loading"></span>';
            submitBtn.disabled = true;

            try {
                // Call register API
                const response = await apiService.auth.register(username, password, fullName);

                if (response.success) {
                    showAuthAlert('Registration successful! Redirecting...', 'success');
                    form.reset();

                    // Auto redirect after 1.5 seconds
                    setTimeout(() => {
                        if (typeof onRegistered === 'function') {
                            onRegistered();
                        }
                    }, 1500);
                } else {
                    showAuthAlert(response.message || 'Registration failed', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Register error:', error);
                showAuthAlert(error.message || 'Registration failed. Please try again.', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    } catch (error) {
        console.error('Error loading register page:', error);
        showAlert('Cannot load registration page', 'error');
    }
};

