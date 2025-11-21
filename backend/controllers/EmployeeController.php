<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/EmployeeModel.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class EmployeeController extends BaseController
{

    public function __construct()
    {
        $this->model = new EmployeeModel();
    }

    public function index()
    {
        AuthMiddleware::require();
        try {
            $departmentId = $this->getParam('department_id');
            $positionId = $this->getParam('position_id');

            if ($departmentId && $positionId) {
                $employees = $this->model->getByDepartmentAndPosition($departmentId, $positionId);
            } elseif ($departmentId) {
                $employees = $this->model->getByDepartment($departmentId);
            } elseif ($positionId) {
                $employees = $this->model->getByPosition($positionId);
            } else {
                $employees = $this->model->getAllWithDetails();
            }

            $employees = array_map(function ($emp) {
                $emp['name'] = $emp['full_name'];
                return $emp;
            }, $employees);

            Response::success($employees);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function show($id)
    {
        AuthMiddleware::require();
        try {
            $employee = $this->model->getByIdWithDetails($id);
            if (!$employee)
                Response::notFound('Employee not found');

            $employee['name'] = $employee['full_name'];

            Response::success($employee);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function search()
    {
        AuthMiddleware::require();
        $keyword = $this->getParam('q', '');

        if (empty($keyword)) {
            Response::error('Search keyword is required');
        }

        try {
            $employees = $this->model->search($keyword);
            Response::success($employees);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function create()
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        if (isset($data['name']) && !isset($data['full_name'])) {
            $data['full_name'] = $data['name'];
        }

        $errors = Validator::required($data, ['full_name', 'email', 'phone', 'department_id', 'position_id']);
        if ($errors)
            Response::validationError($errors);

        if (!Validator::email($data['email'])) {
            Response::error('Invalid email format');
        }

        if (!Validator::phone($data['phone'])) {
            Response::error('Invalid phone format');
        }

        if ($this->model->emailExists($data['email'])) {
            Response::error('Email already exists', 409);
        }

        $employeeData = [
            'full_name' => Validator::sanitize($data['full_name']),
            'email' => Validator::sanitize($data['email']),
            'phone' => Validator::sanitize($data['phone']),
            'department_id' => (int) $data['department_id'],
            'position_id' => (int) $data['position_id'],
            'salary' => isset($data['salary']) ? (float) $data['salary'] : 0.00,
            'address' => isset($data['address']) ? Validator::sanitize($data['address']) : null,
            'hire_date' => isset($data['hire_date']) ? $data['hire_date'] : date('Y-m-d'),
            'created_at' => date('Y-m-d H:i:s')
        ];

        try {
            $id = $this->model->create($employeeData);
            $employee = $this->model->getByIdWithDetails($id);
            Response::created($employee, 'Employee created successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function update($id)
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        if (isset($data['name']) && !isset($data['full_name'])) {
            $data['full_name'] = $data['name'];
        }

        $existing = $this->model->getById($id);
        if (!$existing)
            Response::notFound('Employee not found');

        $errors = Validator::required($data, ['full_name', 'email', 'phone', 'department_id', 'position_id']);
        if ($errors)
            Response::validationError($errors);

        if (!Validator::email($data['email'])) {
            Response::error('Invalid email format');
        }

        if ($this->model->emailExists($data['email'], $id)) {
            Response::error('Email already exists', 409);
        }

        $employeeData = [
            'full_name' => Validator::sanitize($data['full_name']),
            'email' => Validator::sanitize($data['email']),
            'phone' => Validator::sanitize($data['phone']),
            'department_id' => (int) $data['department_id'],
            'position_id' => (int) $data['position_id'],
            'salary' => isset($data['salary']) ? (float) $data['salary'] : $existing['salary'],
            'address' => isset($data['address']) ? Validator::sanitize($data['address']) : $existing['address'],
            'hire_date' => isset($data['hire_date']) ? $data['hire_date'] : $existing['hire_date'],
            'updated_at' => date('Y-m-d H:i:s')
        ];

        try {
            $this->model->update($id, $employeeData);
            $employee = $this->model->getByIdWithDetails($id);
            Response::success($employee, 'Employee updated successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function delete($id)
    {
        AuthMiddleware::require();

        $employee = $this->model->getById($id);
        if (!$employee)
            Response::notFound('Employee not found');

        try {
            $this->model->delete($id);
            Response::success(null, 'Employee deleted successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
