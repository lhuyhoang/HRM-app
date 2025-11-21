<?php
class Response
{
    /**
     * Send JSON response
     * @param mixed $data
     * @param int $statusCode
     * @param string $message
     */
    public static function json($data = null, $statusCode = 200, $message = '')
    {
        http_response_code($statusCode);

        $response = [
            'success' => $statusCode >= 200 && $statusCode < 300,
            'status' => $statusCode
        ];

        if ($message) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Send success response
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     */
    public static function success($data = null, $message = 'Success', $statusCode = 200)
    {
        self::json($data, $statusCode, $message);
    }

    /**
     * Send error response
     * @param string $message
     * @param int $statusCode
     * @param mixed $errors
     */
    public static function error($message = 'Error', $statusCode = 400, $errors = null)
    {
        http_response_code($statusCode);

        $response = [
            'success' => false,
            'status' => $statusCode,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Send created response
     * @param mixed $data
     * @param string $message
     */
    public static function created($data = null, $message = 'Created successfully')
    {
        self::success($data, $message, 201);
    }

    /**
     * Send not found response
     * @param string $message
     */
    public static function notFound($message = 'Resource not found')
    {
        self::error($message, 404);
    }

    /**
     * Send unauthorized response
     * @param string $message
     */
    public static function unauthorized($message = 'Unauthorized')
    {
        self::error($message, 401);
    }

    /**
     * Send forbidden response
     * @param string $message
     */
    public static function forbidden($message = 'Forbidden')
    {
        self::error($message, 403);
    }

    /**
     * Send validation error response
     * @param array $errors
     * @param string $message
     */
    public static function validationError($errors, $message = 'Validation failed')
    {
        self::error($message, 422, $errors);
    }

    /**
     * Send server error response
     * @param string $message
     */
    public static function serverError($message = 'Internal server error')
    {
        self::error($message, 500);
    }
}
