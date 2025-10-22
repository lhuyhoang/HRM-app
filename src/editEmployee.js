import * as db from './employeeDb.js';
import * as deptDb from './department.js';
import * as posDb from './position.js';
import { showAlert } from './uiHelpers.js';
let employeeToEditId = null;
export const render = (container, employeeId, onUpdateSuccess) => {
    employeeToEditId = employeeId;
    const employee = db.getEmployeeById(employeeToEditId);
    if (!employee) {
        showAlert('Không tìm thấy nhân viên!', 'error');
        return;
    }
    const departments = deptDb.getAllDepartments();
    const positions = posDb.getAllPositions();
    const deptOptions = departments.map(d => `<option value="${d.id}" ${d.id === employee.departmentId ? 'selected' : ''}>${d.name}</option>`).join('');
    const posOptions = positions.map(p => `<option value="${p.id}" ${p.id === employee.positionId ? 'selected' : ''}>${p.title}</option>`).join('');
    container.innerHTML = `
        <hr>
        <h3>Sửa thông tin cho: ${employee.name} (ID: ${employee.id})</h3>
        <form id="edit-employee-form">
            <div class="form-group">
                <label for="edit-name">Họ và Tên</label>
                <input type="text" id="edit-name" value="${employee.name}" required>
            </div>
            <div class="form-group">
                <label for="edit-phone">Số điện thoại</label>
                <input type="tel" id="edit-phone" value="${employee.phone || ''}" placeholder="Ví dụ: 0901234567" required>
            </div>
            <div class="form-group">
                <label for="edit-email">Email</label>
                <input type="email" id="edit-email" value="${employee.email || ''}" placeholder="name@example.com" required>
            </div>
            <div class="form-group">
                <label for="edit-department">Phòng ban</label>
                <select id="edit-department" required>${deptOptions}</select>
            </div>
            <div class="form-group">
                <label for="edit-position">Vị trí</label>
                <select id="edit-position" required>${posOptions}</select>
            </div>
            <div class="form-group">
                <label for="edit-salary">Lương ($)</label>
                <input type="number" id="edit-salary" value="${employee.salary}" required min="0">
            </div>
            <button type="submit">Lưu Thay đổi</button>
            <button type="button" id="cancel-edit">Hủy</button>
        </form>
    `;
    const form = container.querySelector('#edit-employee-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = form.querySelector('#edit-phone').value.trim();
        const email = form.querySelector('#edit-email').value.trim();
        const phonePattern = /^[0-9+()\-\s]{9,20}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const updatedData = {
            ...employee,
            name: form.querySelector('#edit-name').value.trim(),
            phone,
            email,
            departmentId: Number(form.querySelector('#edit-department').value),
            positionId: Number(form.querySelector('#edit-position').value),
            salary: Number.parseFloat(form.querySelector('#edit-salary').value),
        };
        if (!updatedData.name || Number.isNaN(updatedData.salary) || updatedData.salary < 0) {
            showAlert('Dữ liệu cập nhật không hợp lệ', 'error');
            return;
        }
        if (!phone || !phonePattern.test(phone)) {
            showAlert('Số điện thoại không hợp lệ', 'error');
            return;
        }
        if (!email || !emailPattern.test(email)) {
            showAlert('Email không hợp lệ', 'error');
            return;
        }
        db.updateEmployee(updatedData);
        showAlert('Cập nhật thông tin thành công!');
        onUpdateSuccess();
    });
    container.querySelector('#cancel-edit').addEventListener('click', () => {
        container.innerHTML = '';
    });
};