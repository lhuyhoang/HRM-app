import * as db from './employeeDbModule.js';
import * as deptDb from './departmentModule.js';
import * as posDb from './positionModule.js';
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
                <label for="edit-department">Phòng ban</label>
                <select id="edit-department" required>${deptOptions}</select>
            </div>
             <div class="form-group">
                <label for="edit-salary">Lương ($)</label>
                <input type="number" id="edit-salary" value="${employee.salary}" required min="0">
            </div>
            <button type="submit">Lưu Thay đổi</button>
            <button type="button" id="cancel-edit">Hủy</button>
        </form>
    `;
    document.getElementById('edit-employee-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedData = {
            ...employee,
            name: document.getElementById('edit-name').value,
            departmentId: parseInt(document.getElementById('edit-department').value),
            salary: parseFloat(document.getElementById('edit-salary').value),
        };
        db.updateEmployee(updatedData);
        showAlert('Cập nhật thông tin thành công!');
        onUpdateSuccess();
    });
    document.getElementById('cancel-edit').addEventListener('click', () => {
        container.innerHTML = '';
    });
};