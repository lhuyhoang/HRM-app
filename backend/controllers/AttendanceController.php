<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/AttendanceModel.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class AttendanceController extends BaseController
{

    public function __construct()
    {
        $this->model = new AttendanceModel();
    }

    public function index()
    {
        AuthMiddleware::require();
        try {
            $filters = [
                'department_id' => $this->getParam('department_id'),
                'position_id' => $this->getParam('position_id'),
                'employee_id' => $this->getParam('employee_id'),
                'date' => $this->getParam('date')
            ];

            $filters = array_filter($filters);
            // Get all attendance records with details
            $attendance = $this->model->getAllWithDetails();

            // Apply filters if needed
            if (!empty($filters)) {
                $attendance = array_filter($attendance, function ($record) use ($filters) {
                    foreach ($filters as $key => $value) {
                        if (isset($record[$key]) && $record[$key] != $value) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            Response::success($attendance);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function show($id)
    {
        AuthMiddleware::require();
        try {
            $attendance = $this->model->getById($id);
            if (!$attendance)
                Response::notFound('Attendance record not found');
            Response::success($attendance);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function create()
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        $errors = Validator::required($data, ['employee_id', 'date', 'status']);
        if ($errors)
            Response::validationError($errors);

        if (!Validator::date($data['date'])) {
            Response::error('Invalid date format');
        }

        if (strtotime($data['date']) > strtotime(date('Y-m-d'))) {
            Response::error('Cannot mark attendance for future dates');
        }

        if (!Validator::enum($data['status'], ['present', 'absent', 'late'])) {
            Response::error('Invalid status value');
        }

        if ($this->model->existsForDate($data['employee_id'], $data['date'])) {
            Response::error('Attendance already marked for this date', 409);
        }

        $attendanceData = [
            'employee_id' => (int) $data['employee_id'],
            'date' => $data['date'],
            'status' => $data['status'],
            'notes' => isset($data['notes']) ? Validator::sanitize($data['notes']) : null,
            'created_at' => date('Y-m-d H:i:s')
        ];

        try {
            $id = $this->model->create($attendanceData);
            $attendance = $this->model->getById($id);
            Response::created($attendance, 'Attendance marked successfully');
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
            Response::notFound('Attendance record not found');

        $errors = Validator::required($data, ['status']);
        if ($errors)
            Response::validationError($errors);

        if (!Validator::enum($data['status'], ['present', 'absent', 'late'])) {
            Response::error('Invalid status value');
        }

        $attendanceData = [
            'status' => $data['status'],
            'notes' => isset($data['notes']) ? Validator::sanitize($data['notes']) : $existing['notes'],
            'updated_at' => date('Y-m-d H:i:s')
        ];

        try {
            $this->model->update($id, $attendanceData);
            $attendance = $this->model->getById($id);
            Response::success($attendance, 'Attendance updated successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function delete($id)
    {
        AuthMiddleware::require();

        $attendance = $this->model->getById($id);
        if (!$attendance)
            Response::notFound('Attendance record not found');

        try {
            $this->model->delete($id);
            Response::success(null, 'Attendance deleted successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function summary($employeeId)
    {
        AuthMiddleware::require();

        $startDate = $this->getParam('start_date', date('Y-m-01'));
        $endDate = $this->getParam('end_date', date('Y-m-d'));

        try {
            $summary = $this->model->getSummary($employeeId, $startDate, $endDate);
            Response::success($summary);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
