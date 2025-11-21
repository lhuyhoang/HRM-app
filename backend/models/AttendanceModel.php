<?php
require_once __DIR__ . '/BaseModel.php';

class AttendanceModel extends BaseModel
{
    protected $table = 'attendance';

    /**
     * Get all attendance records with details
     * @param array $filters Optional filters (department_id, position_id, date)
     * @return array
     */
    public function getAllWithDetails($filters = [])
    {
        try {
            $sql = "SELECT a.*, 
                           e.full_name as employee_name,
                           e.department_id,
                           e.position_id,
                           d.name as department_name,
                           p.title as position_title
                    FROM {$this->table} a
                    INNER JOIN employees e ON a.employee_id = e.id
                    LEFT JOIN departments d ON e.department_id = d.id
                    LEFT JOIN positions p ON e.position_id = p.id
                    WHERE 1=1";

            if (isset($filters['department_id'])) {
                $sql .= " AND e.department_id = :dept_id";
            }
            if (isset($filters['position_id'])) {
                $sql .= " AND e.position_id = :pos_id";
            }
            if (isset($filters['date'])) {
                $sql .= " AND a.date = :date";
            }
            if (isset($filters['employee_id'])) {
                $sql .= " AND a.employee_id = :emp_id";
            }

            $sql .= " ORDER BY a.date DESC, e.full_name ASC";

            $stmt = $this->db->prepare($sql);

            if (isset($filters['department_id'])) {
                $stmt->bindValue(':dept_id', $filters['department_id'], PDO::PARAM_INT);
            }
            if (isset($filters['position_id'])) {
                $stmt->bindValue(':pos_id', $filters['position_id'], PDO::PARAM_INT);
            }
            if (isset($filters['date'])) {
                $stmt->bindValue(':date', $filters['date']);
            }
            if (isset($filters['employee_id'])) {
                $stmt->bindValue(':emp_id', $filters['employee_id'], PDO::PARAM_INT);
            }

            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching attendance: " . $e->getMessage());
        }
    }

    /**
     * Check if attendance exists for employee on date
     * @param int $employeeId
     * @param string $date
     * @param int $excludeId Optional ID to exclude (for updates)
     * @return bool
     */
    public function existsForDate($employeeId, $date, $excludeId = null)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table} 
                    WHERE employee_id = :emp_id AND date = :date";
            if ($excludeId) {
                $sql .= " AND id != :exclude_id";
            }

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':emp_id', $employeeId, PDO::PARAM_INT);
            $stmt->bindValue(':date', $date);
            if ($excludeId) {
                $stmt->bindValue(':exclude_id', $excludeId, PDO::PARAM_INT);
            }

            $stmt->execute();
            $result = $stmt->fetch();
            return $result['count'] > 0;
        } catch (PDOException $e) {
            throw new Exception("Error checking attendance: " . $e->getMessage());
        }
    }

    /**
     * Get attendance summary for employee
     * @param int $employeeId
     * @param string $startDate
     * @param string $endDate
     * @return array
     */
    public function getSummary($employeeId, $startDate, $endDate)
    {
        try {
            $sql = "SELECT 
                           COUNT(*) as total_days,
                           SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                           SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                           SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
                    FROM {$this->table}
                    WHERE employee_id = :emp_id 
                      AND date BETWEEN :start_date AND :end_date";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':emp_id', $employeeId, PDO::PARAM_INT);
            $stmt->bindValue(':start_date', $startDate);
            $stmt->bindValue(':end_date', $endDate);
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("Error getting attendance summary: " . $e->getMessage());
        }
    }
}
