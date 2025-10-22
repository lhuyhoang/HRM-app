import * as EmployeeDB from './employeeDb.js';
import * as DeptDB from './department.js';
import * as PositionDB from './position.js';
import { createTable, showAlert, showConfirm } from './uiHelpers.js';
export const render = (container) => {
    DeptDB.init?.();
    PositionDB.init?.();
    const departments = DeptDB.getAllDepartments();
    const deptOptions = departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    container.innerHTML = `
        <h2>Quản lý nhân viên</h2>
        <div class="form-container" style="max-width: none; padding: 1rem;">
            <div class="form-group">
                <label for="mgr-dept">Phòng ban</label>
                <select id="mgr-dept">
                    <option value="">-- Tất cả phòng ban --</option>
                    ${deptOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="mgr-pos">Vị trí</label>
                <select id="mgr-pos" disabled>
                    <option value="">-- Tất cả vị trí --</option>
                </select>
            </div>
            <div class="form-group" style="display:flex; gap:.5rem; align-items:flex-end;">
                <div style="flex:1;">
                    <label for="mgr-q">Tìm kiếm</label>
                    <input id="mgr-q" type="text" placeholder="Nhập từ khóa... (tên, số điện thoại, email)">
                </div>
                <div>
                    <label for="mgr-field">Theo</label>
                    <select id="mgr-field">
                        <option value="all">Tất cả</option>
                        <option value="name">Tên</option>
                        <option value="phone">Số điện thoại</option>
                        <option value="email">Email</option>
                    </select>
                </div>
                <button id="mgr-search">Tìm</button>
                <button id="mgr-show-add" class="secondary">+ Thêm nhân viên</button>
            </div>
        </div>
        <div id="mgr-edit"></div>
        <div id="mgr-results"></div>
    `;
    const deptSelect = container.querySelector('#mgr-dept');
    const posSelect = container.querySelector('#mgr-pos');
    const searchBtn = container.querySelector('#mgr-search');
    const queryInput = container.querySelector('#mgr-q');
    const fieldSelect = container.querySelector('#mgr-field');
    const addToggleBtn = container.querySelector('#mgr-show-add');
    const editContainer = container.querySelector('#mgr-edit');
    const resultsContainer = container.querySelector('#mgr-results');
    const resetPos = (selectEl, placeholder = '-- Tất cả vị trí --', disabled = true) => {
        selectEl.innerHTML = `<option value="">${placeholder}</option>`;
        selectEl.disabled = disabled;
    };
    const fillPositions = (selectEl, departmentId, placeholder = '-- Tất cả vị trí --') => {
        const list = PositionDB.getPositionsByDepartment(departmentId);
        if (!list || list.length === 0) {
            resetPos(selectEl, placeholder, true);
            return false;
        }
        const opts = list.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
        selectEl.innerHTML = `<option value="">${placeholder}</option>${opts}`;
        selectEl.disabled = false;
        return true;
    };
    resetPos(posSelect);
    deptSelect.addEventListener('change', () => {
        const val = deptSelect.value;
        resetPos(posSelect);
        if (!val) return;
        fillPositions(posSelect, Number(val));
    });
    const openAddModal = () => {
        let modal = document.getElementById('mgr-add-modal');
        if (modal) {
            modal.style.display = 'block';
            return;
        }
        modal = document.createElement('div');
        modal.id = 'mgr-add-modal';
        modal.style.cssText = [
            'position:fixed', 'top:20%', 'left:50%', 'transform:translate(-50%, -20%)',
            'width:420px', 'max-width:90vw', 'background:#fff', 'border:1px solid #ddd', 'border-radius:8px',
            'box-shadow:0 10px 30px rgba(0,0,0,.2)', 'z-index:9999'
        ].join(';');
        modal.innerHTML = `
            <div id="mgr-add-modal-header" style="cursor:move; padding:.6rem .8rem; background:#0d6efd; color:#fff; border-top-left-radius:8px; border-top-right-radius:8px; display:flex; align-items:center; justify-content:space-between;">
                <strong>Thêm nhân viên</strong>
                <button id="mgr-add-close" style="background:transparent;border:none;color:#fff;font-size:18px;line-height:1;cursor:pointer">✕</button>
            </div>
            <div style="padding:1rem;">
                <form id="mgr-add-form-modal">
                    <div class="form-group">
                        <label for="madd-name">Họ và Tên</label>
                        <input type="text" id="madd-name" required>
                    </div>
                    <div class="form-group">
                        <label for="madd-phone">Số điện thoại</label>
                        <input type="tel" id="madd-phone" placeholder="0901234567" required>
                    </div>
                    <div class="form-group">
                        <label for="madd-email">Email</label>
                        <input type="email" id="madd-email" placeholder="name@example.com" required>
                    </div>
                    <div class="form-group">
                        <label for="madd-dept">Phòng ban</label>
                        <select id="madd-dept" required>
                            <option value="">-- Chọn phòng ban --</option>
                            ${deptOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="madd-pos">Vị trí</label>
                        <select id="madd-pos" required disabled>
                            <option value="">-- Chọn vị trí --</option>
                        </select>
                        <small id="madd-pos-hint" style="display:block;color:#6c757d;margin-top:4px;"></small>
                    </div>
                    <div class="form-group">
                        <label for="madd-salary">Lương ($)</label>
                        <input type="number" id="madd-salary" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="madd-hire">Ngày vào làm</label>
                        <input type="date" id="madd-hire" required>
                    </div>
                    <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:.5rem;">
                        <button type="button" id="madd-cancel" class="secondary">Hủy</button>
                        <button type="submit">Lưu</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        const header = document.getElementById('mgr-add-modal-header');
        let isDragging = false; let startX = 0; let startY = 0; let startLeft = 0; let startTop = 0;
        const toPx = (v) => Number(String(v).replace('px', '')) || 0;
        const onMouseDown = (e) => {
            isDragging = true;
            modal.style.transform = 'none';
            startX = e.clientX; startY = e.clientY;
            if (!modal.style.left) modal.style.left = '50%';
            if (!modal.style.top) modal.style.top = '20%';
            startLeft = modal.offsetLeft; startTop = modal.offsetTop;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX; const dy = e.clientY - startY;
            let newLeft = startLeft + dx; let newTop = startTop + dy;
            const vw = window.innerWidth; const vh = window.innerHeight;
            const rect = modal.getBoundingClientRect();
            const maxLeft = vw - rect.width; const maxTop = vh - rect.height;
            newLeft = Math.max(0, Math.min(newLeft, Math.max(0, maxLeft)));
            newTop = Math.max(0, Math.min(newTop, Math.max(0, maxTop)));
            modal.style.left = newLeft + 'px';
            modal.style.top = newTop + 'px';
        };
        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        header.addEventListener('mousedown', onMouseDown);
        const mDept = document.getElementById('madd-dept');
        const mPos = document.getElementById('madd-pos');
        const mPosHint = document.getElementById('madd-pos-hint');
        const resetModalPos = () => { resetPos(mPos, '-- Chọn vị trí --', true); if (mPosHint) mPosHint.textContent = ''; };
        resetModalPos();
        mDept.addEventListener('change', () => {
            resetModalPos();
            if (!mDept.value) return;
            const ok = fillPositions(mPos, Number(mDept.value), '-- Chọn vị trí --');
            if (!ok && mPosHint) mPosHint.textContent = 'Phòng ban này chưa có vị trí. Vui lòng tạo vị trí trước.';
        });
        // Close & cancel
        const close = () => { modal.style.display = 'none'; };
        document.getElementById('mgr-add-close').addEventListener('click', close);
        document.getElementById('madd-cancel').addEventListener('click', close);
        // Submit add form
        const mForm = document.getElementById('mgr-add-form-modal');
        mForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = (document.getElementById('madd-name').value || '').trim();
            const phone = (document.getElementById('madd-phone').value || '').trim();
            const email = (document.getElementById('madd-email').value || '').trim();
            const departmentId = Number((document.getElementById('madd-dept')).value);
            const positionId = Number((document.getElementById('madd-pos')).value);
            const salary = Number.parseFloat((document.getElementById('madd-salary')).value);
            const hireDate = (document.getElementById('madd-hire')).value;
            const phonePattern = /^[0-9+()\-\s]{9,20}$/;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!name || Number.isNaN(salary) || salary <= 0) { showAlert('Dữ liệu không hợp lệ', 'error'); return; }
            if (!phone || !phonePattern.test(phone)) { showAlert('Số điện thoại không hợp lệ', 'error'); return; }
            if (!email || !emailPattern.test(email)) { showAlert('Email không hợp lệ', 'error'); return; }
            if (!departmentId) { showAlert('Vui lòng chọn phòng ban', 'error'); return; }
            if (!positionId) { showAlert('Vui lòng chọn vị trí', 'error'); return; }
            EmployeeDB.addEmployee({ name, phone, email, departmentId, positionId, salary, hireDate, bonus: 0, deduction: 0 });
            showAlert('Thêm nhân viên thành công');
            close();
            renderTable();
        });
    };
    addToggleBtn.addEventListener('click', openAddModal);
    const getFilteredEmployees = () => {
        const all = EmployeeDB.getAllEmployees();
        const deptVal = deptSelect.value;
        const posVal = posSelect.value;
        const field = fieldSelect.value;
        const q = (queryInput.value || '').trim().toLowerCase();
        return all.filter(emp => {
            if (deptVal && emp.departmentId !== Number(deptVal)) return false;
            if (posVal && emp.positionId !== Number(posVal)) return false;
            if (!q) return true;
            const name = (emp.name || '').toLowerCase();
            const phone = (emp.phone || '').toLowerCase();
            const email = (emp.email || '').toLowerCase();
            if (field === 'name') return name.includes(q);
            if (field === 'phone') return phone.includes(q);
            if (field === 'email') return email.includes(q);
            return name.includes(q) || phone.includes(q) || email.includes(q);
        });
    };
    const renderTable = () => {
        const list = getFilteredEmployees();
        if (list.length === 0) {
            resultsContainer.innerHTML = '<p>Không có nhân viên phù hợp.</p>';
            return;
        }
        const table = createTable(
            ['ID', 'Tên', 'Số điện thoại', 'Email', 'Phòng ban', 'Vị trí', 'Lương', 'Hành động'],
            list,
            (emp) => {
                const dept = departments.find(d => d.id === emp.departmentId);
                const pos = PositionDB.getAllPositions().find(p => p.id === emp.positionId);
                const salary = Number(emp.salary) || 0;
                return `
                    <tr>
                        <td>${emp.id}</td>
                        <td>${emp.name || ''}</td>
                        <td>${emp.phone || ''}</td>
                        <td>${emp.email || ''}</td>
                        <td>${dept ? dept.name : ''}</td>
                        <td>${pos ? pos.title : ''}</td>
                        <td>$${salary.toLocaleString()}</td>
                        <td>
                            <button class="mgr-edit" data-id="${emp.id}">Sửa</button>
                            <button class="danger mgr-delete" data-id="${emp.id}">Xóa</button>
                        </td>
                    </tr>
                `;
            }
        );
        resultsContainer.innerHTML = table;
    };
    searchBtn.addEventListener('click', renderTable);
    queryInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') renderTable(); });
    deptSelect.addEventListener('change', renderTable);
    posSelect.addEventListener('change', renderTable);
    resultsContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.classList.contains('mgr-delete')) {
            const ok = await showConfirm('Xóa nhân viên này?');
            if (!ok) return;
            EmployeeDB.deleteEmployee(id);
            showAlert('Đã xóa nhân viên');
            renderTable();
            editContainer.innerHTML = '';
            return;
        }
        if (btn.classList.contains('mgr-edit')) {
            const emp = EmployeeDB.getEmployeeById(id);
            if (!emp) return;
            const deptOpts = DeptDB.getAllDepartments().map(d => `<option value="${d.id}" ${d.id === emp.departmentId ? 'selected' : ''}>${d.name}</option>`).join('');
            const allPos = PositionDB.getAllPositions();
            const posOpts = allPos.map(p => `<option value="${p.id}" ${p.id === emp.positionId ? 'selected' : ''}>${p.title}</option>`).join('');
            editContainer.innerHTML = `
                <div class="form-container">
                    <h3>Sửa: ${emp.name} (ID: ${emp.id})</h3>
                    <form id="mgr-edit-form">
                        <div class="form-group">
                            <label for="edit-name">Họ và Tên</label>
                            <input type="text" id="edit-name" value="${emp.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-phone">Số điện thoại</label>
                            <input type="tel" id="edit-phone" value="${emp.phone || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-email">Email</label>
                            <input type="email" id="edit-email" value="${emp.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-dept">Phòng ban</label>
                            <select id="edit-dept" required>${deptOpts}</select>
                        </div>
                        <div class="form-group">
                            <label for="edit-pos">Vị trí</label>
                            <select id="edit-pos" required>${posOpts}</select>
                        </div>
                        <div class="form-group">
                            <label for="edit-salary">Lương ($)</label>
                            <input type="number" id="edit-salary" value="${Number(emp.salary) || 0}" min="0" required>
                        </div>
                        <button type="submit">Lưu</button>
                        <button type="button" id="mgr-cancel-edit" class="secondary">Hủy</button>
                    </form>
                </div>
            `;
            const editForm = document.getElementById('mgr-edit-form');
            const editDept = editForm.querySelector('#edit-dept');
            const editPos = editForm.querySelector('#edit-pos');
            editDept.addEventListener('change', () => {
                const val = editDept.value;
                if (!val) return;
                const ok = fillPositions(editPos, Number(val), '-- Chọn vị trí --');
                if (!ok) {
                    editPos.innerHTML = '<option value="">-- Chọn vị trí --</option>';
                }
            });
            editForm.addEventListener('submit', (ev) => {
                ev.preventDefault();
                const name = editForm.querySelector('#edit-name').value.trim();
                const phone = editForm.querySelector('#edit-phone').value.trim();
                const email = editForm.querySelector('#edit-email').value.trim();
                const departmentId = Number(editDept.value);
                const positionId = Number(editPos.value);
                const salary = Number.parseFloat(editForm.querySelector('#edit-salary').value);
                const phonePattern = /^[0-9+()\-\s]{9,20}$/;
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!name || Number.isNaN(salary) || salary < 0) { showAlert('Dữ liệu không hợp lệ', 'error'); return; }
                if (!phone || !phonePattern.test(phone)) { showAlert('Số điện thoại không hợp lệ', 'error'); return; }
                if (!email || !emailPattern.test(email)) { showAlert('Email không hợp lệ', 'error'); return; }
                if (!departmentId) { showAlert('Vui lòng chọn phòng ban', 'error'); return; }
                if (!positionId) { showAlert('Vui lòng chọn vị trí', 'error'); return; }
                EmployeeDB.updateEmployee({ ...emp, name, phone, email, departmentId, positionId, salary });
                showAlert('Cập nhật nhân viên thành công');
                editContainer.innerHTML = '';
                renderTable();
            });
            document.getElementById('mgr-cancel-edit').addEventListener('click', () => {
                editContainer.innerHTML = '';
            });
        }
    });
    renderTable();
};
