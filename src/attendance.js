import * as EmployeeDB from './employeeDb.js';
import { createTable, showAlert } from './uiHelpers.js';
const STORAGE_KEY = 'hrm_attendance_records';
const readRecords = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        console.error('Failed to parse attendance records', error);
        return [];
    }
};
const writeRecords = (records) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};
export const init = () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
        writeRecords([]);
    }
};
export const getAllRecords = () => readRecords();
export const addRecord = ({ employeeId, date, status, note }) => {
    const records = readRecords();
    const newRecord = {
        id: Date.now(),
        employeeId,
        date,
        status,
        note,
    };
    records.push(newRecord);
    writeRecords(records);
    return newRecord;
};
export const deleteRecord = (id) => {
    const records = readRecords();
    const next = records.filter((record) => record.id !== id);
    writeRecords(next);
};
const ATTENDANCE_STATUSES = [
    { value: 'present', label: 'Có mặt' },
    { value: 'absent', label: 'Vắng mặt' },
    { value: 'late', label: 'Đi trễ' },
    { value: 'remote', label: 'Làm từ xa' },
];
export const render = (container) => {
    init();
    const employees = EmployeeDB.getAllEmployees();
    if (employees.length === 0) {
        container.innerHTML = `
            <h2>Chấm công</h2>
            <p>Vui lòng thêm nhân viên trước khi sử dụng chức năng chấm công.</p>
        `;
        return;
    }
    const employeeOptions = employees
        .map((emp) => `<option value="${emp.id}">${emp.name} (${emp.id})</option>`)
        .join('');
    const statusOptions = ATTENDANCE_STATUSES
        .map((status) => `<option value="${status.value}">${status.label}</option>`)
        .join('');
    container.innerHTML = `
        <h2>Chấm công</h2>
        <form id="attendance-form" class="form-group">
            <label for="attendance-employee">Nhân viên</label>
            <select id="attendance-employee" required>
                <option value="">-- Chọn nhân viên --</option>
                ${employeeOptions}
            </select>
            <label for="attendance-date">Ngày</label>
            <input type="date" id="attendance-date" required>
            <label for="attendance-status">Trạng thái</label>
            <select id="attendance-status" required>
                ${statusOptions}
            </select>
            <label for="attendance-note">Ghi chú</label>
            <input type="text" id="attendance-note" placeholder="Ghi chú (không bắt buộc)">
            <button type="submit">Lưu</button>
        </form>
        <div id="attendance-table"></div>
    `;
    const form = container.querySelector('#attendance-form');
    const tableWrapper = container.querySelector('#attendance-table');
    const renderTable = () => {
        const records = getAllRecords();
        const currentEmployees = EmployeeDB.getAllEmployees();
        if (records.length === 0) {
            tableWrapper.innerHTML = '<p>Chưa có dữ liệu chấm công.</p>';
            return;
        }
        const tableHtml = createTable(
            ['Nhân viên', 'Ngày', 'Trạng thái', 'Ghi chú', 'Hành động'],
            records,
            (record) => {
                const employee = currentEmployees.find((emp) => emp.id === record.employeeId);
                const statusLabel = ATTENDANCE_STATUSES.find((item) => item.value === record.status)?.label || record.status;
                return `
                    <tr>
                        <td>${employee ? employee.name : 'N/A'} (${record.employeeId})</td>
                        <td>${record.date}</td>
                        <td>${statusLabel}</td>
                        <td>${record.note || ''}</td>
                        <td><button class="danger" data-id="${record.id}">Xóa</button></td>
                    </tr>
                `;
            }
        );
        tableWrapper.innerHTML = tableHtml;
    };
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const employeeId = form.querySelector('#attendance-employee').value;
        const date = form.querySelector('#attendance-date').value;
        const status = form.querySelector('#attendance-status').value;
        const note = form.querySelector('#attendance-note').value.trim();
        if (!employeeId || !date || !status) {
            showAlert('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }
        addRecord({ employeeId, date, status, note });
        form.reset();
        showAlert('Đã lưu chấm công');
        renderTable();
    });
    tableWrapper.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-id]');
        if (!button) {
            return;
        }
        const id = Number(button.dataset.id);
        if (Number.isNaN(id)) {
            return;
        }
        const confirmed = window.confirm('Xóa bản ghi chấm công này?');
        if (!confirmed) {
            return;
        }
        deleteRecord(id);
        showAlert('Đã xóa bản ghi');
        renderTable();
    });
    renderTable();
};
