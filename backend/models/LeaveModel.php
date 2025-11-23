<?php
require_once __DIR__ . '/BaseModel.php';
class LeaveModel extends BaseModel
{
    protected $table = 'leaves';

    // Lấy danh sách đơn xin nghỉ kèm thông tin nhân viên, phòng ban, vị trí
    public function getAllWithDetails($filters = [])
    {
        try {
            $sql = "SELECT l.*, 
                           e.full_name as employee_name,
                           e.department_id,
                           e.position_id,
                           d.name as department_name,
                           p.title as position_title,
                           DATEDIFF(l.end_date, l.start_date) + 1 as total_days
                    FROM {$this->table} l
                    INNER JOIN employees e ON l.employee_id = e.id
                    LEFT JOIN departments d ON e.department_id = d.id
                    LEFT JOIN positions p ON e.position_id = p.id
                    WHERE 1=1";
            if (isset($filters['department_id'])) {
                $sql .= " AND e.department_id = :dept_id";
            }
            if (isset($filters['position_id'])) {
                $sql .= " AND e.position_id = :pos_id";
            }
            if (isset($filters['status'])) {
                $sql .= " AND l.status = :status";
            }
            if (isset($filters['employee_id'])) {
                $sql .= " AND l.employee_id = :emp_id";
            }
            $sql .= " ORDER BY l.created_at DESC";
            $stmt = $this->db->prepare($sql);
            if (isset($filters['department_id'])) {
                $stmt->bindValue(':dept_id', $filters['department_id'], PDO::PARAM_INT);
            }
            if (isset($filters['position_id'])) {
                $stmt->bindValue(':pos_id', $filters['position_id'], PDO::PARAM_INT);
            }
            if (isset($filters['status'])) {
                $stmt->bindValue(':status', $filters['status']);
            }
            if (isset($filters['employee_id'])) {
                $stmt->bindValue(':emp_id', $filters['employee_id'], PDO::PARAM_INT);
            }
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching leave requests: " . $e->getMessage());
        }
    }
    // Cập nhật trạng thái đơn xin nghỉ
    public function updateStatus($id, $status)
    {
        return $this->update($id, [
            'status' => $status,
            'updated_at' => date('Y-m-d H:i:s')
        ]);
    }
    // Kiểm tra có đơn xin nghỉ trùng thời gian hay không
    public function hasOverlap($employeeId, $startDate, $endDate, $excludeId = null)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table}
                    WHERE employee_id = :emp_id
                      AND status != 'rejected'
                      AND (
                          (start_date <= :end_date AND end_date >= :start_date)
                      )";
            if ($excludeId) {
                $sql .= " AND id != :exclude_id";
            }
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':emp_id', $employeeId, PDO::PARAM_INT);
            $stmt->bindValue(':start_date', $startDate);
            $stmt->bindValue(':end_date', $endDate);
            if ($excludeId) {
                $stmt->bindValue(':exclude_id', $excludeId, PDO::PARAM_INT);
            }
            $stmt->execute();
            $result = $stmt->fetch();
            return $result['count'] > 0;
        } catch (PDOException $e) {
            throw new Exception("Error checking leave overlap: " . $e->getMessage());
        }
    }

    // Lấy thống kê đơn xin nghỉ của nhân viên trong năm
    public function getEmployeeStats($employeeId, $year)
    {
        try {
            $sql = "SELECT 
                           COUNT(*) as total_requests,
                           SUM(CASE WHEN status = 'approved' THEN DATEDIFF(end_date, start_date) + 1 ELSE 0 END) as approved_days,
                           SUM(CASE WHEN status = 'pending' THEN DATEDIFF(end_date, start_date) + 1 ELSE 0 END) as pending_days,
                           SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
                    FROM {$this->table}
                    WHERE employee_id = :emp_id 
                      AND YEAR(start_date) = :year";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':emp_id', $employeeId, PDO::PARAM_INT);
            $stmt->bindValue(':year', $year, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("Error getting leave statistics: " . $e->getMessage());
        }
    }
}
