const DEPARTMENT_KEY = 'hrm_departments';
const initialData = () => [];
export const init = () => {
    if (!localStorage.getItem(DEPARTMENT_KEY)) {
        localStorage.setItem(DEPARTMENT_KEY, JSON.stringify(initialData()));
    }
};
export const getAllDepartments = () => JSON.parse(localStorage.getItem(DEPARTMENT_KEY)) || [];
const saveDepartments = (depts) => localStorage.setItem(DEPARTMENT_KEY, JSON.stringify(depts));
export const addDepartment = (name) => {
    const depts = getAllDepartments();
    const newDept = { id: Date.now(), name };
    depts.push(newDept);
    saveDepartments(depts);
};
import { createTable, showAlert } from "./uiHelpers.js";
export const render = (container) => {
    const deparments = getAllDepartments();
    const tableHtml = createTable(
        ['ID', 'Tên phòng ban', 'Hành động'],
        deparments,
        (dept) => `
            <tr>
                <td>${dept.id}</td>
                <td>${dept.name}</td>
                <td><button class="danger" data-id="${dept.id}">Xóa</button></td>
            </tr>
        `
    );
    container.innerHTML = `
        <h2>Quản lý phòng ban</h2>
        <div class="form-group">
            <input type="text" id="new-department-name" placeholder="Tên phòng ban mới" />
            <button id="add-department">Thêm</button>
        </div>
    `;
    document.getElementById('add-dept-btn').addEventListener('click', () => {
        const name = document.getElementById('new-dept-name').ariaValueMax;
        if (name) {
            addDepartment(name);
            showAlert('Thêm phòng ban thành công');
            render(container);
        } else {
            showAlert('Tên phòng ban không được để trống', 'error');
        }
    });    
};
