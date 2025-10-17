import * as EmployeeDB from './employeeDb.js';
import { createTable, showAlert } from './uiHelpers.js';
const STORAGE_KEY = 'hrm_leave_requests';
const readRequests = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        console.error('Failed to parse leave requests', error);
        return [];
    }
};
const writeRequests = (requests) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};
export const init = () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
        writeRequests([]);
    }
};
export const getAllRequests = () => readRequests();
export const addRequest = ({ employeeId, startDate, endDate, reason }) => {
    const requests = readRequests();
    const newRequest = {
        id: Date.now(),
        employeeId,
        startDate,
        endDate,
        reason,
        status: 'pending',
    };
    requests.push(newRequest);
    writeRequests(requests);
    return newRequest;
};
export const updateStatus = (id, status) => {
    const requests = readRequests();
    const updated = requests.map((request) =>
        request.id === id ? { ...request, status } : request
    );
    writeRequests(updated);
};
export const deleteRequest = (id) => {
    const requests = readRequests();
    const next = requests.filter((request) => request.id !== id);
    writeRequests(next);
};
const STATUS_LABELS = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
};
export const render = (container) => {
    init();
    const employees = EmployeeDB.getAllEmployees();
    if (employees.length === 0) {
        container.innerHTML = `
            <h2>Quản lý nghỉ phép</h2>
            <p>Vui lòng thêm nhân viên trước khi tạo yêu cầu nghỉ phép.</p>
        `;
        return;
    }
    const employeeOptions = employees
        .map((emp) => `<option value="${emp.id}">${emp.name} (${emp.id})</option>`)
        .join('');

    container.innerHTML = `
        <h2>Quản lý nghỉ phép</h2>
        <form id="leave-form" class="form-group">
            <label for="leave-employee">Nhân viên</label>
            <select id="leave-employee" required>
                <option value="">-- Chọn nhân viên --</option>
                ${employeeOptions}
            </select>
            <label for="leave-start">Ngày bắt đầu</label>
            <input type="date" id="leave-start" required>
            <label for="leave-end">Ngày kết thúc</label>
            <input type="date" id="leave-end" required>
            <label for="leave-reason">Lý do</label>
            <input type="text" id="leave-reason" required placeholder="Nhập lý do">
            <button type="submit">Tạo yêu cầu</button>
        </form>
        <div id="leave-table"></div>
    `;
    const form = container.querySelector('#leave-form');
    const tableWrapper = container.querySelector('#leave-table');
    const renderTable = () => {
        const requests = getAllRequests();
        const currentEmployees = EmployeeDB.getAllEmployees();
        if (requests.length === 0) {
            tableWrapper.innerHTML = '<p>Chưa có yêu cầu nghỉ phép.</p>';
            return;
        }
        const tableHtml = createTable(
            ['Nhân viên', 'Thời gian', 'Lý do', 'Trạng thái', 'Hành động'],
            requests,
            (request) => {
                const employee = currentEmployees.find((emp) => emp.id === request.employeeId);
                const statusLabel = STATUS_LABELS[request.status] || request.status;
                return `
                    <tr>
                        <td>${employee ? employee.name : 'N/A'} (${request.employeeId})</td>
                        <td>${request.startDate} → ${request.endDate}</td>
                        <td>${request.reason}</td>
                        <td>${statusLabel}</td>
                        <td>
                            <button data-action="approve" data-id="${request.id}">Duyệt</button>
                            <button data-action="reject" data-id="${request.id}">Từ chối</button>
                            <button class="danger" data-action="delete" data-id="${request.id}">Xóa</button>
                        </td>
                    </tr>
                `;
            }
        );
        tableWrapper.innerHTML = tableHtml;
    };
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const employeeId = form.querySelector('#leave-employee').value;
        const startDate = form.querySelector('#leave-start').value;
        const endDate = form.querySelector('#leave-end').value;
        const reason = form.querySelector('#leave-reason').value.trim();
        if (!employeeId || !startDate || !endDate || !reason) {
            showAlert('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }
        if (endDate < startDate) {
            showAlert('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu', 'error');
            return;
        }
        addRequest({ employeeId, startDate, endDate, reason });
        form.reset();
        showAlert('Đã tạo yêu cầu nghỉ phép');
        renderTable();
    });
    tableWrapper.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) {
            return;
        }
        const id = Number(button.dataset.id);
        if (Number.isNaN(id)) {
            return;
        }
        const action = button.dataset.action;

        if (action === 'approve' || action === 'reject') {
            updateStatus(id, action === 'approve' ? 'approved' : 'rejected');
            showAlert('Đã cập nhật trạng thái');
            renderTable();
            return;
        }
        if (action === 'delete') {
            const confirmed = window.confirm('Xóa yêu cầu nghỉ phép này?');
            if (!confirmed) {
                return;
            }
            deleteRequest(id);
            showAlert('Đã xóa yêu cầu');
            renderTable();
        }
    });
    renderTable();
};
