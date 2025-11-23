<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/Config.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/JWTHandler.php';
require_once __DIR__ . '/utils/Validator.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

Config::init();
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = '/hrmapp/backend';
if (strpos($uri, $basePath) === 0) {
    $uri = substr($uri, strlen($basePath));
}
$uri = trim($uri, '/');
$parts = explode('/', $uri);
$routeParams = [];
try {
    if (!isset($parts[0]) || $parts[0] !== 'api') {
        Response::notFound('Invalid API endpoint');
    }
    $resource = $parts[1] ?? null;
    $id = isset($parts[2]) && is_numeric($parts[2]) ? (int) $parts[2] : null;
    $action = $id ? ($parts[3] ?? null) : ($parts[2] ?? null);

    $routeParams = array_slice($parts, 2);
    switch ($resource) {
        case 'auth':
            require_once __DIR__ . '/controllers/AuthController.php';
            $controller = new AuthController();

            if ($action === 'login' && $method === 'POST') {
                $controller->login();
            } elseif ($action === 'register' && $method === 'POST') {
                $controller->register();
            } elseif ($action === 'logout' && $method === 'POST') {
                $controller->logout();
            } elseif ($action === 'verify' && $method === 'GET') {
                $controller->verify();
            } elseif ($action === 'forgot-password' && $method === 'POST') {
                require_once __DIR__ . '/controllers/ForgotPasswordController.php';
                $forgotController = new ForgotPasswordController();
                $forgotController->requestReset();
            } elseif ($action === 'verify-token' && $method === 'GET') {
                require_once __DIR__ . '/controllers/ForgotPasswordController.php';
                $forgotController = new ForgotPasswordController();
                $token = $_GET['token'] ?? '';
                $forgotController->verifyToken($token);
            } elseif ($action === 'reset-password' && $method === 'POST') {
                require_once __DIR__ . '/controllers/ForgotPasswordController.php';
                $forgotController = new ForgotPasswordController();
                $forgotController->resetPassword();
            } elseif ($action === 'reset-password-simple' && $method === 'POST') {
                require_once __DIR__ . '/controllers/ForgotPasswordController.php';
                $forgotController = new ForgotPasswordController();
                $forgotController->resetPasswordSimple();
            } else {
                Response::notFound('Auth endpoint not found');
            }
            break;
        case 'departments':
            require_once __DIR__ . '/controllers/DepartmentController.php';
            $controller = new DepartmentController();

            if ($method === 'GET' && $id) {
                $controller->show($id);
            } elseif ($method === 'GET') {
                $controller->index();
            } elseif ($method === 'POST') {
                $controller->create();
            } elseif ($method === 'PUT' && $id) {
                $controller->update($id);
            } elseif ($method === 'DELETE' && $id) {
                $controller->delete($id);
            } else {
                Response::notFound('Department endpoint not found');
            }
            break;

        case 'positions':
            require_once __DIR__ . '/controllers/PositionController.php';
            $controller = new PositionController();

            if ($method === 'POST' && $id && $action === 'departments' && isset($parts[4]) && is_numeric($parts[4])) {
                $deptId = (int) $parts[4];
                $controller->addDepartmentToPosition($id, $deptId);
            } elseif ($method === 'DELETE' && $id && $action === 'departments' && isset($parts[4]) && is_numeric($parts[4])) {
                $deptId = (int) $parts[4];
                $controller->removeDepartmentFromPosition($id, $deptId);
            } elseif ($method === 'GET' && $id) {
                $controller->show($id);
            } elseif ($method === 'GET') {
                $controller->index();
            } elseif ($method === 'POST') {
                $controller->create();
            } elseif ($method === 'PUT' && $id) {
                $controller->update($id);
            } elseif ($method === 'DELETE' && $id) {
                $controller->delete($id);
            } else {
                Response::notFound('Position endpoint not found');
            }
            break;

        case 'employees':
            require_once __DIR__ . '/controllers/EmployeeController.php';
            $controller = new EmployeeController();

            if ($action === 'search' && $method === 'GET') {
                $controller->search();
            } elseif ($method === 'GET' && $id) {
                $controller->show($id);
            } elseif ($method === 'GET') {
                $controller->index();
            } elseif ($method === 'POST') {
                $controller->create();
            } elseif ($method === 'PUT' && $id) {
                $controller->update($id);
            } elseif ($method === 'DELETE' && $id) {
                $controller->delete($id);
            } else {
                Response::notFound('Employee endpoint not found');
            }
            break;

        case 'salaries':
            require_once __DIR__ . '/controllers/SalaryController.php';
            $controller = new SalaryController();

            if ($action === 'payroll' && $method === 'GET') {
                $controller->payroll();
            } elseif ($action === 'employee' && $method === 'GET' && isset($parts[3])) {
                $controller->getByEmployee($parts[3]);
            } elseif ($action === 'status' && $method === 'PUT' && $id) {
                $controller->updateStatus($id);
            } elseif ($method === 'GET' && $id) {
                $controller->show($id);
            } elseif ($method === 'GET') {
                $controller->index();
            } elseif ($method === 'POST') {
                $controller->create();
            } elseif ($method === 'PUT' && $id) {
                $controller->update($id);
            } elseif ($method === 'DELETE' && $id) {
                $controller->delete($id);
            } else {
                Response::notFound('Salary endpoint not found');
            }
            break;

        case 'attendance':
            require_once __DIR__ . '/controllers/AttendanceController.php';
            $controller = new AttendanceController();

            if ($action === 'summary' && $method === 'GET' && $id) {
                $controller->summary($id);
            } elseif ($method === 'GET' && $id) {
                $controller->show($id);
            } elseif ($method === 'GET') {
                $controller->index();
            } elseif ($method === 'POST') {
                $controller->create();
            } elseif ($method === 'PUT' && $id) {
                $controller->update($id);
            } elseif ($method === 'DELETE' && $id) {
                $controller->delete($id);
            } else {
                Response::notFound('Attendance endpoint not found');
            }
            break;

        case 'leaves':
            require_once __DIR__ . '/controllers/LeaveController.php';
            $controller = new LeaveController();

            if ($action === 'status' && $method === 'PUT' && $id) {
                $controller->updateStatus($id);
            } elseif ($method === 'GET' && $id) {
                $controller->show($id);
            } elseif ($method === 'GET') {
                $controller->index();
            } elseif ($method === 'POST') {
                $controller->create();
            } elseif ($method === 'PUT' && $id) {
                $controller->update($id);
            } elseif ($method === 'DELETE' && $id) {
                $controller->delete($id);
            } else {
                Response::notFound('Leave endpoint not found');
            }
            break;

        case 'performance':
            require_once __DIR__ . '/controllers/PerformanceController.php';
            $controller = new PerformanceController();

            if ($action === 'average' && $method === 'GET' && $id) {
                $controller->averageRating($id);
            } elseif ($method === 'GET' && $id) {
                $controller->show($id);
            } elseif ($method === 'GET') {
                $controller->index();
            } elseif ($method === 'POST') {
                $controller->create();
            } elseif ($method === 'PUT' && $id) {
                $controller->update($id);
            } elseif ($method === 'DELETE' && $id) {
                $controller->delete($id);
            } else {
                Response::notFound('Performance endpoint not found');
            }
            break;

        case 'dashboard':
            require_once __DIR__ . '/controllers/DashboardController.php';
            $controller = new DashboardController();

            if ($action === 'stats' && $method === 'GET') {
                $controller->stats();
            } elseif ($action === 'distribution' && $method === 'GET') {
                $controller->distribution();
            } elseif ($action === 'activities' && $method === 'GET') {
                $controller->activities();
            } else {
                Response::notFound('Dashboard endpoint not found');
            }
            break;

        default:
            Response::notFound('Resource not found');
    }

} catch (PDOException $e) {
    Response::serverError('Database error: ' . $e->getMessage());
} catch (Exception $e) {
    Response::serverError('Server error: ' . $e->getMessage());
}