import * as DeptDB from './department.js';
import { createTable, showAlert, showConfirm } from './uiHelpers.js';
const POSITION_KEY = 'hrm_positions';
const initialData = () => [];
const savePositions = (positions) => {
    localStorage.setItem(POSITION_KEY, JSON.stringify(positions));
};
export const init = () => {
    if (!localStorage.getItem(POSITION_KEY)) {
        savePositions(initialData());
    }
};
export const getAllPositions = () => {
    try {
        return JSON.parse(localStorage.getItem(POSITION_KEY)) || [];
    } catch (error) {
        console.error('Failed to parse positions from storage', error);
        return [];
    }
};
export const getPositionById = (id) => getAllPositions().find((pos) => pos.id === id) || null;
export const getPositionsByDepartment = (departmentId) => {
    return getAllPositions().filter((pos) => pos.departmentId === departmentId);
};
export const addPosition = ({ title, departmentId = null, baseSalary = 0 }) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
        throw new Error('Position title is required');
    }
    const positions = getAllPositions();
    const newPosition = {
        id: Date.now(),
        title: trimmedTitle,
        departmentId,
        baseSalary: Number.isFinite(baseSalary) ? baseSalary : 0,
    };
    positions.push(newPosition);
    savePositions(positions);
    return newPosition;
};
export const updatePosition = (updatedPosition) => {
    const positions = getAllPositions();
    const nextPositions = positions.map((pos) => (pos.id === updatedPosition.id ? updatedPosition : pos));
    savePositions(nextPositions);
};
export const deletePosition = (id) => {
    const positions = getAllPositions();
    const nextPositions = positions.filter((pos) => pos.id !== id);
    if (nextPositions.length === positions.length) {
        return false;
    }
    savePositions(nextPositions);
    return true;
};
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
};
export const render = (container) => {
    init();
    const departments = DeptDB.getAllDepartments();
    const departmentOptions = departments
        .map((dept) => `<option value="${dept.id}">${dept.name}</option>`)
        .join('');
    container.innerHTML = `
		<h2>Quản lý vị trí</h2>
		${departments.length === 0
            ? '<p>Vui lòng tạo phòng ban trước khi thêm vị trí.</p>'
            : `
			<form id="position-form">
				<div class="form-group">
					<label for="position-title">Tên vị trí</label>
					<input type="text" id="position-title" required>
				</div>
				<div class="form-group">
					<label for="position-department">Phòng ban</label>
					<select id="position-department" required>
						<option value="">-- Chọn phòng ban --</option>
						${departmentOptions}
					</select>
				</div>
				<div class="form-group">
					<label for="position-salary">Lương cơ bản (VND)</label>
					<input type="number" id="position-salary" min="0" step="100000" placeholder="0">
				</div>
				<button type="submit">Thêm vị trí</button>
			</form>
		`
        }
        <div id="position-table"></div>
	`;
    const tableWrapper = container.querySelector('#position-table');
    const renderTable = () => {
        const positions = getAllPositions();
        if (positions.length === 0) {
            tableWrapper.innerHTML = '<p>Chưa có vị trí nào.</p>';
            return;
        }
        const tableHtml = createTable(
            ['ID', 'Tên vị trí', 'Phòng ban', 'Lương cơ bản (VND)', 'Hành động'],
            positions,
            (pos) => {
                const department = DeptDB.getAllDepartments().find((dept) => dept.id === pos.departmentId);
                const departmentName = department ? department.name : 'Không xác định';
                const salaryLabel = pos.baseSalary ? `${formatCurrency(pos.baseSalary)}` : '0';
                return `
					<tr>
						<td>${pos.id}</td>
						<td>${pos.title}</td>
						<td>${departmentName}</td>
						<td>${salaryLabel}</td>
						<td>
                            <button data-action="edit" data-id="${pos.id}">Sửa</button>
                            <button class="danger" data-action="delete" data-id="${pos.id}">Xóa</button>
                        </td>
					</tr>
				`;
            }
        );
        tableWrapper.innerHTML = tableHtml;
    };
    renderTable();
    const form = container.querySelector('#position-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const titleInput = form.querySelector('#position-title');
            const departmentSelect = form.querySelector('#position-department');
            const salaryInput = form.querySelector('#position-salary');
            const title = titleInput.value.trim();
            const departmentValue = departmentSelect.value;
            const baseSalary = Number(salaryInput.value);
            if (!title) {
                showAlert('Tên vị trí không được để trống', 'error');
                return;
            }
            if (!departmentValue) {
                showAlert('Vui lòng chọn phòng ban', 'error');
                return;
            }
            const departmentId = Number(departmentValue);
            try {
                addPosition({
                    title,
                    departmentId,
                    baseSalary: Number.isFinite(baseSalary) ? baseSalary : 0,
                });
                showAlert('Thêm vị trí thành công');
                form.reset();
                renderTable();
            } catch (error) {
                console.error(error);
                showAlert('Không thể thêm vị trí', 'error');
            }
        });
    }
    const openEditModal = (posId) => {
        const pos = getPositionById(posId);
        if (!pos) { showAlert('Không tìm thấy vị trí', 'error'); return; }
        const depts = DeptDB.getAllDepartments();
        if (depts.length === 0) { showAlert('Vui lòng tạo phòng ban trước', 'error'); return; }
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
                <div class="hrm-modal__body">
                    <form id="pos-edit-form">
                        <div class="form-group">
                            <label for="editp-title">Tên vị trí</label>
                            <input type="text" id="editp-title" required>
                        </div>
                        <div class="form-group">
                            <label for="editp-dept">Phòng ban</label>
                            <select id="editp-dept" required></select>
                        </div>
                        <div class="form-group">
                            <label for="editp-salary">Lương cơ bản (VND)</label>
                            <input type="number" id="editp-salary" min="0" step="100000">
                        </div>
                        <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:.5rem;">
                            <button type="button" id="pos-edit-cancel" class="secondary">Hủy</button>
                            <button type="submit">Lưu</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            const header = document.getElementById('pos-edit-header');
            let isDragging = false; let startX = 0; let startY = 0; let startLeft = 0; let startTop = 0;
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
            const close = () => { modal.style.display = 'none'; };
            document.getElementById('pos-edit-close').addEventListener('click', close);
            document.getElementById('pos-edit-cancel').addEventListener('click', close);
            const form = document.getElementById('pos-edit-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = Number(modal.dataset.id);
                const existing = getPositionById(id);
                if (!existing) { showAlert('Không tìm thấy vị trí', 'error'); return; }
                const title = (document.getElementById('editp-title').value || '').trim();
                const deptVal = (document.getElementById('editp-dept').value || '');
                const baseSalary = Number(document.getElementById('editp-salary').value);
                if (!title) { showAlert('Tên vị trí không được để trống', 'error'); return; }
                if (!deptVal) { showAlert('Vui lòng chọn phòng ban', 'error'); return; }
                const departmentId = Number(deptVal);
                updatePosition({ id, title, departmentId, baseSalary: Number.isFinite(baseSalary) ? baseSalary : 0 });
                showAlert('Cập nhật vị trí thành công');
                close();
                renderTable();
            });
        }
        modal.dataset.id = String(posId);
        const deptSelect = modal.querySelector('#editp-dept');
        const deptsNow = DeptDB.getAllDepartments();
        deptSelect.innerHTML = deptsNow.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        const titleInput = modal.querySelector('#editp-title');
        const salaryInput = modal.querySelector('#editp-salary');
        titleInput.value = pos.title || '';
        salaryInput.value = String(Number(pos.baseSalary) || 0);
        deptSelect.value = String(pos.departmentId || '');
        modal.style.display = 'block';
    };
    tableWrapper.addEventListener('click', async (event) => {
        const btn = event.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = Number(btn.dataset.id);
        if (!action || Number.isNaN(id)) return;
        if (action === 'delete') {
            const confirmed = await showConfirm('Bạn có chắc chắn muốn xóa vị trí này?');
            if (!confirmed) return;
            if (deletePosition(id)) {
                showAlert('Đã xóa vị trí');
                const modal = document.getElementById('pos-edit-modal');
                if (modal) modal.style.display = 'none';
                renderTable();
            } else {
                showAlert('Không tìm thấy vị trí để xóa', 'error');
            }
            return;
        }
        if (action === 'edit') {
            openEditModal(id);
        }
    });
};