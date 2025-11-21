import { createTable, showAlert, showConfirm } from './uiHelpers.js';
import apiService from './apiService.js';

let departmentsCache = [];

export const init = async () => {
};

export const getAllDepartments = async () => {
    try {
        const response = await apiService.departments.getAll();
        console.log('Departments API response:', response);

        if (response.success && Array.isArray(response.data)) {
            departmentsCache = response.data;
            return departmentsCache;
        }

        console.error('Invalid departments response:', response);
        return [];
    } catch (error) {
        console.error('Failed to fetch departments', error);
        return [];
    }
};

export const addDepartment = async (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
        throw new Error('Tên phòng ban không được để trống');
    }

    try {
        const response = await apiService.departments.create(trimmedName);
        if (response.success) {
            return response.data;
        }
        throw new Error(response.message || 'Failed to add department');
    } catch (error) {
        console.error('Failed to add department', error);
        throw error;
    }
};

export const deleteDepartment = async (id) => {
    try {
        const response = await apiService.departments.delete(id);
        return { success: response.success };
    } catch (error) {
        console.error('Failed to delete department', error);
        const errorMessage = error.message || 'Không thể xóa phòng ban';
        return { success: false, message: errorMessage };
    }
};
export const render = async (container) => {
    await init();
    const renderTable = async () => {
        const departments = await getAllDepartments();
        const tableWrapper = container.querySelector('#department-table');
        if (!tableWrapper) {
            return;
        }
        if (departments.length === 0) {
            tableWrapper.innerHTML = '<p>Chưa có phòng ban nào.</p>';
            return;
        }
        const tableHtml = createTable(
            ['ID', 'Tên phòng ban', 'Hành động'],
            departments,
            (dept) => `
                <tr>
                    <td>${dept.id}</td>
                    <td>${dept.name}</td>
                    <td style="padding: 8px;">
                        <div style="display: flex; gap: 8px; align-items: center; justify-content: center;">
                            <button data-action="delete" data-id="${dept.id}" style="background: transparent; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `
        );
        tableWrapper.innerHTML = tableHtml;
    };
    container.innerHTML = `
        <h2>Quản lý phòng ban</h2>
        <form id="department-form" class="form-group">
            <label for="new-department-name" class="sr-only">Tên phòng ban mới</label>
            <input type="text" id="new-department-name" placeholder="Tên phòng ban mới" required />
            <button type="submit" id="add-department">Thêm</button>
        </form>
        <div id="department-table"></div>
    `;
    const form = container.querySelector('#department-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const input = form.querySelector('#new-department-name');
        try {
            await addDepartment(input.value);
            input.value = '';
            showAlert('Thêm phòng ban thành công');
            await renderTable();
        } catch (error) {
            showAlert(error.message || 'Không thể thêm phòng ban', 'error');
        }
    });
    container.querySelector('#department-table').addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action="delete"]');
        if (!button) {
            return;
        }
        const id = Number(button.dataset.id);
        if (Number.isNaN(id)) {
            return;
        }
        const confirmed = await showConfirm('Bạn có chắc chắn muốn xóa phòng ban này?');
        if (!confirmed) {
            return;
        }
        const result = await deleteDepartment(id);
        if (result.success) {
            showAlert('Đã xóa phòng ban');
            await renderTable();
        } else {
            if (result.message && result.message.includes('employees')) {
                showAlert('Không thể xóa phòng ban này vì còn nhân viên đang làm việc. Vui lòng chuyển nhân viên sang phòng ban khác trước.', 'error');
            } else if (result.message && result.message.includes('positions')) {
                showAlert('Không thể xóa phòng ban này vì còn chức vụ liên kết. Vui lòng xóa các chức vụ trong phòng ban này trước.', 'error');
            } else {
                showAlert(result.message || 'Không thể xóa phòng ban', 'error');
            }
        }
    });
    await renderTable();
};
