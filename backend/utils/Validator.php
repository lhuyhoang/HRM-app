<?php
class Validator
{
    /**
     * Validate email
     * @param string $email
     * @return bool
     */
    public static function email($email)
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate required fields
     * @param array $data
     * @param array $required
     * @return array Errors
     */
    public static function required($data, $required)
    {
        $errors = [];
        foreach ($required as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $errors[$field] = "Field '$field' is required";
            }
        }
        return $errors;
    }

    /**
     * Validate minimum length
     * @param string $value
     * @param int $min
     * @return bool
     */
    public static function minLength($value, $min)
    {
        return strlen($value) >= $min;
    }

    /**
     * Validate maximum length
     * @param string $value
     * @param int $max
     * @return bool
     */
    public static function maxLength($value, $max)
    {
        return strlen($value) <= $max;
    }

    /**
     * Validate numeric value
     * @param mixed $value
     * @return bool
     */
    public static function numeric($value)
    {
        return is_numeric($value);
    }

    /**
     * Validate date format
     * @param string $date
     * @param string $format
     * @return bool
     */
    public static function date($date, $format = 'Y-m-d')
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }

    /**
     * Validate date range
     * @param string $startDate
     * @param string $endDate
     * @return bool
     */
    public static function dateRange($startDate, $endDate)
    {
        return strtotime($endDate) >= strtotime($startDate);
    }

    /**
     * Validate phone number
     * @param string $phone
     * @return bool
     */
    public static function phone($phone)
    {
        return preg_match('/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/', $phone);
    }

    /**
     * Validate positive number
     * @param mixed $value
     * @return bool
     */
    public static function positive($value)
    {
        return is_numeric($value) && $value > 0;
    }

    /**
     * Validate non-negative number
     * @param mixed $value
     * @return bool
     */
    public static function nonNegative($value)
    {
        return is_numeric($value) && $value >= 0;
    }

    /**
     * Validate enum value
     * @param mixed $value
     * @param array $allowed
     * @return bool
     */
    public static function enum($value, $allowed)
    {
        return in_array($value, $allowed, true);
    }

    /**
     * Sanitize string
     * @param string $value
     * @return string
     */
    public static function sanitize($value)
    {
        return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
    }
}
