<?php
class Validator
{
    public static function email($email)
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

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

    public static function minLength($value, $min)
    {
        return strlen($value) >= $min;
    }

    public static function maxLength($value, $max)
    {
        return strlen($value) <= $max;
    }

    public static function numeric($value)
    {
        return is_numeric($value);
    }

    public static function date($date, $format = 'Y-m-d')
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }

    public static function dateRange($startDate, $endDate)
    {
        return strtotime($endDate) >= strtotime($startDate);
    }

    public static function phone($phone)
    {
        return preg_match('/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/', $phone);
    }

    public static function positive($value)
    {
        return is_numeric($value) && $value > 0;
    }

    public static function nonNegative($value)
    {
        return is_numeric($value) && $value >= 0;
    }

    public static function enum($value, $allowed)
    {
        return in_array($value, $allowed, true);
    }

    public static function sanitize($value)
    {
        return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
    }
}
