<?php
abstract class BaseController
{
    protected $model;

    protected function getRequestMethod()
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    protected function getRequestData()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        return $data ?? [];
    }

    protected function getQueryParams()
    {
        return $_GET;
    }

    protected function getParam($key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }

    protected function getRouteParam($index)
    {
        global $routeParams;
        return $routeParams[$index] ?? null;
    }

    protected function validateRequired($data, $required)
    {
        $errors = [];
        foreach ($required as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $errors[] = "Field '$field' is required";
            }
        }
        return empty($errors) ? null : $errors;
    }

    protected function sanitizeData($data)
    {
        $sanitized = [];
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $sanitized[$key] = htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
            } else {
                $sanitized[$key] = $value;
            }
        }
        return $sanitized;
    }

    protected function getAuthUserId()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
            $payload = JWTHandler::decode($token);
            return $payload['user_id'] ?? null;
        }

        return null;
    }
}
