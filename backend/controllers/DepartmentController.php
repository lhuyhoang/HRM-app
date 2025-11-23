<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/DepartmentModel.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class DepartmentController extends BaseController
{

    public function __construct()
    {
        $this->model = new DepartmentModel();
    }

    public function index(): void
    {
        AuthMiddleware::require();

        try {
            $departments = $this->model->getAllWithStats();
            Response::success($departments);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function show($id): void
    {
        AuthMiddleware::require();

        try {
            $department = $this->model->getById($id);
            if (!$department) {
                Response::notFound('Department not found');
            }
            Response::success($department);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function create(): void
    {
        AuthMiddleware::require();

        $data = $this->getRequestData();

        $errors = Validator::required($data, ['name']);
        if ($errors) {
            Response::validationError($errors);
        }

        if ($this->model->nameExists($data['name'])) {
            Response::error('Department name already exists', 409);
        }

        $departmentData = [
            'name' => Validator::sanitize($data['name']),
            'description' => isset($data['description']) ? Validator::sanitize($data['description']) : null,
            'created_at' => date('Y-m-d H:i:s')
        ];

        try {
            $id = $this->model->create($departmentData);
            $department = $this->model->getById($id);
            Response::created($department, 'Department created successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function update($id): void
    {
        AuthMiddleware::require();

        $data = $this->getRequestData();

        $existing = $this->model->getById($id);
        if (!$existing) {
            Response::notFound('Department not found');
        }

        $errors = Validator::required($data, ['name']);
        if ($errors) {
            Response::validationError($errors);
        }

        if ($this->model->nameExists($data['name'], $id)) {
            Response::error('Department name already exists', 409);
        }

        $departmentData = [
            'name' => Validator::sanitize($data['name']),
            'description' => isset($data['description']) ? Validator::sanitize($data['description']) : $existing['description'],
            'updated_at' => date('Y-m-d H:i:s')
        ];

        try {
            $this->model->update($id, $departmentData);
            $department = $this->model->getById($id);
            Response::success($department, 'Department updated successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function delete($id): void
    {
        AuthMiddleware::require();

        $department = $this->model->getById($id);
        if (!$department) {
            Response::notFound('Department not found');
        }

        $checkResult = $this->model->canDelete($id);
        if (!$checkResult['canDelete']) {
            Response::error($checkResult['reason'], 400);
        }

        try {
            $this->model->delete($id);
            Response::success(null, 'Department deleted successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
