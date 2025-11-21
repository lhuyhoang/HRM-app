<?php
require_once __DIR__ . '/BaseModel.php';

class PositionDepartmentModel extends BaseModel
{
    protected $table = 'position_departments';

    /**
     * Get all departments for a position
     */
    public function getDepartmentsByPosition($positionId)
    {
        try {
            $sql = "SELECT d.* FROM departments d 
                    INNER JOIN position_departments pd ON d.id = pd.department_id 
                    WHERE pd.position_id = :position_id 
                    ORDER BY d.name";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['position_id' => $positionId]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching departments: " . $e->getMessage());
        }
    }

    /**
     * Add department to position
     */
    public function addDepartment($positionId, $departmentId)
    {
        try {
            $sql = "INSERT INTO {$this->table} (position_id, department_id) 
                    VALUES (:position_id, :department_id)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'position_id' => $positionId,
                'department_id' => $departmentId
            ]);
            return $this->db->lastInsertId();
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                throw new Exception("Department already linked to this position");
            }
            throw new Exception("Error adding department: " . $e->getMessage());
        }
    }

    /**
     * Remove department from position
     */
    public function removeDepartment($positionId, $departmentId)
    {
        try {
            $sql = "DELETE FROM {$this->table} 
                    WHERE position_id = :position_id AND department_id = :department_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'position_id' => $positionId,
                'department_id' => $departmentId
            ]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new Exception("Error removing department: " . $e->getMessage());
        }
    }

    /**
     * Check if department is linked to position
     */
    public function isLinked($positionId, $departmentId)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table} 
                    WHERE position_id = :position_id AND department_id = :department_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'position_id' => $positionId,
                'department_id' => $departmentId
            ]);
            $result = $stmt->fetch();
            return $result['count'] > 0;
        } catch (PDOException $e) {
            throw new Exception("Error checking link: " . $e->getMessage());
        }
    }
}
