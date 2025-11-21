<?php
require_once __DIR__ . '/BaseModel.php';

class DepartmentModel extends BaseModel
{
    protected $table = 'departments';

    /**
     * Get all departments with employee count
     * @return array
     */
    public function getAllWithStats()
    {
        try {
            $sql = "SELECT d.*, 
                           COUNT(DISTINCT e.id) as employee_count
                    FROM {$this->table} d
                    LEFT JOIN employees e ON d.id = e.department_id
                    GROUP BY d.id
                    ORDER BY d.name ASC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching departments: " . $e->getMessage());
        }
    }

    /**
     * Check if department name exists
     * @param string $name
     * @param int $excludeId Optional ID to exclude (for updates)
     * @return bool
     */
    public function nameExists($name, $excludeId = null)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE name = :name";
            if ($excludeId) {
                $sql .= " AND id != :exclude_id";
            }

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':name', $name);
            if ($excludeId) {
                $stmt->bindValue(':exclude_id', $excludeId, PDO::PARAM_INT);
            }

            $stmt->execute();
            $result = $stmt->fetch();
            return $result['count'] > 0;
        } catch (PDOException $e) {
            throw new Exception("Error checking department name: " . $e->getMessage());
        }
    }

    /**
     * Check if department can be deleted
     * @param int $id
     * @return array Returns ['canDelete' => bool, 'reason' => string]
     */
    public function canDelete($id)
    {
        try {
            // Check for employees
            $sql = "SELECT COUNT(*) as count FROM employees WHERE department_id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch();

            if ($result['count'] > 0) {
                return [
                    'canDelete' => false,
                    'reason' => 'Cannot delete department with employees'
                ];
            }

            // Check for positions
            $sql = "SELECT COUNT(*) as count FROM positions WHERE department_id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch();

            if ($result['count'] > 0) {
                return [
                    'canDelete' => false,
                    'reason' => 'Cannot delete department with positions'
                ];
            }

            return ['canDelete' => true, 'reason' => ''];
        } catch (PDOException $e) {
            throw new Exception("Error checking department: " . $e->getMessage());
        }
    }
}
