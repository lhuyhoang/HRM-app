<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Config.php';

class ForgotPasswordController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Request password reset
     * Gửi link reset password qua email (hoặc trả về token để test)
     */
    public function requestReset()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['identifier']) || empty(trim($data['identifier']))) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Email or username is required'
                ]);
                return;
            }

            $identifier = trim($data['identifier']);

            // Tìm user theo username hoặc email
            $query = "SELECT user_id, username, full_name, email FROM users 
                     WHERE username = :identifier OR email = :identifier 
                     LIMIT 1";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':identifier', $identifier);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Luôn trả về success message để tránh user enumeration attack
            if (!$user) {
                echo json_encode([
                    'success' => true,
                    'message' => 'If this account exists, a password reset link will be sent to the registered email.'
                ]);
                return;
            }

            // Tạo reset token
            $resetToken = bin2hex(random_bytes(32));
            $resetExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

            // Lưu token vào database
            $updateQuery = "UPDATE users 
                           SET reset_token = :token, 
                               reset_token_expiry = :expiry 
                           WHERE user_id = :user_id";

            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->bindParam(':token', $resetToken);
            $updateStmt->bindParam(':expiry', $resetExpiry);
            $updateStmt->bindParam(':user_id', $user['user_id']);
            $updateStmt->execute();

            // TODO: Gửi email với reset link
            // Trong production, sử dụng PHPMailer hoặc SMTP service
            // $resetLink = "http://localhost/hrmapp/frontend/pages/reset-password.html?token=" . $resetToken;
            // sendEmail($user['email'], 'Password Reset', $resetLink);

            // Trả về thông báo thành công (trong production không trả về token)
            echo json_encode([
                'success' => true,
                'message' => 'If this account exists, a password reset link will be sent to the registered email.',
                // Chỉ để test, xóa dòng này trong production
                'debug_token' => $resetToken,
                'debug_link' => "/hrmapp/frontend/pages/reset-password.html?token=" . $resetToken
            ]);

        } catch (PDOException $e) {
            error_log("Forgot password error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Server error occurred'
            ]);
        }
    }

    /**
     * Verify reset token
     * Kiểm tra token có hợp lệ và chưa hết hạn
     */
    public function verifyToken($token)
    {
        try {
            $query = "SELECT user_id, username, full_name 
                     FROM users 
                     WHERE reset_token = :token 
                     AND reset_token_expiry > NOW()
                     LIMIT 1";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':token', $token);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid or expired reset token'
                ]);
                return;
            }

            echo json_encode([
                'success' => true,
                'message' => 'Token is valid',
                'data' => [
                    'username' => $user['username'],
                    'full_name' => $user['full_name']
                ]
            ]);

        } catch (PDOException $e) {
            error_log("Verify token error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Server error occurred'
            ]);
        }
    }

    /**
     * Reset password
     * Đặt lại mật khẩu mới
     */
    public function resetPassword()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['token']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Token and new password are required'
                ]);
                return;
            }

            $token = trim($data['token']);
            $newPassword = $data['password'];

            // Validate password
            if (strlen($newPassword) < 6) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Password must be at least 6 characters'
                ]);
                return;
            }

            // Tìm user với token hợp lệ
            $query = "SELECT user_id FROM users 
                     WHERE reset_token = :token 
                     AND reset_token_expiry > NOW()
                     LIMIT 1";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':token', $token);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid or expired reset token'
                ]);
                return;
            }

            // Hash password mới
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            // Cập nhật password và xóa token
            $updateQuery = "UPDATE users 
                           SET password = :password, 
                               reset_token = NULL, 
                               reset_token_expiry = NULL 
                           WHERE user_id = :user_id";

            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->bindParam(':password', $hashedPassword);
            $updateStmt->bindParam(':user_id', $user['user_id']);
            $updateStmt->execute();

            echo json_encode([
                'success' => true,
                'message' => 'Password has been reset successfully'
            ]);

        } catch (PDOException $e) {
            error_log("Reset password error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Server error occurred'
            ]);
        }
    }
    public function resetPasswordSimple()
    {
        error_log("resetPasswordSimple called");
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            error_log("Received data: " . print_r($data, true));

            if (!isset($data['identifier']) || !isset($data['password'])) {
                error_log("Missing identifier or password");
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Username/email and new password are required'
                ]);
                return;
            }

            $identifier = trim($data['identifier']);
            $newPassword = $data['password'];

            // Validate password
            if (strlen($newPassword) < 6) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Password must be at least 6 characters'
                ]);
                return;
            }

            // Tìm user theo username
            $query = "SELECT id as user_id, username FROM users 
                     WHERE username = :identifier 
                     LIMIT 1";

            error_log("Query: " . $query);
            error_log("Identifier: " . $identifier);

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':identifier', $identifier);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("User found: " . print_r($user, true));

            if (!$user) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
                return;
            }

            // Hash password mới
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            // Cập nhật password
            $updateQuery = "UPDATE users SET password = :password WHERE id = :user_id";

            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->bindParam(':password', $hashedPassword);
            $updateStmt->bindParam(':user_id', $user['user_id']);
            $updateStmt->execute();

            echo json_encode([
                'success' => true,
                'message' => 'Password has been reset successfully'
            ]);

        } catch (PDOException $e) {
            error_log("Reset password simple error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Server error occurred'
            ]);
        }
    }
}
