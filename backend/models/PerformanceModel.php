<?php
require_once __DIR__ . '/BaseModel.php';
class PerformanceModel extends BaseModel
{
    protected $table = 'performance_reviews';

    /**
     * Get all performance reviews with details
     * @param array $filters 
     * @return array
     */
    public function getAllWithDetails($filters = [])
    {
        try {
            $sql = "SELECT pr.*, 
                           e.full_name as employee_name,
                           e.department_id,
                           e.position_id,
                           d.name as department_name,
                           p.title as position_title
                    FROM {$this->table} pr
                    INNER JOIN employees e ON pr.employee_id = e.id
                    LEFT JOIN departments d ON e.department_id = d.id
                    LEFT JOIN positions p ON e.position_id = p.id
                    WHERE 1=1";

            if (isset($filters['department_id'])) {
                $sql .= " AND e.department_id = :dept_id";
            }
            if (isset($filters['position_id'])) {
                $sql .= " AND e.position_id = :pos_id";
            }
            if (isset($filters['period'])) {
                $sql .= " AND pr.review_period = :period";
            }
            if (isset($filters['employee_id'])) {
                $sql .= " AND pr.employee_id = :emp_id";
            }

            $sql .= " ORDER BY pr.review_period DESC, e.full_name ASC";

            $stmt = $this->db->prepare($sql);

            if (isset($filters['department_id'])) {
                $stmt->bindValue(':dept_id', $filters['department_id'], PDO::PARAM_INT);
            }
            if (isset($filters['position_id'])) {
                $stmt->bindValue(':pos_id', $filters['position_id'], PDO::PARAM_INT);
            }
            if (isset($filters['period'])) {
                $stmt->bindValue(':period', $filters['period']);
            }
            if (isset($filters['employee_id'])) {
                $stmt->bindValue(':emp_id', $filters['employee_id'], PDO::PARAM_INT);
            }

            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching performance reviews: " . $e->getMessage());
        }
    }

    /**
     * Check if review exists for employee in period
     * @param int $employeeId
     * @param string $period
     * @param int $excludeId
     * @return bool
     */
    public function existsForPeriod($employeeId, $period, $excludeId = null)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table}
                    WHERE employee_id = :emp_id AND review_period = :period";
            if ($excludeId) {
                $sql .= " AND id != :exclude_id";
            }

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':emp_id', $employeeId, PDO::PARAM_INT);
            $stmt->bindValue(':period', $period);
            if ($excludeId) {
                $stmt->bindValue(':exclude_id', $excludeId, PDO::PARAM_INT);
            }

            $stmt->execute();
            $result = $stmt->fetch();
            return $result['count'] > 0;
        } catch (PDOException $e) {
            throw new Exception("Error checking performance review: " . $e->getMessage());
        }
    }

    /**
     * Get average rating for employee
     * @param int $employeeId
     * @return float
     */
    public function getAverageRating($employeeId)
    {
        try {
            $sql = "SELECT AVG(rating) as avg_rating
                    FROM {$this->table}
                    WHERE employee_id = :emp_id";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':emp_id', $employeeId, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch();
            return $result['avg_rating'] ? round($result['avg_rating'], 2) : 0;
        } catch (PDOException $e) {
            throw new Exception("Error calculating average rating: " . $e->getMessage());
        }
    }

    /**
     * Get performance statistics by department
     * @param int $departmentId
     * @param string $period
     * @return array
     */
    public function getDepartmentStats($departmentId, $period = null)
    {
        try {
            $sql = "SELECT 
                           COUNT(*) as total_reviews,
                           AVG(pr.rating) as avg_rating,
                           MAX(pr.rating) as max_rating,
                           MIN(pr.rating) as min_rating
                    FROM {$this->table} pr
                    INNER JOIN employees e ON pr.employee_id = e.id
                    WHERE e.department_id = :dept_id";

            if ($period) {
                $sql .= " AND pr.review_period = :period";
            }

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':dept_id', $departmentId, PDO::PARAM_INT);
            if ($period) {
                $stmt->bindValue(':period', $period);
            }
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("Error getting department statistics: " . $e->getMessage());
        }
    }
}
