import * as EmployeeDB from './employeeDb.js?v=2';
import * as DeptDB from './department.js?v=2';
import * as PositionDB from './position.js?v=2';
import { createTable, showAlert, showConfirm } from './uiHelpers.js?v=2';
export const render = async (container) => {
    await DeptDB.init?.();
    await PositionDB.init?.();
    const departments = await DeptDB.getAllDepartments();

    if (!Array.isArray(departments)) {
        console.error('departments is not an array:', departments);
        container.innerHTML = '<p style="color:red;">Lỗi: Không thể tải danh sách phòng ban. Vui lòng thử lại.</p>';
        return;
    }

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
            <div style="display:grid; grid-template-columns: 1fr auto auto auto; gap:1rem; align-items:end; margin-bottom:1rem;">
                <div>
                    <label for="mgr-q" style="display:block; margin-bottom:0.5rem;">Tìm kiếm</label>
                    <input id="mgr-q" type="text" placeholder="Nhập từ khóa... (tên, số điện thoại, email)" style="width:100%; padding:0.5rem; border:1px solid #ddd; border-radius:4px;">
                </div>
                <div>
                    <label for="mgr-field" style="display:block; margin-bottom:0.5rem;">Theo</label>
                    <select id="mgr-field" style="width:200px; padding:0.5rem; border:1px solid #ddd; border-radius:4px;">
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
    const fillPositions = async (selectEl, departmentId, placeholder = '-- Tất cả vị trí --') => {
        const list = await PositionDB.getPositionsByDepartment(departmentId);
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
    deptSelect.addEventListener('change', async () => {
        const val = deptSelect.value;
        resetPos(posSelect);
        if (!val) return;
        await fillPositions(posSelect, Number(val));
    });
    const openAddModal = async () => {
        let modal = document.getElementById('mgr-add-modal');
        if (modal) {
            modal.style.display = 'block';
            return;
        }
        modal = document.createElement('div');
        modal.id = 'mgr-add-modal';
        modal.className = 'hrm-modal';
        modal.innerHTML = `
            <div id="mgr-add-modal-header" class="hrm-modal__header is-primary" style="cursor: move;">
                <strong>Thêm nhân viên</strong>
                <button id="mgr-add-close" class="hrm-modal__close">✕</button>
            </div>
            <div class="hrm-modal__body" style="padding: 24px; max-height: 70vh; overflow-y: auto;">
                <form id="mgr-add-form-modal" style="display: flex; flex-direction: column; gap: 20px;">
                    <div class="form-group" style="margin: 0;">
                        <label for="madd-name" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Họ và Tên</label>
                        <input type="text" id="madd-name" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="madd-phone" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Số điện thoại</label>
                        <input type="tel" id="madd-phone" placeholder="0901234567" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="madd-email" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Email</label>
                        <input type="email" id="madd-email" placeholder="name@example.com" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="madd-dept" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Phòng ban</label>
                        <select id="madd-dept" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box; background: white;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                            <option value="">-- Chọn phòng ban --</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="madd-pos" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Vị trí</label>
                        <select id="madd-pos" required disabled style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box; background: white;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                            <option value="">-- Chọn vị trí --</option>
                        </select>
                        <small id="madd-pos-hint" style="display:block; color:#6b7280; margin-top:6px; font-size:13px;"></small>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="madd-salary" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Lương ($)</label>
                        <input type="number" id="madd-salary" min="0" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="madd-hire" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Ngày vào làm</label>
                        <input type="date" id="madd-hire" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;">
                        <button type="button" id="madd-cancel" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6';" onmouseout="this.style.background='white';">Hủy</button>
                        <button type="submit" style="padding: 10px 20px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='#2563eb';" onmouseout="this.style.background='#3b82f6';">Lưu</button>
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
        const refreshDeptOptions = async (selectedId = null) => {
            const depts = await DeptDB.getAllDepartments();
            const opts = depts.map(d => `<option value="${d.id}" ${selectedId && d.id === selectedId ? 'selected' : ''}>${d.name}</option>`).join('');
            mDept.innerHTML = `<option value="">-- Chọn phòng ban --</option>${opts}`;
        };
        await refreshDeptOptions();
        mDept.addEventListener('focus', async () => {
            const current = mDept.value ? Number(mDept.value) : null;
            await refreshDeptOptions(current);
        });
        const resetModalPos = () => { resetPos(mPos, '-- Chọn vị trí --', true); if (mPosHint) mPosHint.textContent = ''; };
        resetModalPos();
        mDept.addEventListener('change', async () => {
            resetModalPos();
            if (!mDept.value) return;
            const ok = await fillPositions(mPos, Number(mDept.value), '-- Chọn vị trí --');
            if (!ok && mPosHint) mPosHint.textContent = 'Phòng ban này chưa có vị trí. Vui lòng tạo vị trí trước.';
        });
        const close = () => { modal.style.display = 'none'; };
        document.getElementById('mgr-add-close').addEventListener('click', close);
        document.getElementById('madd-cancel').addEventListener('click', close);
        const mForm = document.getElementById('mgr-add-form-modal');
        mForm.addEventListener('submit', async (e) => {
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
            try {
                await EmployeeDB.addEmployee({ name, phone, email, departmentId, positionId, salary, hireDate, bonus: 0, deduction: 0 });
                showAlert('Thêm nhân viên thành công');
                close();
                await renderTable();
            } catch (error) {
                showAlert('Không thể thêm nhân viên: ' + error.message, 'error');
            }
        });
    };
    addToggleBtn.addEventListener('click', openAddModal);
    const openEditModal = async (empId) => {
        const emp = await EmployeeDB.getEmployeeById(empId);
        if (!emp) { showAlert('Không tìm thấy nhân viên', 'error'); return; }
        let modal = document.getElementById('mgr-edit-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'mgr-edit-modal';
            modal.className = 'hrm-modal hrm-modal--md';
            modal.innerHTML = `
                <div id="mgr-edit-modal-header" class="hrm-modal__header is-secondary" style="cursor: move;">
                    <strong>Sửa nhân viên</strong>
                    <button id="mgr-edit-close" class="hrm-modal__close">✕</button>
                </div>
                <div class="hrm-modal__body" style="padding: 24px; max-height: 70vh; overflow-y: auto;">
                    <form id="mgr-edit-form-modal" style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="form-group" style="margin: 0;">
                            <label for="medit-name" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Họ và Tên</label>
                            <input type="text" id="medit-name" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label for="medit-phone" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Số điện thoại</label>
                            <input type="tel" id="medit-phone" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label for="medit-email" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Email</label>
                            <input type="email" id="medit-email" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label for="medit-dept" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Phòng ban</label>
                            <select id="medit-dept" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box; background: white;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';"></select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label for="medit-pos" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Vị trí</label>
                            <select id="medit-pos" required disabled style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box; background: white;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                                <option value="">-- Chọn vị trí --</option>
                            </select>
                            <small id="medit-pos-hint" style="display:block; color:#6b7280; margin-top:6px; font-size:13px;"></small>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label for="medit-salary" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Lương ($)</label>
                            <input type="number" id="medit-salary" min="0" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';" onblur="this.style.borderColor='#d1d5db';">
                        </div>
                        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;">
                            <button type="button" id="medit-cancel" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6';" onmouseout="this.style.background='white';">Hủy</button>
                            <button type="submit" style="padding: 10px 20px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='#2563eb';" onmouseout="this.style.background='#3b82f6';">Lưu</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            const header = document.getElementById('mgr-edit-modal-header');
            let isDragging = false; let startX = 0; let startY = 0; let startLeft = 0; let startTop = 0;
            const onMouseDown = (e) => {
                isDragging = true;
                modal.style.transform = 'none';
                startX = e.clientX; startY = e.clientY;
                if (!modal.style.left) modal.style.left = '50%';
                if (!modal.style.top) modal.style.top = '22%';
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
            const close = () => { modal.style.display = 'none'; };
            document.getElementById('mgr-edit-close').addEventListener('click', close);
            document.getElementById('medit-cancel').addEventListener('click', close);
            const mForm = document.getElementById('mgr-edit-form-modal');
            mForm.addEventListener('submit', async (ev) => {
                ev.preventDefault();
                const id = modal.dataset.empId;
                const base = await EmployeeDB.getEmployeeById(id);
                if (!base) { showAlert('Không tìm thấy nhân viên', 'error'); return; }
                const name = (document.getElementById('medit-name').value || '').trim();
                const phone = (document.getElementById('medit-phone').value || '').trim();
                const email = (document.getElementById('medit-email').value || '').trim();
                const departmentId = Number((document.getElementById('medit-dept')).value);
                const positionId = Number((document.getElementById('medit-pos')).value);
                const salary = Number.parseFloat((document.getElementById('medit-salary')).value);
                const phonePattern = /^[0-9+()\-\s]{9,20}$/;
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!name || Number.isNaN(salary) || salary < 0) { showAlert('Dữ liệu không hợp lệ', 'error'); return; }
                if (!phone || !phonePattern.test(phone)) { showAlert('Số điện thoại không hợp lệ', 'error'); return; }
                if (!email || !emailPattern.test(email)) { showAlert('Email không hợp lệ', 'error'); return; }
                if (!departmentId) { showAlert('Vui lòng chọn phòng ban', 'error'); return; }
                if (!positionId) { showAlert('Vui lòng chọn vị trí', 'error'); return; }
                try {
                    await EmployeeDB.updateEmployee({ ...base, name, phone, email, departmentId, positionId, salary });
                    showAlert('Cập nhật nhân viên thành công');
                    close();
                    await renderTable();
                } catch (error) {
                    showAlert('Không thể cập nhật: ' + error.message, 'error');
                }
            });
        }
        modal.dataset.empId = empId;
        const dSel = document.getElementById('medit-dept');
        const pSel = document.getElementById('medit-pos');
        const pHint = document.getElementById('medit-pos-hint');
        const deptsNow = await DeptDB.getAllDepartments();
        dSel.innerHTML = [`<option value="">-- Chọn phòng ban --</option>`, ...deptsNow.map(d => `<option value="${d.id}">${d.name}</option>`)].join('');
        dSel.value = String(emp.department_id || emp.departmentId || '');
        const ok = (emp.department_id || emp.departmentId) ? await fillPositions(pSel, Number(emp.department_id || emp.departmentId), '-- Chọn vị trí --') : (resetPos(pSel, '-- Chọn vị trí --', true), false);
        if (!ok && pHint) pHint.textContent = 'Phòng ban này chưa có vị trí. Vui lòng tạo vị trí trước.'; else if (pHint) pHint.textContent = '';
        pSel.value = String(emp.position_id || emp.positionId || '');
        document.getElementById('medit-name').value = emp.name || '';
        document.getElementById('medit-phone').value = emp.phone || '';
        document.getElementById('medit-email').value = emp.email || '';
        document.getElementById('medit-salary').value = String(Number(emp.salary) || 0);
        dSel.onchange = async () => {
            resetPos(pSel, '-- Chọn vị trí --', true);
            if (!dSel.value) return;
            const ok2 = await fillPositions(pSel, Number(dSel.value), '-- Chọn vị trí --');
            if (!ok2 && pHint) pHint.textContent = 'Phòng ban này chưa có vị trí. Vui lòng tạo vị trí trước.'; else if (pHint) pHint.textContent = '';
        };
        modal.style.display = 'block';
    };
    const getFilteredEmployees = async () => {
        const all = await EmployeeDB.getAllEmployees();
        const deptVal = deptSelect.value;
        const posVal = posSelect.value;
        const field = fieldSelect.value;
        const q = (queryInput.value || '').trim().toLowerCase();
        return all.filter(emp => {
            const empDeptId = emp.department_id || emp.departmentId;
            const empPosId = emp.position_id || emp.positionId;
            if (deptVal && empDeptId !== Number(deptVal)) return false;
            if (posVal && empPosId !== Number(posVal)) return false;
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
    const renderTable = async () => {
        const list = await getFilteredEmployees();
        if (list.length === 0) {
            resultsContainer.innerHTML = '<p>Không có nhân viên phù hợp.</p>';
            return;
        }
        const departments = await DeptDB.getAllDepartments();
        const positions = await PositionDB.getAllPositions();

        const table = createTable(
            ['ID', 'Tên', 'Số điện thoại', 'Email', 'Phòng ban', 'Vị trí', 'Lương', 'Hành động'],
            list,
            (emp) => {
                const empDeptId = emp.department_id || emp.departmentId;
                const empPosId = emp.position_id || emp.positionId;
                const dept = departments.find(d => d.id === empDeptId);
                const pos = positions.find(p => p.id === empPosId);
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
                        <td style="padding: 8px;">
                            <div style="display: flex; gap: 8px; align-items: center; justify-content: center;">
                                <button class="mgr-edit" data-id="${emp.id}" style="background: transparent; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                                <button class="mgr-delete" data-id="${emp.id}" style="background: transparent; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
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
        resultsContainer.innerHTML = table;
    };
    searchBtn.addEventListener('click', async () => await renderTable());
    queryInput.addEventListener('keydown', async (e) => { if (e.key === 'Enter') await renderTable(); });
    deptSelect.addEventListener('change', async () => await renderTable());
    posSelect.addEventListener('change', async () => await renderTable());
    resultsContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.classList.contains('mgr-delete')) {
            const ok = await showConfirm('Xóa nhân viên này?');
            if (!ok) return;
            try {
                await EmployeeDB.deleteEmployee(id);
                showAlert('Đã xóa nhân viên');
                await renderTable();
                editContainer.innerHTML = '';
            } catch (error) {
                showAlert('Không thể xóa: ' + error.message, 'error');
            }
            return;
        }
        if (btn.classList.contains('mgr-edit')) {
            await openEditModal(id);
        }
    });
    await renderTable();
};
