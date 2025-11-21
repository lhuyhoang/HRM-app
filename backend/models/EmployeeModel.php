<?php
require_once __DIR__ . '/BaseModel.php';
class EmployeeModel extends BaseModel
{
    protected $table = 'employees';
    /**
     * Get all employees with related data
     * @return array
     */
    public function getAllWithDetails()
    {
        try {
            $sql = "SELECT e.*, 
                           d.name as department_name,
                           p.title as position_title,
                           p.base_salary
                    FROM {$this->table} e
                    LEFT JOIN departments d ON e.department_id = d.id
                    LEFT JOIN positions p ON e.position_id = p.id
                    ORDER BY e.full_name ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching employees: " . $e->getMessage());
        }
    }

    /**
     * Get employee by ID with details
     * @param int $id
     * @return array|false
     */
    public function getByIdWithDetails($id)
    {
        try {
            $sql = "SELECT e.*, 
                           d.name as department_name,
                           p.title as position_title,
                           p.base_salary
                    FROM {$this->table} e
                    LEFT JOIN departments d ON e.department_id = d.id
                    LEFT JOIN positions p ON e.position_id = p.id
                    WHERE e.id = :id
                    LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("Error fetching employee: " . $e->getMessage());
        }
    }

    /**
     * Search employees
     * @param string $query
     * @param array $fields
     * @return array
     */
    public function search($query, $fields = ['full_name', 'email', 'phone'])
    {
        try {
            $sql = "SELECT e.*, 
                           d.name as department_name,
                           p.title as position_title
                    FROM {$this->table} e
                    LEFT JOIN departments d ON e.department_id = d.id
                    LEFT JOIN positions p ON e.position_id = p.id
                    WHERE e.full_name LIKE :query 
                       OR e.email LIKE :query 
                       OR e.phone LIKE :query
                       OR d.name LIKE :query
                       OR p.title LIKE :query
                    ORDER BY e.full_name ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':query', "%$query%");
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error searching employees: " . $e->getMessage());
        }
    }

    /**
     * Get employees by department
     * @param int $departmentId
     * @return array
     */
    public function getByDepartment($departmentId)
    {
        try {
            $sql = "SELECT e.*, p.title as position_title
                    FROM {$this->table} e
                    LEFT JOIN positions p ON e.position_id = p.id
                    WHERE e.department_id = :dept_id
                    ORDER BY e.full_name ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':dept_id', $departmentId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching employees: " . $e->getMessage());
        }
    }

    /**
     * Get employees by position
     * @param int $positionId
     * @return array
     */
    public function getByPosition($positionId)
    {
        try {
            $sql = "SELECT e.*, d.name as department_name
                    FROM {$this->table} e
                    LEFT JOIN departments d ON e.department_id = d.id
                    WHERE e.position_id = :pos_id
                    ORDER BY e.full_name ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':pos_id', $positionId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching employees: " . $e->getMessage());
        }
    }

    /**
     * Get employees by department and position
     * @param int $departmentId
     * @param int $positionId
     * @return array
     */
    public function getByDepartmentAndPosition($departmentId, $positionId)
    {
        try {
            $sql = "SELECT * FROM {$this->table}
                    WHERE department_id = :dept_id AND position_id = :pos_id
                    ORDER BY full_name ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':dept_id', $departmentId, PDO::PARAM_INT);
            $stmt->bindValue(':pos_id', $positionId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching employees: " . $e->getMessage());
        }
    }

    /**
     * Check if email exists
     * @param string $email
     * @param int $excludeId
     * @return bool
     */
    public function emailExists($email, $excludeId = null)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE email = :email";
            if ($excludeId) {
                $sql .= " AND id != :exclude_id";
            }

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':email', $email);
            if ($excludeId) {
                $stmt->bindValue(':exclude_id', $excludeId, PDO::PARAM_INT);
            }

            $stmt->execute();
            $result = $stmt->fetch();
            return $result['count'] > 0;
        } catch (PDOException $e) {
            throw new Exception("Error checking email: " . $e->getMessage());
        }
    }
}
