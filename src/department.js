const DEPARTMENT_KEY = 'hrm_departments';
const initialData = () => [];
export const init = () => {
    if (!localStorage.getItem(DEPARTMENT_KEY)) {
        localStorage.setItem(DEPARTMENT_KEY, JSON.stringify(initialData()));
    }
};
export const getAllDepartments = () => JSON.parse(localStorage.getItem(DEPARTMENT_KEY)) || [];
