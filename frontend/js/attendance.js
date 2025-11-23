import * as EmployeeDB from './employeeDb.js?v=2';
import * as DeptDB from './department.js?v=2';
import * as PositionDB from './position.js?v=2';
import { createTable, showAlert, showConfirm } from './uiHelpers.js?v=2';
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
        employeeId: Number(employeeId),
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
export const render = async (container) => {
    init();
    const employees = await EmployeeDB.getAllEmployees();
    if (employees.length === 0) {
        container.innerHTML = `
            <h2>Chấm công</h2>
            <p>Vui lòng thêm nhân viên trước khi sử dụng chức năng chấm công.</p>
        `;
        return;
    }
    const departments = await DeptDB.getAllDepartments();
    const deptOptions = departments
        .map((dept) => `<option value="${dept.id}">${dept.name}</option>`)
        .join('');
    const statusOptions = ATTENDANCE_STATUSES
        .map((status) => `<option value="${status.value}">${status.label}</option>`)
        .join('');
    container.innerHTML = `
        <h2>Chấm công</h2>
        <div class="form-group">
            <label for="attendance-department">Phòng ban</label>
            <select id="attendance-department" required>
                <option value="">-- Chọn phòng ban --</option>
                ${deptOptions}
            </select>
            <label for="attendance-date">Ngày</label>
            <input type="date" id="attendance-date" required>
        </div>
        <div id="employee-list"></div>
        <div id="attendance-table"></div>
    `;
    const tableWrapper = container.querySelector('#attendance-table');
    const employeeListWrapper = container.querySelector('#employee-list');
    const dateInput = container.querySelector('#attendance-date');
    const deptSelect = container.querySelector('#attendance-department');

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    dateInput.setAttribute('max', todayStr);
    if (!dateInput.value) {
        dateInput.value = todayStr;
    }

    const renderEmployeeList = async () => {
        const deptVal = deptSelect.value;
        const dateVal = dateInput.value;

        if (!deptVal || !dateVal) {
            employeeListWrapper.innerHTML = '';
            return;
        }

        const allEmployees = await EmployeeDB.getAllEmployees();
        const deptEmployees = allEmployees.filter(
            (emp) => Number(emp.departmentId || emp.department_id) === Number(deptVal)
        );

        if (deptEmployees.length === 0) {
            employeeListWrapper.innerHTML = '<p>Không có nhân viên trong phòng ban này.</p>';
            return;
        }

        const existingRecords = getAllRecords().filter(r => r.date === dateVal);

        const employeeRows = deptEmployees.map(emp => {
            const empName = emp.full_name || emp.name;
            const existingRecord = existingRecords.find(r => Number(r.employeeId) === Number(emp.id));
            const currentStatus = existingRecord ? existingRecord.status : 'present';
            const currentNote = existingRecord ? existingRecord.note : '';

            return `
                <tr>
                    <td>${empName}</td>
                    <td>
                        <select class="employee-status" data-employee-id="${emp.id}">
                            ${ATTENDANCE_STATUSES.map(s =>
                `<option value="${s.value}" ${s.value === currentStatus ? 'selected' : ''}>${s.label}</option>`
            ).join('')}
                        </select>
                    </td>
                    <td>
                        <input type="text" class="employee-note" data-employee-id="${emp.id}" value="${currentNote}" placeholder="Ghi chú">
                    </td>
                </tr>
            `;
        }).join('');

        employeeListWrapper.innerHTML = `
            <h3>Danh sách nhân viên - ${dateVal}</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Nhân viên</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    ${employeeRows}
                </tbody>
            </table>
            <button id="save-attendance" style="margin-top: 10px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Lưu chấm công</button>
        `;

        const saveBtn = employeeListWrapper.querySelector('#save-attendance');
        saveBtn.addEventListener('click', async () => {
            const statusSelects = employeeListWrapper.querySelectorAll('.employee-status');
            const noteInputs = employeeListWrapper.querySelectorAll('.employee-note');

            const records = getAllRecords();
            const otherRecords = records.filter(r => r.date !== dateVal);

            const newRecords = Array.from(statusSelects).map(select => {
                const employeeId = Number(select.dataset.employeeId);
                const status = select.value;
                const noteInput = Array.from(noteInputs).find(n => Number(n.dataset.employeeId) === employeeId);
                const note = noteInput ? noteInput.value.trim() : '';

                return {
                    id: Date.now() + Math.random(),
                    employeeId,
                    date: dateVal,
                    status,
                    note
                };
            });

            writeRecords([...otherRecords, ...newRecords]);
            showAlert('Đã lưu chấm công');
            await renderTable();
        });
    };

    const renderTable = async () => {
        const dateVal = dateInput.value;
        const allRecords = getAllRecords();

        // Lọc bản ghi theo ngày đã chọn
        const records = dateVal ? allRecords.filter(r => r.date === dateVal) : allRecords;

        const currentEmployees = await EmployeeDB.getAllEmployees();

        if (records.length === 0) {
            if (dateVal) {
                tableWrapper.innerHTML = `<p>Chưa có dữ liệu chấm công cho ngày ${dateVal}.</p>`;
            } else {
                tableWrapper.innerHTML = '<p>Chưa có dữ liệu chấm công.</p>';
            }
            return;
        }

        const tableHtml = createTable(
            ['Nhân viên', 'Ngày', 'Trạng thái', 'Ghi chú', 'Hành động'],
            records,
            (record) => {
                const employee = currentEmployees.find((emp) => Number(emp.id) === Number(record.employeeId));
                const employeeName = employee ? (employee.full_name || employee.name) : `N/A (ID: ${record.employeeId})`;
                const statusLabel = ATTENDANCE_STATUSES.find((item) => item.value === record.status)?.label || record.status;
                return `
                    <tr>
                        <td>${employeeName}</td>
                        <td>${record.date}</td>
                        <td>${statusLabel}</td>
                        <td>${record.note || ''}</td>
                        <td style="padding: 8px;">
                            <div style="display: flex; gap: 8px; align-items: center; justify-content: center;">
                                <button data-id="${record.id}" style="background: transparent; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
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

    tableWrapper.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-id]');
        if (!button) {
            return;
        }
        const id = Number(button.dataset.id);
        if (Number.isNaN(id)) {
            return;
        }
        const confirmed = await showConfirm('Xóa bản ghi chấm công này?');
        if (!confirmed) {
            return;
        }
        deleteRecord(id);
        showAlert('Đã xóa bản ghi');
        await renderTable();
        await renderEmployeeList();
    });

    deptSelect.addEventListener('change', async () => {
        await renderEmployeeList();
        await renderTable();
    });

    dateInput.addEventListener('change', async () => {
        await renderEmployeeList();
        await renderTable();
    });

    await renderTable();
};
