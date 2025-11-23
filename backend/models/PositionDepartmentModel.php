<?php
require_once __DIR__ . '/BaseModel.php';

class PositionDepartmentModel extends BaseModel
{
    protected $table = 'position_departments';

    // Lấy danh sách phòng ban liên kết với vị trí
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

    // Thêm phòng ban vào vị trí
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

    // Xóa phòng ban khỏi vị trí
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

    // Kiểm tra vị trí đã liên kết với phòng ban chưa
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
