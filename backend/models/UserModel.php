<?php
require_once __DIR__ . '/BaseModel.php';
class UserModel extends BaseModel
{
    protected $table = 'users';

    /**
     * Find user by username
     * @param string $username
     * @return array|false
     */
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

    /**
     * Find user by username or email
     * @param string $identifier Username or email
     * @return array|false
     */
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

    /**
     * Create new user with hashed password
     * @param array $data
     * @return int User ID
     */
    public function createUser($data)
    {
        // Hash password
        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $data['created_at'] = date('Y-m-d H:i:s');

        return $this->create($data);
    }

    /**
     * Verify user password
     * @param string $identifier Username or email
     * @param string $password
     * @return array|false User data if valid, false otherwise
     */
    public function verifyCredentials($identifier, $password)
    {
        $user = $this->findByUsernameOrEmail($identifier);

        if (!$user) {
            return false;
        }

        if (password_verify($password, $user['password'])) {
            // Remove password from returned data
            unset($user['password']);
            return $user;
        }

        return false;
    }

    /**
     * Check if username exists
     * @param string $username
     * @return bool
     */
    public function usernameExists($username)
    {
        return $this->findByUsername($username) !== false;
    }

    /**
     * Update last login time
     * @param int $userId
     * @return bool
     */
    public function updateLastLogin($userId)
    {
        return $this->update($userId, [
            'last_login' => date('Y-m-d H:i:s')
        ]);
    }
}
