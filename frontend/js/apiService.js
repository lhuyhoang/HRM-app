const API_BASE = 'http://localhost/hrmapp/backend/api';
const getToken = () => localStorage.getItem('jwt_token');
const saveToken = (token) => localStorage.setItem('jwt_token', token);
const removeToken = () => localStorage.removeItem('jwt_token');
const fetchAPI = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                if (token && endpoint !== '/auth/login') {
                    removeToken();
                    throw new Error('Session expired. Please login again.');
                }
            }
            if (response.status === 400) {
                return {
                    success: false,
                    message: data.message || 'Bad request',
                    error: data.error || null
                };
            }
            throw new Error(data.message || 'API request failed');
        }
        return data;
    } catch (error) {
        if (error instanceof TypeError || error instanceof SyntaxError) {
            console.error('API Error:', error);
            throw error;
        }
        console.error('API Error:', error);
        throw error;
    }
};
const apiService = {
    auth: {
        login: async (username, password) => {
            const response = await fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            if (response.success && response.data.token) {
                saveToken(response.data.token);
            }
            return response;
        },
        register: async (username, password, fullName, email) => {
            const response = await fetchAPI('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    password,
                    full_name: fullName,
                    email
                })
            });
            if (response.success && response.data.token) {
                saveToken(response.data.token);
            }
            return response;
        },
        logout: async () => {
            try {
                await fetchAPI('/auth/logout', { method: 'POST' });
            } finally {
                removeToken();
            }
        },
        isAuthenticated: () => {
            const token = getToken();
            if (!token) return false;
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.exp * 1000 > Date.now();
            } catch {
                return false;
            }
        },
        changePassword: async (currentPassword, newPassword) => {
            return fetchAPI('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
        },
        verify: async () => {
            return fetchAPI('/auth/verify', {
                method: 'GET'
            });
        }
    },
    employees: {
        getAll: () => fetchAPI('/employees'),
        getById: (id) => fetchAPI(`/employees/${id}`),
        create: (employeeData) => fetchAPI('/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        }),
        update: (id, employeeData) => fetchAPI(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData)
        }),
        delete: (id) => fetchAPI(`/employees/${id}`, {
            method: 'DELETE'
        })
    },
    departments: {
        getAll: () => fetchAPI('/departments'),
        getById: (id) => fetchAPI(`/departments/${id}`),
        create: (name) => fetchAPI('/departments', {
            method: 'POST',
            body: JSON.stringify({ name })
        }),
        delete: (id) => fetchAPI(`/departments/${id}`, {
            method: 'DELETE'
        })
    },
    positions: {
        getAll: () => fetchAPI('/positions'),
        getById: (id) => fetchAPI(`/positions/${id}`),
        getByDepartment: (departmentId) => fetchAPI(`/positions/department/${departmentId}`),
        create: (positionData) => fetchAPI('/positions', {
            method: 'POST',
            body: JSON.stringify(positionData)
        }),
        update: (id, positionData) => fetchAPI(`/positions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(positionData)
        }),
        delete: (id) => fetchAPI(`/positions/${id}`, {
            method: 'DELETE'
        }),
        addDepartment: (positionId, departmentId) => fetchAPI(`/positions/${positionId}/departments/${departmentId}`, {
            method: 'POST'
        }),
        removeDepartment: (positionId, departmentId) => fetchAPI(`/positions/${positionId}/departments/${departmentId}`, {
            method: 'DELETE'
        })
    },
    salaries: {
        getAll: () => fetchAPI('/salaries'),
        getByEmployee: (employeeId) => fetchAPI(`/salaries/employee/${employeeId}`),
        create: (salaryData) => fetchAPI('/salaries', {
            method: 'POST',
            body: JSON.stringify(salaryData)
        }),
        update: (id, salaryData) => fetchAPI(`/salaries/${id}`, {
            method: 'PUT',
            body: JSON.stringify(salaryData)
        }),
        updateStatus: (id, status) => fetchAPI(`/salaries/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ payment_status: status })
        }),
        delete: (id) => fetchAPI(`/salaries/${id}`, {
            method: 'DELETE'
        })
    },
    attendance: {
        getAll: () => fetchAPI('/attendance'),
        getByEmployee: (employeeId) => fetchAPI(`/attendance/employee/${employeeId}`),
        create: (attendanceData) => fetchAPI('/attendance', {
            method: 'POST',
            body: JSON.stringify(attendanceData)
        }),
        delete: (id) => fetchAPI(`/attendance/${id}`, {
            method: 'DELETE'
        })
    },
    leaves: {
        getAll: () => fetchAPI('/leaves'),
        getByEmployee: (employeeId) => fetchAPI(`/leaves/employee/${employeeId}`),
        create: (leaveData) => fetchAPI('/leaves', {
            method: 'POST',
            body: JSON.stringify(leaveData)
        }),
        update: (id, status) => fetchAPI(`/leaves/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),
        delete: (id) => fetchAPI(`/leaves/${id}`, {
            method: 'DELETE'
        })
    },

    performance: {
        getAll: () => fetchAPI('/performance'),
        getById: (id) => fetchAPI(`/performance/${id}`),
        getByEmployee: (employeeId) => fetchAPI(`/performance/employee/${employeeId}`),
        create: (reviewData) => fetchAPI('/performance', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        }),
        update: (id, reviewData) => fetchAPI(`/performance/${id}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        }),
        delete: (id) => fetchAPI(`/performance/${id}`, {
            method: 'DELETE'
        })
    },
    dashboard: {
        getStats: () => fetchAPI('/dashboard/stats')
    }
};
export default apiService;
