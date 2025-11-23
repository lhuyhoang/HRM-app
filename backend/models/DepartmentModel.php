<?php
require_once __DIR__ . '/BaseModel.php';

class DepartmentModel extends BaseModel
{
    protected $table = 'departments';

    // Lấy tất cả phòng ban kèm thống kê số lượng nhân viên
    public function getAllWithStats(): array
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

    // Kiểm tra tên phòng ban đã tồn tại chưa
    public function nameExists(string $name, $excludeId = null): bool
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

    // Kiểm tra có thể xóa phòng ban hay không (không có nhân viên hoặc vị trí)
    public function canDelete($id): array
    {
        try {
            // Kiểm tra có nhân viên trong phòng ban không
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

            // Kiểm tra có vị trí trong phòng ban không
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
