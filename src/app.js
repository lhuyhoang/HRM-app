import * as Auth from './auth.js';
import * as EmployeeDB from './employeeDb.js';
import * as DeptDB from './department.js';
import * as AddEmployee from './addEmployee.js';
import * as SearchEmployee from './searchEmployee.js';
import * as Department from './department.js';

const authContainer = document.getElementById('auth-container');
const mainDashboard = document.getElementById('main-dashboard');
const appContainer = document.getElementById('app-container');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logout-btn');
const routes = {
    'addEmployee': AddEmployee.render,
    'searchEmployee': SearchEmployee.render,
    'department': Department.render,
    ''
}