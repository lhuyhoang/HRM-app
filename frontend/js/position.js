
import * as DeptDB from './department.js';
import { createTable, showAlert, showConfirm } from './uiHelpers.js';
import apiService from './apiService.js';

let positionsCache = [];

export const init = async () => {
};

export const getAllPositions = async () => {
    try {
        const response = await apiService.positions.getAll();
        if (response.success) {
            positionsCache = response.data || [];
            return positionsCache;
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch positions', error);
        return [];
    }
};

export const getPositionById = async (id) => {
    try {
        const response = await apiService.positions.getById(id);
        if (response.success) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch position', error);
        return null;
    }
};

export const getPositionsByDepartment = async (departmentId) => {
    try {
        const response = await apiService.positions.getByDepartment(departmentId);
        if (response.success) {
            return response.data || [];
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch positions by department', error);
        return [];
    }
};

export const addPosition = async ({ title, departmentId = null, baseSalary = 0 }) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
        throw new Error('Position title is required');
    }

    const positionData = {
        title: trimmedTitle,
        department_id: departmentId,
        base_salary: Number.isFinite(baseSalary) ? baseSalary : 0
    };

    try {
        const response = await apiService.positions.create(positionData);
        if (response.success) {
            return response.data;
        }
        throw new Error(response.message || 'Failed to add position');
    } catch (error) {
        console.error('Failed to add position', error);
        throw error;
    }
};

export const updatePosition = async (updatedPosition) => {
    const positionData = {
        title: updatedPosition.title,
        department_id: updatedPosition.departmentId,
        base_salary: updatedPosition.baseSalary
    };

    try {
        const response = await apiService.positions.update(updatedPosition.id, positionData);
        if (!response.success) {
            throw new Error(response.message || 'Failed to update position');
        }
    } catch (error) {
        console.error('Failed to update position', error);
        throw error;
    }
};

export const deletePosition = async (id) => {
    try {
        const response = await apiService.positions.delete(id);
        if (!response.success) {
            throw new Error(response.message || 'Failed to delete position');
        }
        return response.success;
    } catch (error) {
        console.error('Failed to delete position', error);
        throw error;
    }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
};

