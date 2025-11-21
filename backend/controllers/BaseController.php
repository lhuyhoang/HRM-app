<?php
abstract class BaseController
{
    protected $model;

    /**
     * Get request method
     * @return string
     */
    protected function getRequestMethod()
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    /**
     * Get request data from JSON body
     * @return array
     */
    protected function getRequestData()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        return $data ?? [];
    }

    /**
     * Get query parameters
     * @return array
     */
    protected function getQueryParams()
    {
        return $_GET;
    }

    /**
     * Get URL parameter
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    protected function getParam($key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }

    /**
     * Get route parameter (from parsed URL)
     * @param int $index
     * @return string|null
     */
    protected function getRouteParam($index)
    {
        global $routeParams;
        return $routeParams[$index] ?? null;
    }

    /**
     * Validate required fields
     * @param array $data
     * @param array $required
     * @return array|null
     */
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

    /**
     * Sanitize input data
     * @param array $data
     * @return array
     */
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

    /**
     * Get authenticated user ID from token
     * @return int|null
     */
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
