<?php
require_once __DIR__ . '/BaseModel.php';
class PositionModel extends BaseModel
{
    protected $table = 'positions';

    // Lấy tất cả vị trí kèm thông tin phòng ban và số lượng nhân viên
    public function getAllWithDepartment()
    {
        try {
            $sql = "SELECT p.*, d.name as department_name,
                           COUNT(DISTINCT e.id) as employee_count
                    FROM {$this->table} p
                    LEFT JOIN departments d ON p.department_id = d.id
                    LEFT JOIN employees e ON p.id = e.position_id
                    GROUP BY p.id
                    ORDER BY d.name ASC, p.title ASC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $positions = $stmt->fetchAll();

            require_once __DIR__ . '/PositionDepartmentModel.php';
            $pdModel = new PositionDepartmentModel();

            foreach ($positions as &$position) {
                $position['additional_departments'] = $pdModel->getDepartmentsByPosition($position['id']);
            }

            return $positions;
        } catch (PDOException $e) {
            throw new Exception("Error fetching positions: " . $e->getMessage());
        }
    }

    // Lấy danh sách vị trí theo phòng ban
    public function getByDepartment($departmentId)
    {
        try {
            $sql = "SELECT * FROM {$this->table} 
                    WHERE department_id = :dept_id 
                    ORDER BY title ASC";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':dept_id', $departmentId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching positions: " . $e->getMessage());
        }
    }
    // Kiểm tra tên vị trí đã tồn tại trong phòng ban chưa
    public function titleExists($title, $departmentId, $excludeId = null)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table} 
                    WHERE title = :title AND department_id = :dept_id";
            if ($excludeId) {
                $sql .= " AND id != :exclude_id";
            }
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':title', $title);
            $stmt->bindValue(':dept_id', $departmentId, PDO::PARAM_INT);
            if ($excludeId) {
                $stmt->bindValue(':exclude_id', $excludeId, PDO::PARAM_INT);
            }
            $stmt->execute();
            $result = $stmt->fetch();
            return $result['count'] > 0;
        } catch (PDOException $e) {
            throw new Exception("Error checking position: " . $e->getMessage());
        }
    }

    // Kiểm tra có thể xóa vị trí hay không (không có nhân viên)
    public function canDelete($id)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM employees WHERE position_id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch();
            return $result['count'] == 0;
        } catch (PDOException $e) {
            throw new Exception("Error checking position: " . $e->getMessage());
        }
    }

    // Đếm số lượng nhân viên trong vị trí
    public function getEmployeeCount($id)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM employees WHERE position_id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch();
            return (int) $result['count'];
        } catch (PDOException $e) {
            throw new Exception("Error counting employees: " . $e->getMessage());
        }
    }
}
