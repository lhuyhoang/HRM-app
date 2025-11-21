import * as EmployeeDB from './employeeDb.js?v=2';
import * as DeptDB from './department.js?v=2';
import * as PositionDB from './position.js?v=2';
import { createTable, showAlert, showConfirm } from './uiHelpers.js?v=2';
import apiService from './apiService.js';

export const init = async () => {
};

export const getAllReviews = async () => {
    try {
        const response = await apiService.performance.getAll();
        return response.success ? response.data : [];
    } catch (error) {
        console.error('Failed to fetch performance reviews', error);
        return [];
    }
};

export const addReview = async ({ employeeId, period, rating, comments }) => {
    try {
        const ratingObj = RATINGS.find(r => r.value === rating);
        const numericRating = ratingObj ? ratingObj.rating : 3;

        const response = await apiService.performance.create({
            employee_id: employeeId,
            review_period: period,
            rating: numericRating,
            category: rating,
            comments: comments || null
        });
        if (response.success) {
            return response.data;
        }
        throw new Error(response.message || 'Failed to create review');
    } catch (error) {
        console.error('Failed to add review', error);
        throw error;
    }
};

export const updateReview = async (id, updatedData) => {
    try {
        const ratingObj = RATINGS.find(r => r.value === updatedData.rating);
        const numericRating = ratingObj ? ratingObj.rating : 3;

        const response = await apiService.performance.update(id, {
            rating: numericRating,
            category: updatedData.rating,
            comments: updatedData.comments || null
        });
        if (!response.success) {
            throw new Error(response.message || 'Failed to update review');
        }
        return response.data;
    } catch (error) {
        console.error('Failed to update review', error);
        throw error;
    }
};

export const getReviewById = async (id) => {
    try {
        const reviews = await getAllReviews();
        return reviews.find(r => Number(r.id) === Number(id)) || null;
    } catch (error) {
        console.error('Failed to fetch review', error);
        return null;
    }
};

