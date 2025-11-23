<?php
require_once __DIR__ . '/BaseModel.php';

class DashboardModel extends BaseModel
{
    protected $table = null;

    // Lấy thống kê tổng quan hệ thống
    public function getStats(): array
    {
        try {
            $sql = "SELECT COUNT(*) as total FROM employees";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $employees = $stmt->fetch();

            $sql = "SELECT COUNT(*) as total FROM departments";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $departments = $stmt->fetch();

            $sql = "SELECT COUNT(*) as total FROM positions";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $positions = $stmt->fetch();

            $sql = "SELECT COUNT(*) as total FROM leaves WHERE status = 'pending'";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $pendingLeaves = $stmt->fetch();

            $sql = "SELECT COUNT(*) as total FROM attendance WHERE date = CURDATE()";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $todayAttendance = $stmt->fetch();

            return [
                'total_employees' => (int) $employees['total'],
                'total_departments' => (int) $departments['total'],
                'total_positions' => (int) $positions['total'],
                'pending_leaves' => (int) $pendingLeaves['total'],
                'today_attendance' => (int) $todayAttendance['total']
            ];
        } catch (PDOException $e) {
            throw new Exception("Error fetching dashboard stats: " . $e->getMessage());
        }
    }

    // Lấy phân bố nhân viên theo phòng ban
    public function getDepartmentDistribution(): array
    {
        try {
            $sql = "SELECT d.name, COUNT(e.id) as employee_count
                    FROM departments d
                    LEFT JOIN employees e ON d.id = e.department_id
                    GROUP BY d.id
                    ORDER BY employee_count DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching department distribution: " . $e->getMessage());
        }
    }

    // Lấy danh sách hoạt động gần đây
    public function getRecentActivities(int $limit = 10): array
    {
        try {
            $activities = [];

            $sql = "SELECT 'employee' as type, full_name as name, created_at 
                    FROM employees 
                    ORDER BY created_at DESC 
                    LIMIT :limit";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $activities = array_merge($activities, $stmt->fetchAll());

            $sql = "SELECT 'leave' as type, 
                           CONCAT(e.full_name, ' - ', l.leave_type) as name, 
                           l.created_at
                    FROM leaves l
                    INNER JOIN employees e ON l.employee_id = e.id
                    ORDER BY l.created_at DESC 
                    LIMIT :limit";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $activities = array_merge($activities, $stmt->fetchAll());

            usort($activities, function ($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });

            return array_slice($activities, 0, $limit);
        } catch (PDOException $e) {
            throw new Exception("Error fetching recent activities: " . $e->getMessage());
        }
    }
}
