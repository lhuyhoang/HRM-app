<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/SalaryModel.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class SalaryController extends BaseController
{
    private SalaryModel $model;

    // Khởi tạo controller với model tương ứng
    public function __construct()
    {
        $this->model = new SalaryModel();
    }

    // Lấy danh sách tất cả bảng lương
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

    // Lấy thông tin lương theo ID
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

    // Lấy thông tin lương theo ID nhân viên
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

    // Tạo bản ghi lương mới
    public function create()
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        // Xác thực dữ liệu bắt buộc
        $errors = Validator::required($data, ['employee_id']);
        if ($errors)
            Response::validationError($errors);

        if (!Validator::nonNegative($data['bonus'] ?? 0)) {
            Response::error('Bonus must be non-negative');
        }

        if (!Validator::nonNegative($data['deduction'] ?? 0)) {
            Response::error('Deduction must be non-negative');
        }

        $salaryData = [
            'employee_id' => (int) $data['employee_id'],
            'month' => isset($data['month']) ? (int) $data['month'] : null,
            'year' => isset($data['year']) ? (int) $data['year'] : null,
            'bonus' => (float) ($data['bonus'] ?? 0),
            'deduction' => (float) ($data['deduction'] ?? 0),
            'payment_status' => 'pending',
            'notes' => isset($data['notes']) ? Validator::sanitize($data['notes']) : null,
            'created_at' => date('Y-m-d H:i:s')
        ];

        try {
            $id = $this->model->create($salaryData);
            $salary = $this->model->getById($id);
            Response::created($salary, 'Salary created successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    // Cập nhật thông tin lương
    public function update($id)
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        $existing = $this->model->getById($id);
        if (!$existing)
            Response::notFound('Salary record not found');

        if (isset($data['bonus']) && !Validator::nonNegative($data['bonus'])) {
            Response::error('Bonus must be non-negative');
        }

        if (isset($data['deduction']) && !Validator::nonNegative($data['deduction'])) {
            Response::error('Deduction must be non-negative');
        }

        $salaryData = [
            'bonus' => isset($data['bonus']) ? (float) $data['bonus'] : $existing['bonus'],
            'deduction' => isset($data['deduction']) ? (float) $data['deduction'] : $existing['deduction'],
            'notes' => isset($data['notes']) ? Validator::sanitize($data['notes']) : $existing['notes'],
            'updated_at' => date('Y-m-d H:i:s')
        ];

        try {
            $this->model->update($id, $salaryData);
            $salary = $this->model->getById($id);
            Response::success($salary, 'Salary updated successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    // Cập nhật trạng thái thanh toán
    public function updateStatus($id)
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        $existing = $this->model->getById($id);
        if (!$existing)
            Response::notFound('Salary record not found');

        if (!isset($data['payment_status'])) {
            Response::error('Payment status is required');
        }

        if (!Validator::enum($data['payment_status'], ['pending', 'approved', 'paid'])) {
            Response::error('Invalid payment status');
        }

        try {
            $this->model->update($id, [
                'payment_status' => $data['payment_status'],
                'updated_at' => date('Y-m-d H:i:s')
            ]);
            $salary = $this->model->getById($id);
            Response::success($salary, 'Payment status updated successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    // Xóa bản ghi lương
    public function delete($id)
    {
        AuthMiddleware::require();

        $salary = $this->model->getById($id);
        if (!$salary)
            Response::notFound('Salary record not found');

        try {
            $this->model->delete($id);
            Response::success(null, 'Salary record deleted successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    // Tính toán tổng bảng lương
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