export const render = async (container) => {
    await init();
    const departments = await DeptDB.getAllDepartments();
    const departmentOptions = departments
        .map((dept) => `<option value="${dept.id}">${dept.name}</option>`)
        .join('');

    container.innerHTML = `
        <h2>Quản lý vị trí</h2>
        <form id="position-form">
            <div class="form-group">
                <label for="position-title">Tên vị trí</label>
                <input type="text" id="position-title" required>
            </div>
            <div class="form-group">
                <label for="position-salary">Lương cơ bản (VND)</label>
                <input type="number" id="position-salary" min="0" step="100000" placeholder="0">
            </div>
            <button type="submit">Thêm vị trí</button>
        </form>
        <div id="position-table"></div>
    `;

    const tableWrapper = container.querySelector('#position-table');

    const renderTable = async () => {
        const positions = await getAllPositions();
        if (positions.length === 0) {
            tableWrapper.innerHTML = '<p>Chưa có vị trí nào.</p>';
            return;
        }

        const currentDepartments = await DeptDB.getAllDepartments();

        const tableRows = positions.map((pos) => {
            // Lấy thông tin phòng ban chính
            const department = currentDepartments.find((dept) => dept.id === pos.department_id);
            const salaryLabel = pos.base_salary ? `${formatCurrency(pos.base_salary)}` : '0';

            // Xử lý các phòng ban phụ (đã thêm bằng dấu cộng)
            const additionalDepts = pos.additional_departments || [];

            // Tạo HTML cho phòng ban chính (nếu có)
            const mainDeptHtml = department
                ? `<div style="font-weight: bold; color: #333;">${department.name}</div>`
                : '';

            // Tạo HTML cho các badge phòng ban phụ
            const additionalDeptsHtml = additionalDepts.length > 0
                ? `<div style="${department ? 'margin-top: 4px;' : ''} display: flex; flex-wrap: wrap; gap: 4px;">
                    ${additionalDepts.map(d => `
                        <span class="dept-badge" 
                              data-pos-id="${pos.id}" 
                              data-dept-id="${d.id}" 
                              style="
                                display: inline-flex; 
                                align-items: center;
                                background: #e3f2fd; 
                                color: #1565c0; 
                                padding: 2px 8px; 
                                border-radius: 4px; 
                                font-size: 0.85em; 
                                cursor: pointer; 
                                border: 1px solid #bbdefb;" 
                              title="Click để xóa phòng ban này">
                              + ${d.name} <span style="margin-left: 4px; font-weight: bold; color: #d32f2f;">&times;</span>
                        </span>
                    `).join('')}
                   </div>`
                : '';

            // Hiển thị thông báo nếu không có phòng ban nào
            const noDeptHtml = !department && additionalDepts.length === 0
                ? '<span style="color: #999; font-style: italic;">Chưa có phòng ban</span>'
                : '';

            return `
                <tr>
                    <td>
                        <div style="font-weight: 500;">${pos.title}</div>
                        </td>
                    <td>
                        ${mainDeptHtml}
                        ${additionalDeptsHtml}
                        ${noDeptHtml}
                    </td>
                    <td>${salaryLabel}</td>
                    <td style="position: relative;">
                        <button data-action="add-dept" data-id="${pos.id}" title="Thêm phòng ban" style="background: transparent; color: #10b981; border: none; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; font-size: 16px; padding: 0; display: inline-flex; align-items: center; justify-content: center; margin-right: 4px; transition: background 0.2s;" onmouseover="this.style.background='#f0fdf4';" onmouseout="this.style.background='transparent';">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <button data-action="edit" data-id="${pos.id}" title="Sửa" style="background: transparent; color: #3b82f6; border: none; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center; margin-right: 4px; transition: background 0.2s;" onmouseover="this.style.background='#eff6ff';" onmouseout="this.style.background='transparent';">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="danger" data-action="delete" data-id="${pos.id}" title="Xóa" style="background: transparent; color: #ef4444; border: none; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='#fef2f2';" onmouseout="this.style.background='transparent';">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tableWrapper.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Tên vị trí</th>
                        <th>Phòng ban</th>
                        <th>Lương cơ bản (VND)</th>
                        <th style="width: 150px;">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
    };

    await renderTable();

    const form = container.querySelector('#position-form');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const titleInput = form.querySelector('#position-title');
            const salaryInput = form.querySelector('#position-salary');

            const title = titleInput.value.trim();
            const baseSalary = Number(salaryInput.value);

            if (!title) {
                showAlert('Tên vị trí không được để trống', 'error');
                return;
            }

            try {
                const newPos = await addPosition({
                    title,
                    departmentId: null,
                    baseSalary: Number.isFinite(baseSalary) ? baseSalary : 0,
                });

                if (newPos && newPos.id) {
                    positionsCache.push({
                        ...newPos,
                        additional_departments: []
                    });
                }

                showAlert('Thêm vị trí thành công');
                form.reset();
                await renderTable();
            } catch (error) {
                console.error(error);
                showAlert('Không thể thêm vị trí', 'error');
            }
        });
    }

    const openEditModal = async (posId) => {
        const pos = await getPositionById(posId);
        if (!pos) {
            showAlert('Không tìm thấy vị trí', 'error');
            return;
        }

        let modal = document.getElementById('pos-edit-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'pos-edit-modal';
            modal.className = 'hrm-modal';
            modal.innerHTML = `
                <div id="pos-edit-header" class="hrm-modal__header is-primary">
                    <strong>Sửa vị trí</strong>
                    <button id="pos-edit-close" class="hrm-modal__close">✕</button>
                </div>
                <div class="hrm-modal__body" style="padding: 24px;">
                    <form id="pos-edit-form" style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="form-group" style="margin: 0;">
                            <label for="editp-title" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Tên vị trí</label>
                            <input type="text" id="editp-title" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label for="editp-salary" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Lương cơ bản (VND)</label>
                            <input type="number" id="editp-salary" min="0" step="100000" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                        </div>
                        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;">
                            <button type="button" id="pos-edit-cancel" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6';" onmouseout="this.style.background='white';">Hủy</button>
                            <button type="submit" style="padding: 10px 20px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='#2563eb';" onmouseout="this.style.background='#3b82f6';">Lưu</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            const close = () => {
                modal.style.display = 'none';
            };
            document.getElementById('pos-edit-close').addEventListener('click', close);
            document.getElementById('pos-edit-cancel').addEventListener('click', close);

            const form = document.getElementById('pos-edit-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = Number(modal.dataset.id);
                const existing = await getPositionById(id);
                if (!existing) {
                    showAlert('Không tìm thấy vị trí', 'error');
                    return;
                }

                const title = (document.getElementById('editp-title').value || '').trim();
                const baseSalary = Number(document.getElementById('editp-salary').value);

                if (!title) {
                    showAlert('Tên vị trí không được để trống', 'error');
                    return;
                }

                if (!Number.isFinite(baseSalary) || baseSalary < 0) {
                    showAlert('Lương cơ bản không hợp lệ', 'error');
                    return;
                }

                try {
                    await updatePosition({
                        id,
                        title,
                        departmentId: existing.department_id,
                        baseSalary
                    });
                    showAlert('Cập nhật vị trí thành công');
                    close();
                    await renderTable();
                } catch (error) {
                    showAlert('Không thể cập nhật vị trí', 'error');
                }
            });
        }

        modal.dataset.id = String(posId);

        const titleInput = modal.querySelector('#editp-title');
        const salaryInput = modal.querySelector('#editp-salary');
        titleInput.value = pos.title || '';
        salaryInput.value = String(Number(pos.base_salary) || 0);

        modal.style.display = 'block';
    };

    const showDepartmentSelector = async (posId, buttonElement) => {
        const existingDropdown = document.querySelector('.dept-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }

        const allDepts = await DeptDB.getAllDepartments();
        const position = await getPositionById(posId);
        if (!position) return;

        const additionalDepts = position.additional_departments || [];
        const additionalDeptIds = additionalDepts.map(d => d.id);

        const dropdown = document.createElement('div');
        dropdown.className = 'dept-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 1000;
            min-width: 200px;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 4px;
        `;

        const departmentOptions = allDepts
            .filter(dept => dept.id !== position.department_id && !additionalDeptIds.includes(dept.id))
            .map(dept => `
                <div class="dept-option" data-dept-id="${dept.id}" data-pos-id="${posId}" style="
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f0f0;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">
                    ${dept.name}
                </div>
            `).join('');

        dropdown.innerHTML = departmentOptions || '<div style="padding: 12px; color: #999;">Không có phòng ban khác</div>';

        buttonElement.parentElement.style.position = 'relative';
        buttonElement.parentElement.appendChild(dropdown);

        const closeDropdown = (e) => {
            if (!dropdown.contains(e.target) && e.target !== buttonElement) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        };
        setTimeout(() => document.addEventListener('click', closeDropdown), 100);

        dropdown.addEventListener('click', async (e) => {
            const option = e.target.closest('.dept-option');
            if (!option) return;

            const deptId = Number(option.dataset.deptId);
            const posId = Number(option.dataset.posId);

            try {
                // Gọi API để thêm phòng ban
                const response = await apiService.positions.addDepartment(posId, deptId);

                if (response.success) {
                    dropdown.remove();
                    await renderTable();
                    showAlert(response.message || 'Đã thêm phòng ban vào vị trí');
                } else {
                    showAlert(response.message || 'Không thể thêm phòng ban', 'error');
                }
            } catch (error) {
                console.error('Error adding department:', error);
                const errorMessage = error.message || 'Không thể thêm phòng ban';
                showAlert(errorMessage, 'error');
            }
        });
    };

    tableWrapper.addEventListener('click', async (event) => {
        const badge = event.target.closest('.dept-badge');
        if (badge) {
            const posId = Number(badge.dataset.posId);
            const deptId = Number(badge.dataset.deptId);

            try {
                // Gọi API để xóa phòng ban
                const response = await apiService.positions.removeDepartment(posId, deptId);

                if (response.success) {
                    await renderTable();
                    showAlert(response.message || 'Đã xóa phòng ban khỏi vị trí');
                } else {
                    showAlert(response.message || 'Không thể xóa phòng ban', 'error');
                }
            } catch (error) {
                console.error('Error removing department:', error);
                showAlert('Không thể xóa phòng ban', 'error');
            }
            return;
        }

        const btn = event.target.closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = Number(btn.dataset.id);
        if (!action || Number.isNaN(id)) return;

        if (action === 'add-dept') {
            await showDepartmentSelector(id, btn);
            return;
        }

        if (action === 'delete') {
            const confirmed = await showConfirm('Bạn có chắc chắn muốn xóa vị trí này?');
            if (!confirmed) return;

            try {
                if (await deletePosition(id)) {
                    showAlert('Đã xóa vị trí');
                    const modal = document.getElementById('pos-edit-modal');
                    if (modal) modal.style.display = 'none';
                    await renderTable();
                } else {
                    showAlert('Không tìm thấy vị trí để xóa', 'error');
                }
            } catch (error) {
                const errorMessage = error.message || 'Không thể xóa vị trí';
                showAlert(errorMessage, 'error');
            }
            return;
        }

        if (action === 'edit') {
            await openEditModal(id);
        }
    });
};
