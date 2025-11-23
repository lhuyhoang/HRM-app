<?php
require_once __DIR__ . '/BaseModel.php';

class UserModel extends BaseModel
{
    protected $table = 'users';

    // Tìm người dùng theo tên đăng nhập
    public function findByUsername($username)
    {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE username = :username LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':username', $username);
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("Error finding user: " . $e->getMessage());
        }
    }

    // Tìm người dùng theo tên đăng nhập hoặc email
    public function findByUsernameOrEmail($identifier)
    {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE username = :username OR email = :email LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':username', $identifier);
            $stmt->bindValue(':email', $identifier);
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("Error finding user: " . $e->getMessage());
        }
    }

    // Tạo người dùng mới với mật khẩu đã mã hóa
    public function createUser($data)
    {
        // Mã hóa mật khẩu
        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $data['created_at'] = date('Y-m-d H:i:s');

        return $this->create($data);
    }

    // Xác thực thông tin đăng nhập
    public function verifyCredentials($identifier, $password)
    {
        $user = $this->findByUsernameOrEmail($identifier);

        if (!$user) {
            return false;
        }

        // Kiểm tra mật khẩu
        if (password_verify($password, $user['password'])) {
            unset($user['password']);
            return $user;
        }

        return false;
    }

    // Kiểm tra tên đăng nhập đã tồn tại chưa
    public function usernameExists($username)
    {
        return $this->findByUsername($username) !== false;
    }

    // Cập nhật thời gian đăng nhập cuối
    public function updateLastLogin($userId)
    {
        return $this->update($userId, [
            'last_login' => date('Y-m-d H:i:s')
        ]);
    }
}
