<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/LeaveModel.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class LeaveController extends BaseController
{

    public function __construct()
    {
        $this->model = new LeaveModel();
    }

    public function index()
    {
        AuthMiddleware::require();
        try {
            $filters = [
                'department_id' => $this->getParam('department_id'),
                'position_id' => $this->getParam('position_id'),
                'employee_id' => $this->getParam('employee_id'),
                'status' => $this->getParam('status')
            ];

            $filters = array_filter($filters);
            // Get all leave records with details
            $leaves = $this->model->getAllWithDetails();

            // Apply filters if needed
            if (!empty($filters)) {
                $leaves = array_filter($leaves, function ($record) use ($filters) {
                    foreach ($filters as $key => $value) {
                        if (isset($record[$key]) && $record[$key] != $value) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            Response::success($leaves);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function show($id)
    {
        AuthMiddleware::require();
        try {
            $leave = $this->model->getById($id);
            if (!$leave)
                Response::notFound('Leave request not found');
            Response::success($leave);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function create()
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        $errors = Validator::required($data, ['employee_id', 'leave_type', 'start_date', 'end_date', 'reason']);
        if ($errors)
            Response::validationError($errors);

        if (!Validator::date($data['start_date']) || !Validator::date($data['end_date'])) {
            Response::error('Invalid date format');
        }

        if (!Validator::dateRange($data['start_date'], $data['end_date'])) {
            Response::error('End date must be greater than or equal to start date');
        }

        if (!Validator::enum($data['leave_type'], ['sick', 'annual', 'personal', 'other'])) {
            Response::error('Invalid leave type');
        }

        if ($this->model->hasOverlap($data['employee_id'], $data['start_date'], $data['end_date'])) {
            Response::error('Leave request overlaps with existing request', 409);
        }

        $leaveData = [
            'employee_id' => (int) $data['employee_id'],
            'leave_type' => $data['leave_type'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'reason' => Validator::sanitize($data['reason']),
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s')
        ];

        try {
            $id = $this->model->create($leaveData);
            $leave = $this->model->getById($id);
            Response::created($leave, 'Leave request created successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function update($id)
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        $existing = $this->model->getById($id);
        if (!$existing)
            Response::notFound('Leave request not found');

        if ($existing['status'] !== 'pending') {
            Response::error('Cannot update non-pending leave request', 400);
        }

        $errors = Validator::required($data, ['leave_type', 'start_date', 'end_date', 'reason']);
        if ($errors)
            Response::validationError($errors);

        if (!Validator::dateRange($data['start_date'], $data['end_date'])) {
            Response::error('End date must be greater than or equal to start date');
        }

        if ($this->model->hasOverlap($existing['employee_id'], $data['start_date'], $data['end_date'], $id)) {
            Response::error('Leave request overlaps with existing request', 409);
        }

        $leaveData = [
            'leave_type' => $data['leave_type'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'reason' => Validator::sanitize($data['reason']),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        try {
            $this->model->update($id, $leaveData);
            $leave = $this->model->getById($id);
            Response::success($leave, 'Leave request updated successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function updateStatus($id)
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        $leave = $this->model->getById($id);
        if (!$leave)
            Response::notFound('Leave request not found');

        if (!isset($data['status']) || !Validator::enum($data['status'], ['approved', 'rejected'])) {
            Response::error('Invalid status value');
        }

        try {
            $this->model->updateStatus($id, $data['status']);
            $leave = $this->model->getById($id);
            Response::success($leave, 'Leave status updated successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function delete($id)
    {
        AuthMiddleware::require();

        $leave = $this->model->getById($id);
        if (!$leave)
            Response::notFound('Leave request not found');

        try {
            $this->model->delete($id);
            Response::success(null, 'Leave request deleted successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
