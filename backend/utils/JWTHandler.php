<?php
/**
 * JWT Handler for Authentication
 * Simple JWT implementation for token generation and validation
 */
class JWTHandler
{
    /**
     * Encode payload to JWT token
     * @param array $payload
     * @return string
     */
    public static function encode($payload)
    {
        // Add issued at and expiration time
        $payload['iat'] = time();
        $payload['exp'] = time() + Config::JWT_EXPIRATION;

        // Create header
        $header = [
            'typ' => 'JWT',
            'alg' => Config::JWT_ALGORITHM
        ];

        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac(
            'sha256',
            "$headerEncoded.$payloadEncoded",
            Config::JWT_SECRET_KEY,
            true
        );
        $signatureEncoded = self::base64UrlEncode($signature);

        return "$headerEncoded.$payloadEncoded.$signatureEncoded";
    }

    /**
     * Decode and validate JWT token
     * @param string $token
     * @return array|false
     */
    public static function decode($token)
    {
        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return false;
            }

            list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;

            $signature = hash_hmac(
                'sha256',
                "$headerEncoded.$payloadEncoded",
                Config::JWT_SECRET_KEY,
                true
            );
            $signatureCheck = self::base64UrlEncode($signature);

            if ($signatureCheck !== $signatureEncoded) {
                return false;
            }

            $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);

            if (isset($payload['exp']) && $payload['exp'] < time()) {
                return false;
            }

            return $payload;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Base64 URL encode
     * @param string $data
     * @return string
     */
    private static function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode
     * @param string $data
     * @return string
     */
    private static function base64UrlDecode($data)
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
