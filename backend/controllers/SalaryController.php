<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/SalaryModel.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class SalaryController extends BaseController
{

    public function __construct()
    {
        $this->model = new SalaryModel();
    }

    public function index()
    {
        AuthMiddleware::require();
        try {
            $departmentId = $this->getParam('department_id');
            $salaries = $this->model->getAllWithDetails($departmentId);
            Response::success($salaries);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function show($id)
    {
        AuthMiddleware::require();
        try {
            $salary = $this->model->getById($id);
            if (!$salary)
                Response::notFound('Salary record not found');
            Response::success($salary);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function getByEmployee($employeeId)
    {
        AuthMiddleware::require();
        try {
            $salary = $this->model->getByEmployeeId($employeeId);
            if (!$salary) {
                Response::success(['employee_id' => $employeeId, 'bonus' => 0, 'deduction' => 0]);
            } else {
                Response::success($salary);
            }
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function update($employeeId)
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        if (!Validator::nonNegative($data['bonus'] ?? 0)) {
            Response::error('Bonus must be non-negative');
        }

        if (!Validator::nonNegative($data['deduction'] ?? 0)) {
            Response::error('Deduction must be non-negative');
        }

        $salaryData = [
            'bonus' => (float) ($data['bonus'] ?? 0),
            'deduction' => (float) ($data['deduction'] ?? 0),
            'notes' => isset($data['notes']) ? Validator::sanitize($data['notes']) : null
        ];

        try {
            $this->model->updateOrCreate($employeeId, $salaryData);
            $salary = $this->model->getByEmployeeId($employeeId);
            Response::success($salary, 'Salary updated successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function payroll()
    {
        AuthMiddleware::require();
        try {
            $departmentId = $this->getParam('department_id');
            $stats = $this->model->calculateTotalPayroll($departmentId);
            Response::success($stats);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
