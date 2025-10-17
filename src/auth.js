import { showAlert } from './uiHelpers.js';
const USERS_KEY = 'hrm_users';
const SESSION_KEY = 'hrm_session';
const simpleHash = (password) => {
    return `hashed_${password}_secret`;
};
const initAdmin = () => {
    if (!localStorage.getItem(USERS_KEY)) {
        const adminUser = { username: 'admin', password: simpleHash('admin123') };
        localStorage.setItem(USERS_KEY, JSON.stringify([adminUser]));
    }
};
initAdmin();
const checkCredentials = async (username, password) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
            const user = users.find(u => u.username === username && u.password === simpleHash(password));
            resolve(!!user);
        }, 500);
    });
};
export const login = async (username, password) => {
    const isValid = await checkCredentials(username, password);
    if (isValid) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, user: username }));
        return true;
    }
    return false;
};
export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
};
export const isAuthenticated = () => {
    return !!localStorage.getItem(SESSION_KEY);
};
export const renderLogin = (container, onLoginSuccess) => {
    container.innerHTML = `
        <div class="form-container">
            <h2>Đăng nhập HRM</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="username">Tên đăng nhập (admin)</label>
                    <input type="text" id="username" value="admin" required>
                </div>
                <div class="form-group">
                    <label for="password">Mật khẩu (admin123)</label>
                    <input type="password" id="password" value="admin123" required>
                </div>
                <button type="submit">Đăng nhập</button>
            </form>
        </div>
    `;
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginBtn = e.target.querySelector('button');
        loginBtn.textContent = 'Đang xử lý...';
        loginBtn.disabled = true;
        const success = await login(username, password);
        if (success) {
            onLoginSuccess();
        } else {
            showAlert('Tên đăng nhập hoặc mật khẩu không đúng!', 'error');
            loginBtn.textContent = 'Đăng nhập';
            loginBtn.disabled = false;
        }
    });
};