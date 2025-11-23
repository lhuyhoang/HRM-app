
import * as EmployeeDB from './employeeDb.js';
import * as DeptDB from './department.js';
import { createTable, showAlert, showConfirm } from './uiHelpers.js';
import apiService from './apiService.js';

let currentTab = 'payroll';

const renderPayroll = async (container) => {
    const employees = await EmployeeDB.getAllEmployees();

    if (employees.length === 0) {
        container.innerHTML = `
            <h2>Bảng lương</h2>
            <p>Chưa có nhân viên để hiển thị lương.</p>
        `;
        return;
    }

    const departments = await DeptDB.getAllDepartments();
    const deptOptions = [`<option value="">-- Tất cả phòng ban --</option>`]
        .concat(departments.map((d) => `<option value="${d.id}">${d.name}</option>`))
        .join('');

    container.innerHTML = `
        <h2>Bảng lương</h2>
        <p>Cập nhật thưởng và khấu trừ cho từng nhân viên để tính lương thực lĩnh.</p>
        <div class="form-group">
            <label for="salary-department-filter">Lọc theo phòng ban</label>
            <select id="salary-department-filter">
                ${deptOptions}
            </select>
        </div>
        <div id="salary-table"></div>
    `;

    const tableWrapper = container.querySelector('#salary-table');
    const deptFilter = container.querySelector('#salary-department-filter');
    let selectedDeptId = '';

    const getFilteredEmployees = async () => {
        const latest = await EmployeeDB.getAllEmployees();
        if (!selectedDeptId) return latest;
        const deptIdNum = Number(selectedDeptId);
        return latest.filter((emp) => emp.department_id === deptIdNum);
    };

    const renderTable = async () => {
        const latestEmployees = await getFilteredEmployees();
        if (latestEmployees.length === 0) {
            tableWrapper.innerHTML = '<p>Không có nhân viên thuộc phòng ban đã chọn.</p>';
            return;
        }

        const tableHtml = createTable(
            ['ID', 'Tên', 'Số điện thoại', 'Email', 'Lương cơ bản', 'Thưởng', 'Khấu trừ', 'Thực lĩnh', 'Hành động'],
            latestEmployees,
            (emp) => {
                const baseSalary = Number(emp.salary) || 0;
                const bonus = 0; // Will be entered by user
                const deduction = 0; // Will be entered by user
                const netSalary = baseSalary + bonus - deduction;
                const phone = emp.phone || '';
                const email = emp.email || '';
                return `
                    <tr>
                        <td>${emp.id}</td>
                        <td>${emp.name}</td>
                        <td>${phone}</td>
                        <td>${email}</td>
                        <td>${baseSalary.toLocaleString()}</td>
                        <td><input type="number" class="bonus-input" data-id="${emp.id}" value="0" min="0"></td>
                        <td><input type="number" class="deduction-input" data-id="${emp.id}" value="0" min="0"></td>
                        <td class="net-salary-${emp.id}">${netSalary.toLocaleString()}</td>
                        <td style="padding: 8px;">
                            <div style="display: flex; gap: 8px; align-items: center; justify-content: center;">
                                <button data-action="save" data-id="${emp.id}" style="background: transparent; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                        <polyline points="17 21 17 13 7 13 7 21"/>
                                        <polyline points="7 3 7 8 15 8"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        );
        tableWrapper.innerHTML = tableHtml;

        // Thêm sự kiện lắng nghe cho tính toán thời gian thực
        const bonusInputs = tableWrapper.querySelectorAll('.bonus-input');
        const deductionInputs = tableWrapper.querySelectorAll('.deduction-input');

        const updateNetSalary = (empId) => {
            const bonusInput = tableWrapper.querySelector(`.bonus-input[data-id="${empId}"]`);
            const deductionInput = tableWrapper.querySelector(`.deduction-input[data-id="${empId}"]`);
            const employee = latestEmployees.find(e => e.id == empId);
            if (!employee) return;

            const baseSalary = Number(employee.salary) || 0;
            const bonus = Number(bonusInput.value) || 0;
            const deduction = Number(deductionInput.value) || 0;
            const netSalary = baseSalary + bonus - deduction;

            const netSalaryCell = tableWrapper.querySelector(`.net-salary-${empId}`);
            if (netSalaryCell) {
                netSalaryCell.textContent = netSalary.toLocaleString();
            }
        };

        bonusInputs.forEach(input => {
            input.addEventListener('input', () => updateNetSalary(input.dataset.id));
        });

        deductionInputs.forEach(input => {
            input.addEventListener('input', () => updateNetSalary(input.dataset.id));
        });
    };

    deptFilter.addEventListener('change', async () => {
        selectedDeptId = deptFilter.value;
        await renderTable();
    });

    tableWrapper.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action="save"]');
        if (!button) {
            return;
        }

        const id = button.dataset.id;
        const bonusInput = tableWrapper.querySelector(`.bonus-input[data-id="${id}"]`);
        const deductionInput = tableWrapper.querySelector(`.deduction-input[data-id="${id}"]`);

        if (!bonusInput || !deductionInput) {
            return;
        }

        const bonus = Number.parseFloat(bonusInput.value) || 0;
        const deduction = Number.parseFloat(deductionInput.value) || 0;

        const employee = (await EmployeeDB.getAllEmployees()).find(e => e.id == id);
        if (!employee) {
            showAlert('Không tìm thấy nhân viên', 'error');
            return;
        }

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        try {
            const allSalariesResponse = await apiService.salaries.getAll();
            const existingSalary = allSalariesResponse.success
                ? allSalariesResponse.data.find(s =>
                    s.employee_id == id &&
                    s.month == currentMonth &&
                    s.year == currentYear
                )
                : null;

            let response;
            if (existingSalary) {
                response = await apiService.salaries.update(existingSalary.id, {
                    bonus: bonus,
                    deduction: deduction
                });
            } else {
                const salaryData = {
                    employee_id: id,
                    month: currentMonth,
                    year: currentYear,
                    bonus: bonus,
                    deduction: deduction
                };
                response = await apiService.salaries.create(salaryData);
            }

            if (response.success) {
                showAlert('Đã cập nhật bảng lương');
                bonusInput.value = '0';
                deductionInput.value = '0';
                const baseSalary = Number(employee.salary) || 0;
                const netSalaryCell = tableWrapper.querySelector(`.net-salary-${id}`);
                if (netSalaryCell) {
                    netSalaryCell.textContent = baseSalary.toLocaleString();
                }
            } else {
                showAlert(response.message || 'Không thể lưu lương', 'error');
            }
        } catch (error) {
            console.error('Salary save error:', error);
            showAlert('Không thể lưu lương', 'error');
        }
    });

    await renderTable();
};

const renderSalaryPayment = async (container) => {
    try {
        const response = await apiService.salaries.getAll();
        const salaries = response.success ? response.data : [];
        const employees = await EmployeeDB.getAllEmployees();
        const departments = await DeptDB.getAllDepartments();

        const deptOptions = [`<option value="">-- Tất cả phòng ban --</option>`]
            .concat(departments.map((d) => `<option value="${d.id}">${d.name}</option>`))
            .join('');

        container.innerHTML = `
            <h2>Thanh toán lương</h2>
            <div class="form-group">
                <label for="payment-department-filter">Lọc theo phòng ban</label>
                <select id="payment-department-filter">
                    ${deptOptions}
                </select>
                <label for="payment-status-filter">Lọc theo trạng thái</label>
                <select id="payment-status-filter">
                    <option value="">-- Tất cả trạng thái --</option>
                    <option value="pending">Đợi duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="paid">Đã thanh toán</option>
                </select>
            </div>
            <div id="payment-table"></div>

            <!-- Edit Salary Modal -->
            <div id="edit-salary-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; justify-content: center; align-items: center;">
                <div style="background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <h3 style="margin-top: 0;">Chỉnh sửa bảng lương</h3>
                    <form id="salary-edit-form">
                        <input type="hidden" id="edit-salary-id">
                        <div class="form-group">
                            <label>Nhân viên</label>
                            <input type="text" id="edit-employee-name" disabled style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; background: #f3f4f6;">
                        </div>
                        <div class="form-group">
                            <label for="edit-bonus">Thưởng</label>
                            <input type="number" id="edit-bonus" min="0" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                        </div>
                        <div class="form-group">
                            <label for="edit-deduction">Khấu trừ</label>
                            <input type="number" id="edit-deduction" min="0" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" id="cancel-edit" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Hủy</button>
                            <button type="submit" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Cập nhật</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const tableWrapper = container.querySelector('#payment-table');
        const deptFilter = container.querySelector('#payment-department-filter');
        const statusFilter = container.querySelector('#payment-status-filter');
        const editModal = container.querySelector('#edit-salary-modal');
        const editSalaryForm = container.querySelector('#salary-edit-form');
        const cancelEditBtn = container.querySelector('#cancel-edit');

        const statusLabels = {
            pending: 'Đợi duyệt',
            approved: 'Đã duyệt',
            paid: 'Đã thanh toán'
        };

        const statusColors = {
            pending: '#f59e0b',
            approved: '#3b82f6',
            paid: '#10b981'
        };

        const renderTable = () => {
            const selectedDept = deptFilter.value;
            const selectedStatus = statusFilter.value;

            let filtered = salaries;

            if (selectedDept) {
                filtered = filtered.filter(s => s.department_id == selectedDept);
            }

            if (selectedStatus) {
                filtered = filtered.filter(s => s.payment_status === selectedStatus);
            }

            if (filtered.length === 0) {
                tableWrapper.innerHTML = '<p>Không có bản ghi lương.</p>';
                return;
            }

            const tableHtml = createTable(
                ['Nhân viên', 'Phòng ban', 'Tháng/Năm', 'Lương cơ bản', 'Thực lĩnh', 'Trạng thái', 'Hành động'],
                filtered,
                (salary) => {
                    const employee = employees.find(e => e.id == salary.employee_id);
                    const empName = employee ? employee.name : 'N/A';
                    const deptName = salary.department_name || 'N/A';
                    const baseSalary = Number(salary.base_salary) || 0;
                    const netSalary = Number(salary.net_salary) || 0;
                    const status = salary.payment_status || 'pending';
                    const statusLabel = statusLabels[status] || status;
                    const statusColor = statusColors[status] || '#6b7280';
                    const monthYear = salary.month && salary.year ? `${salary.month}/${salary.year}` : 'N/A';

                    return `
                        <tr>
                            <td>${empName}</td>
                            <td>${deptName}</td>
                            <td>${monthYear}</td>
                            <td>$${baseSalary.toLocaleString()}</td>
                            <td>$${netSalary.toLocaleString()}</td>
                            <td><span style="color: ${statusColor}; font-weight: bold;">${statusLabel}</span></td>
                            <td style="padding: 8px;">
                                <div style="display: flex; gap: 8px; align-items: center; justify-content: center;">
                                    <button data-action="edit" data-id="${salary.id}" style="background: transparent; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                    ${status === 'pending' ? `
                                        <button data-action="approve" data-id="${salary.id}" style="background: transparent; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </button>
                                    ` : ''}
                                    ${status === 'approved' ? `
                                        <button data-action="pay" data-id="${salary.id}" style="background: transparent; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <line x1="12" y1="1" x2="12" y2="23"/>
                                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                            </svg>
                                        </button>
                                    ` : ''}
                                    <button data-action="delete" data-id="${salary.id}" style="background: transparent; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
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

        deptFilter.addEventListener('change', renderTable);
        statusFilter.addEventListener('change', renderTable);

        cancelEditBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
            editSalaryForm.reset();
        });

        editModal.addEventListener('click', (event) => {
            if (event.target === editModal) {
                editModal.style.display = 'none';
                editSalaryForm.reset();
            }
        });

        editSalaryForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const id = Number(container.querySelector('#edit-salary-id').value);
            const bonus = Number(container.querySelector('#edit-bonus').value) || 0;
            const deduction = Number(container.querySelector('#edit-deduction').value) || 0;

            try {
                const response = await apiService.salaries.update(id, { bonus, deduction });
                if (response.success) {
                    showAlert('Đã cập nhật bảng lương');
                    editModal.style.display = 'none';
                    editSalaryForm.reset();

                    const salary = salaries.find(s => s.id === id);
                    if (salary) {
                        salary.bonus = bonus;
                        salary.deduction = deduction;
                        const baseSalary = Number(salary.base_salary) || 0;
                        salary.net_salary = baseSalary + bonus - deduction;
                    }
                    renderTable();
                } else {
                    showAlert(response.message || 'Không thể cập nhật', 'error');
                }
            } catch (error) {
                showAlert('Lỗi khi cập nhật bảng lương', 'error');
            }
        });

        tableWrapper.addEventListener('click', async (event) => {
            const button = event.target.closest('button[data-action]');
            if (!button) return;

            const id = Number(button.dataset.id);
            const action = button.dataset.action;

            if (action === 'edit') {
                const salary = salaries.find(s => s.id === id);
                if (!salary) return;

                const employee = employees.find(e => e.id == salary.employee_id);
                const empName = employee ? employee.name : 'N/A';

                container.querySelector('#edit-salary-id').value = salary.id;
                container.querySelector('#edit-employee-name').value = empName;
                container.querySelector('#edit-bonus').value = salary.bonus || 0;
                container.querySelector('#edit-deduction').value = salary.deduction || 0;

                editModal.style.display = 'flex';
            } else if (action === 'approve') {
                const confirmed = await showConfirm('Duyệt thanh toán lương này?');
                if (!confirmed) return;

                try {
                    const response = await apiService.salaries.updateStatus(id, 'approved');
                    if (response.success) {
                        showAlert('Đã duyệt thanh toán');
                        const salary = salaries.find(s => s.id === id);
                        if (salary) salary.payment_status = 'approved';
                        renderTable();
                    } else {
                        showAlert(response.message || 'Không thể duyệt', 'error');
                    }
                } catch (error) {
                    showAlert('Lỗi khi duyệt thanh toán', 'error');
                }
            } else if (action === 'pay') {
                const confirmed = await showConfirm('Xác nhận đã thanh toán lương?');
                if (!confirmed) return;

                try {
                    const response = await apiService.salaries.updateStatus(id, 'paid');
                    if (response.success) {
                        showAlert('Đã xác nhận thanh toán');
                        const salary = salaries.find(s => s.id === id);
                        if (salary) salary.payment_status = 'paid';
                        renderTable();
                    } else {
                        showAlert(response.message || 'Không thể xác nhận', 'error');
                    }
                } catch (error) {
                    showAlert('Lỗi khi xác nhận thanh toán', 'error');
                }
            } else if (action === 'delete') {
                const confirmed = await showConfirm('Xóa bản ghi lương này?');
                if (!confirmed) return;

                try {
                    const response = await apiService.salaries.delete(id);
                    if (response.success) {
                        showAlert('Đã xóa bản ghi lương');
                        const index = salaries.findIndex(s => s.id === id);
                        if (index > -1) salaries.splice(index, 1);
                        renderTable();
                    } else {
                        showAlert(response.message || 'Không thể xóa', 'error');
                    }
                } catch (error) {
                    showAlert('Lỗi khi xóa bản ghi', 'error');
                }
            }
        });

        renderTable();
    } catch (error) {
        console.error('Error rendering salary payment:', error);
        container.innerHTML = '<p>Lỗi khi tải dữ liệu thanh toán lương.</p>';
    }
};

export const render = async (container, initialTab = null) => {
    if (initialTab === 'payroll') {
        await renderPayroll(container);
    } else if (initialTab === 'payment') {
        await renderSalaryPayment(container);
    } else {
        container.innerHTML = `
            <div class="salary-tabs">
                <button class="tab-button active" data-tab="payroll">Payroll</button>
                <button class="tab-button" data-tab="payment">Thanh toán lương</button>
            </div>
            <div id="salary-content"></div>
            <style>
                .salary-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #e5e7eb;
                }
                .tab-button {
                    padding: 10px 20px;
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    color: #6b7280;
                    transition: all 0.2s;
                }
                .tab-button:hover {
                    color: #3b82f6;
                }
                .tab-button.active {
                    color: #3b82f6;
                    border-bottom-color: #3b82f6;
                }
            </style>
        `;

        const contentDiv = container.querySelector('#salary-content');
        const tabButtons = container.querySelectorAll('.tab-button');

        const switchTab = async (tab) => {
            currentTab = tab;
            tabButtons.forEach(btn => {
                if (btn.dataset.tab === tab) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            if (tab === 'payroll') {
                await renderPayroll(contentDiv);
            } else {
                await renderSalaryPayment(contentDiv);
            }
        };

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

        await switchTab('payroll');
    }
};
