/**
 * Salary Management Module with API Integration
 */
import * as EmployeeDB from './employeeDb.js';
import * as DeptDB from './department.js';
import { createTable, showAlert } from './uiHelpers.js';
import apiService from './apiService.js';

export const render = async (container) => {
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
                        <td><button data-action="save" data-id="${emp.id}">Lưu</button></td>
                    </tr>
                `;
            }
        );
        tableWrapper.innerHTML = tableHtml;

        // Add event listeners for real-time calculation
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

        // Save salary record via API
        const now = new Date();
        const salaryData = {
            employee_id: id,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            bonus: bonus,
            deduction: deduction
        };

        try {
            const response = await apiService.salaries.create(salaryData);
            if (response.success) {
                showAlert('Đã cập nhật bảng lương');
                // Reset inputs
                bonusInput.value = '0';
                deductionInput.value = '0';
                // Update net salary display
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
