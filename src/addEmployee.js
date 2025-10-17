import * as db from './employeeDb.js';
import * as deptDb from './department.js';
import * as posDb from './position.js';
import { showAlert } from './uiHelpers';
export const render = (container) => {
    const departments = depDb.getAllDepartments();
    const positions = posDb.getAllPositions();
    const deptOptions = departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    const posOptions = positions.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
    container.innerHTML = `
    <h2>Thêm Nhân viên Mới</h2>
        <form id="add-employee-form">
            <div class="form-group">
                <label for="name">Họ và Tên</label>
                <input type="text" id="name" required>
            </div>
            <div class="form-group">
                <label for="department">Phòng ban</label>
                <select id="department" required>${deptOptions}</select>
            </div>
            <div class="form-group">
                <label for="position">Vị trí</label>
                <select id="position" required>${posOptions}</select>
            </div>
            <div class="form-group">
                <label for="salary">Lương ($)</label>
                <input type="number" id="salary" required min="0">
            </div>
            <div class="form-group">
                <label for="hireDate">Ngày vào làm</label>
                <input type="date" id="hireDate" required>
            </div>
            <button type="submit">Thêm Nhân viên</button>
        </form>
    `;
    const form = document.getElementById('add-employee-form');
    form.addEventListener('sumit', (e) => {
        e.preventDefault();
        const newEmployee = {
            name: document.getElementById('name').value,
            departmentId: parseInt(document.getElementById('department').value),
            positionId: parseInt(document.getElementById('position').value),
            salary: parseFloat(document.getElementById('salary').value),
            hireDate: document.getElementById('hireDate').value,
            bonus: 0,
            deduction: 0
        };
        if (!newEmployee.name || newEmployee.salary <= 0) {
            showAlert('Dữ liệu không hợp lệ', 'error');
            return;
        }
        db.addEmployee(newEmployee);
        showAlert('Thêm nhân viên thành công');
        form.reset();
    });
};