export const deleteReview = async (id) => {
    try {
        const response = await apiService.performance.delete(id);
        return response.success;
    } catch (error) {
        console.error('Failed to delete review', error);
        return false;
    }
};
const RATINGS = [
    { value: 'excellent', label: 'Xuất sắc', rating: 5 },
    { value: 'good', label: 'Tốt', rating: 4 },
    { value: 'average', label: 'Trung bình', rating: 3 },
    { value: 'poor', label: 'Cần cải thiện', rating: 2 },
];
export const render = async (container) => {
    init();
    const employees = await EmployeeDB.getAllEmployees();
    if (employees.length === 0) {
        container.innerHTML = `
            <h2>Đánh giá hiệu suất</h2>
            <p>Vui lòng thêm nhân viên trước khi thực hiện đánh giá.</p>
        `;
        return;
    }
    const departments = await DeptDB.getAllDepartments();
    const deptOptions = departments
        .map((dept) => `<option value="${dept.id}">${dept.name}</option>`)
        .join('');
    const ratingOptions = RATINGS
        .map((item) => `<option value="${item.value}">${item.label}</option>`)
        .join('');
    container.innerHTML = `
        <h2>Đánh giá hiệu suất</h2>
        <form id="performance-form" class="form-group">
            <label for="performance-department">Phòng ban</label>
            <select id="performance-department" required>
                <option value="">-- Chọn phòng ban --</option>
                ${deptOptions}
            </select>
            <label for="performance-position">Vị trí</label>
            <select id="performance-position" required disabled>
                <option value="">-- Chọn vị trí --</option>
            </select>
            <label for="performance-employee">Nhân viên</label>
            <select id="performance-employee" required disabled>
                <option value="">-- Chọn nhân viên --</option>
            </select>
            <label for="performance-period">Kỳ đánh giá</label>
            <input type="month" id="performance-period" required>
            <label for="performance-rating">Xếp loại</label>
            <select id="performance-rating" required>
                ${ratingOptions}
            </select>
            <label for="performance-comments">Nhận xét</label>
            <textarea id="performance-comments" rows="3" placeholder="Ghi chú"></textarea>
            <button type="submit">Lưu đánh giá</button>
        </form>
        <div id="performance-table"></div>
    `;
    const form = container.querySelector('#performance-form');
    const tableWrapper = container.querySelector('#performance-table');
    const deptSelect = form.querySelector('#performance-department');
    const positionSelect = form.querySelector('#performance-position');
    const employeeSelect = form.querySelector('#performance-employee');
    const resetSelect = (selectEl, placeholder, disabled = true) => {
        selectEl.innerHTML = `<option value="">${placeholder}</option>`;
        selectEl.disabled = disabled;
    };
    const populatePositions = async (departmentId) => {
        const positions = await PositionDB.getPositionsByDepartment(departmentId);
        const options = positions.map((pos) => `<option value="${pos.id}">${pos.title}</option>`).join('');
        positionSelect.innerHTML = `<option value="">-- Chọn vị trí --</option>${options}`;
        positionSelect.disabled = positions.length === 0;
    };
    const populateEmployees = async (departmentId, positionId) => {
        const allEmployees = await EmployeeDB.getAllEmployees();
        const filtered = allEmployees.filter(
            (emp) => (emp.departmentId || emp.department_id) === departmentId && (emp.positionId || emp.position_id) === positionId
        );
        const options = filtered.map((emp) => `<option value="${emp.id}">${emp.name} (${emp.id})</option>`).join('');
        employeeSelect.innerHTML = `<option value="">-- Chọn nhân viên --</option>${options}`;
        employeeSelect.disabled = filtered.length === 0;
    };
    resetSelect(positionSelect, '-- Chọn vị trí --', true);
    resetSelect(employeeSelect, '-- Chọn nhân viên --', true);

    deptSelect.addEventListener('change', async () => {
        const deptVal = deptSelect.value;
        resetSelect(positionSelect, '-- Chọn vị trí --', true);
        resetSelect(employeeSelect, '-- Chọn nhân viên --', true);
        if (!deptVal) return;
        await populatePositions(Number(deptVal));
    });
    positionSelect.addEventListener('change', async () => {
        const deptVal = deptSelect.value;
        const posVal = positionSelect.value;
        resetSelect(employeeSelect, '-- Chọn nhân viên --', true);
        if (!deptVal || !posVal) return;
        await populateEmployees(Number(deptVal), Number(posVal));
    });
    const renderTable = async () => {
        const reviews = await getAllReviews();
        const currentEmployees = await EmployeeDB.getAllEmployees();
        if (reviews.length === 0) {
            tableWrapper.innerHTML = '<p>Chưa có đánh giá nào.</p>';
            return;
        }
        const tableHtml = createTable(
            ['Nhân viên', 'Số điện thoại', 'Email', 'Kỳ đánh giá', 'Xếp loại', 'Nhận xét', 'Hành động'],
            reviews,
            (review) => {
                const employeeId = review.employee_id || review.employeeId;
                const employee = currentEmployees.find((emp) => Number(emp.id) === Number(employeeId));
                const ratingLabel = RATINGS.find((item) => item.value === review.category)?.label || review.category;
                const phone = employee?.phone || '';
                const email = employee?.email || '';
                const period = review.review_period || review.period;
                return `
                    <tr>
                        <td>${employee ? employee.name : 'N/A'} (${employeeId})</td>
                        <td>${phone}</td>
                        <td>${email}</td>
                        <td>${period}</td>
                        <td>${ratingLabel}</td>
                        <td>${review.comments || ''}</td>
                        <td style="padding: 8px;">
                            <div style="display: flex; gap: 8px; align-items: center; justify-content: center;">
                                <button data-action="edit" data-id="${review.id}" style="background: transparent; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                                <button data-action="delete" data-id="${review.id}" style="background: transparent; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
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
                `;
            }
        );
        tableWrapper.innerHTML = tableHtml;
    };
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const deptVal = deptSelect.value;
        const posVal = positionSelect.value;
        const employeeId = employeeSelect.value;
        const period = form.querySelector('#performance-period').value;
        const rating = form.querySelector('#performance-rating').value;
        const comments = form.querySelector('#performance-comments').value.trim();
        if (!deptVal || !posVal || !employeeId || !period || !rating) {
            showAlert('Vui lòng chọn phòng ban, vị trí, nhân viên và điền đầy đủ thông tin', 'error');
            return;
        }
        const emp = await EmployeeDB.getEmployeeById(employeeId);
        const empDeptId = emp?.departmentId || emp?.department_id;
        const empPosId = emp?.positionId || emp?.position_id;
        if (!emp || empDeptId !== Number(deptVal) || empPosId !== Number(posVal)) {
            showAlert('Nhân viên không thuộc phòng ban/ vị trí đã chọn', 'error');
            return;
        }

        const editId = form.dataset.editId;
        try {
            if (editId) {
                await updateReview(Number(editId), { employeeId, period, rating, comments });
                showAlert('Đã cập nhật đánh giá');
                delete form.dataset.editId;
                form.querySelector('button[type="submit"]').textContent = 'Lưu đánh giá';
            } else {
                await addReview({ employeeId, period, rating, comments });
                showAlert('Đã lưu đánh giá');
            }

            form.reset();
            deptSelect.value = '';
            resetSelect(positionSelect, '-- Chọn vị trí --', true);
            resetSelect(employeeSelect, '-- Chọn nhân viên --', true);
            await renderTable();
        } catch (error) {
            showAlert(error.message || 'Không thể lưu đánh giá', 'error');
        }
    });
    tableWrapper.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) {
            return;
        }
        const id = Number(button.dataset.id);
        if (Number.isNaN(id)) {
            return;
        }
        const action = button.dataset.action;

        if (action === 'edit') {
            const review = await getReviewById(id);
            if (!review) {
                showAlert('Không tìm thấy đánh giá', 'error');
                return;
            }

            const employeeId = review.employee_id || review.employeeId;
            const employee = await EmployeeDB.getEmployeeById(employeeId);
            if (!employee) {
                showAlert('Không tìm thấy nhân viên', 'error');
                return;
            }

            const empDeptId = employee.departmentId || employee.department_id;
            const empPosId = employee.positionId || employee.position_id;

            deptSelect.value = empDeptId;
            await populatePositions(Number(empDeptId));

            positionSelect.value = empPosId;
            await populateEmployees(Number(empDeptId), Number(empPosId));

            employeeSelect.value = employeeId;
            form.querySelector('#performance-period').value = review.review_period || review.period;
            form.querySelector('#performance-rating').value = review.category || review.rating;
            form.querySelector('#performance-comments').value = review.comments || '';

            form.dataset.editId = id;
            form.querySelector('button[type="submit"]').textContent = 'Cập nhật đánh giá';

            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        if (action === 'delete') {
            const confirmed = await showConfirm('Xóa đánh giá này?');
            if (!confirmed) {
                return;
            }
            const success = await deleteReview(id);
            if (success) {
                showAlert('Đã xóa đánh giá');
                await renderTable();
            } else {
                showAlert('Không thể xóa đánh giá', 'error');
            }
        }
    });
    await renderTable();
};
