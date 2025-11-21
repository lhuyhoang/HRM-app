import apiService from './apiService.js';

let employeesCache = [];

export const init = async () => {
};

export const getAllEmployees = async () => {
    try {
        const response = await apiService.employees.getAll();
        console.log('Employees API response:', response);

        if (response.success && Array.isArray(response.data)) {
            employeesCache = response.data;
            return employeesCache;
        }

        console.error('Invalid employees response:', response);
        return [];
    } catch (error) {
        console.error('Failed to fetch employees', error);
        return [];
    }
};

export const saveEmployees = (employees) => {
};

export const getEmployeeById = async (id) => {
    try {
        const response = await apiService.employees.getById(id);
        if (response.success) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch employee', error);
        return null;
    }
};

export const findEmployees = (filterFn) => {
    return employeesCache.filter(filterFn);
};

export const addEmployee = async (employee) => {
    const employeeData = {
        name: employee.name,
        department_id: employee.departmentId || employee.department_id,
        position_id: employee.positionId || employee.position_id,
        salary: employee.salary || 0,
        phone: employee.phone || '',
        email: employee.email || '',
        hire_date: employee.hireDate || employee.hire_date || new Date().toISOString().split('T')[0],
        address: employee.address || null
    };

    try {
        const response = await apiService.employees.create(employeeData);
        if (response.success) {
            return response.data;
        }
        throw new Error(response.message || 'Failed to add employee');
    } catch (error) {
        console.error('Failed to add employee', error);
        throw error;
    }
};

export const updateEmployee = async (updatedEmployee) => {
    const employeeData = {
        name: updatedEmployee.name,
        department_id: updatedEmployee.departmentId || updatedEmployee.department_id,
        position_id: updatedEmployee.positionId || updatedEmployee.position_id,
        salary: updatedEmployee.salary,
        phone: updatedEmployee.phone || '',
        email: updatedEmployee.email || '',
        hire_date: updatedEmployee.hireDate || updatedEmployee.hire_date,
        address: updatedEmployee.address || null
    };

    try {
        const response = await apiService.employees.update(updatedEmployee.id, employeeData);
        if (!response.success) {
            throw new Error(response.message || 'Failed to update employee');
        }
        return response.data;
    } catch (error) {
        console.error('Failed to update employee', error);
        throw error;
    }
};

export const deleteEmployee = async (id) => {
    try {
        const response = await apiService.employees.delete(id);
        return response.success;
    } catch (error) {
        console.error('Failed to delete employee', error);
        return false;
    }
};