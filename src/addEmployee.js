import * as db from './employeeDb.js';
import * as deptDb from './department.js';
import * as posDb from './position.js';
import { showAlert } from './uiHelpers.js';
export const render = (container) => {
    const departments = deptDb.getAllDepartments();
    if (departments.length === 0) {
        container.innerHTML = `
            <h2>Thêm Nhân viên Mới</h2>
            <p>Vui lòng tạo phòng ban trước khi thêm nhân viên.</p>
        `;
        return;
    }
    const deptOptions = departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    container.innerHTML = `
    <h2>Thêm Nhân viên Mới</h2>
        <form id="add-employee-form">
            <div class="form-group">
                <label for="name">Họ và Tên</label>
                <input type="text" id="name" required>
            </div>
            <div class="form-group">
                <label for="phone">Số điện thoại</label>
                <input type="tel" id="phone" placeholder="" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="name@example.com" required>
            </div>
            <div class="form-group">
                <label for="department">Phòng ban</label>
                <select id="department" required>
                    <option value="">-- Chọn phòng ban --</option>
                    ${deptOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="position">Vị trí</label>
                <select id="position" required disabled>
                    <option value="">-- Chọn vị trí --</option>
                </select>
                <small id="position-hint" style="display:block;color:#6c757d;margin-top:4px;"></small>
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
    const form = container.querySelector('#add-employee-form');
    const deptSelect = form.querySelector('#department');
    const posSelect = form.querySelector('#position');
    const posHint = form.querySelector('#position-hint');

    const resetPositions = () => {
        posSelect.innerHTML = `<option value="">-- Chọn vị trí --</option>`;
        posSelect.disabled = true;
        if (posHint) posHint.textContent = '';
    };
    const populatePositions = (departmentId) => {
        const positions = posDb.getPositionsByDepartment(departmentId);
        if (!positions || positions.length === 0) {
            resetPositions();
            if (posHint) posHint.textContent = 'Phòng ban này chưa có vị trí. Vui lòng tạo vị trí trước.';
            return;
        }
        const options = positions.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
        posSelect.innerHTML = `<option value="">-- Chọn vị trí --</option>${options}`;
        posSelect.disabled = false;
        if (posHint) posHint.textContent = '';
    };
    resetPositions();
    deptSelect.addEventListener('change', () => {
        const val = deptSelect.value;
        resetPositions();
        if (!val) return;
        populatePositions(Number(val));
    });
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEmployee = {
            name: container.querySelector('#name').value.trim(),
            phone: container.querySelector('#phone').value.trim(),
            email: container.querySelector('#email').value.trim(),
            departmentId: Number(deptSelect.value),
            positionId: Number(posSelect.value),
            salary: Number.parseFloat(container.querySelector('#salary').value),
            hireDate: container.querySelector('#hireDate').value,
            bonus: 0,
            deduction: 0
        };
        const phonePattern = /^[0-9+()\-\s]{9,20}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newEmployee.name || Number.isNaN(newEmployee.salary) || newEmployee.salary <= 0) {
            showAlert('Dữ liệu không hợp lệ', 'error');
            return;
        }
        if (!newEmployee.phone || !phonePattern.test(newEmployee.phone)) {
            showAlert('Số điện thoại không hợp lệ', 'error');
            return;
        }
        if (!newEmployee.email || !emailPattern.test(newEmployee.email)) {
            showAlert('Email không hợp lệ', 'error');
            return;
        }
        if (!deptSelect.value) {
            showAlert('Vui lòng chọn phòng ban', 'error');
            return;
        }
        if (!posSelect.value) {
            showAlert('Vui lòng chọn vị trí (hãy tạo vị trí cho phòng ban nếu chưa có)', 'error');
            return;
        }
        db.addEmployee(newEmployee);
        showAlert('Thêm nhân viên thành công');
        form.reset();
        resetPositions();
    });
};