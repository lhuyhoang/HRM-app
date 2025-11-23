<?php
class AuthMiddleware
{
    public static function authenticate()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!$authHeader) {
            Response::unauthorized('No authorization token provided');
            return false;
        }

        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::unauthorized('Invalid authorization header format');
            return false;
        }

        $token = $matches[1];

        $payload = JWTHandler::decode($token);

        if (!$payload) {
            Response::unauthorized('Invalid or expired token');
            return false;
        }

        return $payload;
    }

    public static function require()
    {
        $user = self::authenticate();
        if (!$user) {
            exit;
        }
        return $user;
    }

    public static function optional()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!$authHeader) {
            return null;
        }

        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }

        $token = $matches[1];
        $payload = JWTHandler::decode($token);

        return $payload ?: null;
    }
}
