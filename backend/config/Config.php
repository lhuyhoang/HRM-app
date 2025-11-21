<?php
class Config
{
    const JWT_SECRET_KEY = 'your-secret-key-change-this-in-production-2024';
    const JWT_ALGORITHM = 'HS256';
    const JWT_EXPIRATION = 3600;

    const API_VERSION = 'v1';
    const API_PREFIX = '/api';

    const ALLOW_ORIGIN = '*';
    const ALLOW_METHODS = 'GET, POST, PUT, DELETE, OPTIONS';
    const ALLOW_HEADERS = 'Content-Type, Authorization';

    const DEFAULT_PAGE_SIZE = 20;
    const MAX_PAGE_SIZE = 100;

    const DATE_FORMAT = 'Y-m-d';
    const DATETIME_FORMAT = 'Y-m-d H:i:s';

    const TIMEZONE = 'Asia/Ho_Chi_Minh';
    public static function init()
    {
        date_default_timezone_set(self::TIMEZONE);

        header('Access-Control-Allow-Origin: ' . self::ALLOW_ORIGIN);
        header('Access-Control-Allow-Methods: ' . self::ALLOW_METHODS);
        header('Access-Control-Allow-Headers: ' . self::ALLOW_HEADERS);
        header('Content-Type: application/json; charset=UTF-8');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
