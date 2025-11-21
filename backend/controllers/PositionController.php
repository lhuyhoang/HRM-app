<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/PositionModel.php';
require_once __DIR__ . '/../models/PositionDepartmentModel.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class PositionController extends BaseController
{
    private $pdModel;

    public function __construct()
    {
        $this->model = new PositionModel();
        $this->pdModel = new PositionDepartmentModel();
    }

    public function index()
    {
        AuthMiddleware::require();
        try {
            $departmentId = $this->getParam('department_id');
            if ($departmentId) {
                $positions = $this->model->getByDepartment($departmentId);
            } else {
                $positions = $this->model->getAllWithDepartment();
            }
            Response::success($positions);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function show($id)
    {
        AuthMiddleware::require();
        try {
            $position = $this->model->getById($id);
            if (!$position)
                Response::notFound('Position not found');
            Response::success($position);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function create()
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        $errors = Validator::required($data, ['title']);
        if ($errors)
            Response::validationError($errors);

        $baseSalary = isset($data['base_salary']) ? (float) $data['base_salary'] : 0;
        if ($baseSalary < 0) {
            Response::error('Base salary must be non-negative');
        }

        $departmentId = isset($data['department_id']) && $data['department_id'] !== null ? (int) $data['department_id'] : null;

        if ($departmentId && $this->model->titleExists($data['title'], $departmentId)) {
            Response::error('Position title already exists in this department', 409);
        }

        $positionData = [
            'title' => Validator::sanitize($data['title']),
            'department_id' => $departmentId,
            'base_salary' => $baseSalary,
            'description' => isset($data['description']) ? Validator::sanitize($data['description']) : null,
            'created_at' => date('Y-m-d H:i:s')
        ];

        try {
            $id = $this->model->create($positionData);
            $position = $this->model->getById($id);
            Response::created($position, 'Position created successfully');
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
            Response::notFound('Position not found');

        // Chỉ validate title và base_salary, department_id giữ nguyên từ existing
        $errors = Validator::required($data, ['title', 'base_salary']);
        if ($errors)
            Response::validationError($errors);

        $baseSalary = (float) $data['base_salary'];
        if ($baseSalary < 0) {
            Response::error('Base salary must be non-negative');
        }

        // Sử dụng department_id từ data nếu có, nếu không thì giữ nguyên
        $departmentId = isset($data['department_id']) ? $data['department_id'] : $existing['department_id'];

        // Chỉ kiểm tra trùng title nếu department_id có giá trị
        if ($departmentId && $this->model->titleExists($data['title'], $departmentId, $id)) {
            Response::error('Position title already exists in this department', 409);
        }

        $positionData = [
            'title' => Validator::sanitize($data['title']),
            'department_id' => $departmentId,
            'base_salary' => $baseSalary,
            'description' => isset($data['description']) ? Validator::sanitize($data['description']) : $existing['description'],
            'updated_at' => date('Y-m-d H:i:s')
        ];

        try {
            $this->model->update($id, $positionData);
            $position = $this->model->getById($id);
            Response::success($position, 'Position updated successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function delete($id)
    {
        AuthMiddleware::require();

        $position = $this->model->getById($id);
        if (!$position)
            Response::notFound('Position not found');

        if (!$this->model->canDelete($id)) {
            $employeeCount = $this->model->getEmployeeCount($id);
            Response::error(
                "Không thể xóa vị trí '{$position['title']}' vì có {$employeeCount} nhân viên đang làm việc ở vị trí này. Vui lòng chuyển nhân viên sang vị trí khác trước khi xóa.",
                400
            );
        }

        try {
            $this->model->delete($id);
            Response::success(null, 'Position deleted successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    /**
     * Add department to position
     */
    public function addDepartmentToPosition($positionId, $departmentId)
    {
        // Log for debugging
        error_log("addDepartmentToPosition called with posId: $positionId, deptId: $departmentId");

        AuthMiddleware::require();

        // Validate input
        if (!is_numeric($positionId) || !is_numeric($departmentId)) {
            error_log("Invalid input - posId: " . var_export($positionId, true) . ", deptId: " . var_export($departmentId, true));
            Response::error('Invalid position or department ID', 400);
        }

        $positionId = (int) $positionId;
        $departmentId = (int) $departmentId;

        try {
            // Verify position exists
            $position = $this->model->getById($positionId);
            if (!$position) {
                Response::notFound('Position not found');
            }

            // Verify department exists
            require_once __DIR__ . '/../models/DepartmentModel.php';
            $deptModel = new DepartmentModel();
            $department = $deptModel->getById($departmentId);
            if (!$department) {
                Response::notFound('Department not found');
            }

            // Check if already linked
            if ($this->pdModel->isLinked($positionId, $departmentId)) {
                Response::error(
                    "Phòng ban '{$department['name']}' đã được gán cho vị trí '{$position['title']}' rồi.",
                    409
                );
            }

            // Add the link
            $this->pdModel->addDepartment($positionId, $departmentId);

            // Return updated position with departments
            $position = $this->model->getById($positionId);
            $position['additional_departments'] = $this->pdModel->getDepartmentsByPosition($positionId);

            Response::created($position, 'Department added to position successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    /**
     * Remove department from position
     */
    public function removeDepartmentFromPosition($positionId, $departmentId)
    {
        AuthMiddleware::require();

        try {
            // Verify position exists
            $position = $this->model->getById($positionId);
            if (!$position) {
                Response::notFound('Position not found');
            }

            // Check if linked
            if (!$this->pdModel->isLinked($positionId, $departmentId)) {
                Response::notFound('Department not linked to this position');
            }

            // Remove the link
            $this->pdModel->removeDepartment($positionId, $departmentId);

            // Return updated position with departments
            $position = $this->model->getById($positionId);
            $position['additional_departments'] = $this->pdModel->getDepartmentsByPosition($positionId);

            Response::success($position, 'Department removed from position successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
