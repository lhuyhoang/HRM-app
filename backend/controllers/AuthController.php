<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/UserModel.php';
require_once __DIR__ . '/../utils/JWTHandler.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class AuthController extends BaseController
{

    public function __construct()
    {
        $this->model = new UserModel();
    }

    public function login()
    {
        $data = $this->getRequestData();

        $errors = Validator::required($data, ['username', 'password']);
        if ($errors) {
            Response::validationError($errors);
        }

        $user = $this->model->verifyCredentials($data['username'], $data['password']);

        if (!$user) {
            Response::error('Invalid username or password', 401);
        }

        $this->model->updateLastLogin($user['id']);

        $token = JWTHandler::encode([
            'user_id' => $user['id'],
            'username' => $user['username']
        ]);

        Response::success([
            'token' => $token,
            'user' => $user
        ], 'Login successful');
    }

    public function register()
    {
        $data = $this->getRequestData();

        $errors = Validator::required($data, ['username', 'password', 'full_name', 'email']);
        if ($errors) {
            Response::validationError($errors);
        }

        if (!Validator::minLength($data['username'], 3)) {
            Response::error('Username must be at least 3 characters');
        }

        if (!Validator::minLength($data['password'], 6)) {
            Response::error('Password must be at least 6 characters');
        }

        if (!Validator::email($data['email'])) {
            Response::error('Invalid email format');
        }

        if ($this->model->usernameExists($data['username'])) {
            Response::error('Username already exists', 409);
        }

        $userData = [
            'username' => Validator::sanitize($data['username']),
            'password' => $data['password'], // Will be hashed in model
            'full_name' => Validator::sanitize($data['full_name']),
            'email' => Validator::sanitize($data['email'])
        ];

        try {
            $userId = $this->model->createUser($userData);

            $user = $this->model->getById($userId);
            unset($user['password']);

            $token = JWTHandler::encode([
                'user_id' => $user['id'],
                'username' => $user['username']
            ]);

            Response::created([
                'token' => $token,
                'user' => $user
            ], 'Registration successful');
        } catch (Exception $e) {
            Response::serverError('Registration failed: ' . $e->getMessage());
        }
    }

    public function logout()
    {

        Response::success(null, 'Logout successful');
    }

    public function verify()
    {
        $user = AuthMiddleware::require();

        $userData = $this->model->getById($user['user_id']);
        if ($userData) {
            unset($userData['password']);
            Response::success($userData, 'Token valid');
        } else {
            Response::unauthorized('User not found');
        }
    }
}
