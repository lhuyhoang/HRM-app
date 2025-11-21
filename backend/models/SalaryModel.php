<?php
require_once __DIR__ . '/BaseModel.php';
class SalaryModel extends BaseModel
{
    protected $table = 'salaries';

    /**
     * Get all salaries with employee and department info
     * @param int $departmentId
     * @return array
     */
    public function getAllWithDetails($departmentId = null)
    {
        try {
            $sql = "SELECT s.*, 
                           e.full_name as employee_name,
                           e.department_id,
                           d.name as department_name,
                           p.title as position_title,
                           p.base_salary,
                           (p.base_salary + s.bonus - s.deduction) as net_salary
                    FROM {$this->table} s
                    INNER JOIN employees e ON s.employee_id = e.id
                    LEFT JOIN departments d ON e.department_id = d.id
                    LEFT JOIN positions p ON e.position_id = p.id";

            if ($departmentId) {
                $sql .= " WHERE e.department_id = :dept_id";
            }

            $sql .= " ORDER BY e.full_name ASC";

            $stmt = $this->db->prepare($sql);
            if ($departmentId) {
                $stmt->bindValue(':dept_id', $departmentId, PDO::PARAM_INT);
            }
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching salaries: " . $e->getMessage());
        }
    }

    /**
     * Get salary by employee ID
     * @param int $employeeId
     * @return array|false
     */
    public function getByEmployeeId($employeeId)
    {
        try {
            $sql = "SELECT s.*, 
                           e.full_name as employee_name,
                           p.base_salary,
                           (p.base_salary + s.bonus - s.deduction) as net_salary
                    FROM {$this->table} s
                    INNER JOIN employees e ON s.employee_id = e.id
                    LEFT JOIN positions p ON e.position_id = p.id
                    WHERE s.employee_id = :emp_id
                    LIMIT 1";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':emp_id', $employeeId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("Error fetching salary: " . $e->getMessage());
        }
    }

    /**
     * Update or create salary for employee
     * @param int $employeeId
     * @param array $data
     * @return bool
     */
    public function updateOrCreate($employeeId, $data)
    {
        try {
            $existing = $this->getByEmployeeId($employeeId);

            $data['employee_id'] = $employeeId;
            $data['updated_at'] = date('Y-m-d H:i:s');

            if ($existing) {
                return $this->update($existing['id'], $data);
            } else {
                $data['created_at'] = date('Y-m-d H:i:s');
                $this->create($data);
                return true;
            }
        } catch (PDOException $e) {
            throw new Exception("Error updating salary: " . $e->getMessage());
        }
    }

    /**
     * Calculate total payroll
     * @param int $departmentId
     * @return array
     */
    public function calculateTotalPayroll($departmentId = null)
    {
        try {
            $sql = "SELECT 
                           COUNT(DISTINCT s.employee_id) as employee_count,
                           SUM(p.base_salary) as total_base_salary,
                           SUM(s.bonus) as total_bonus,
                           SUM(s.deduction) as total_deduction,
                           SUM(p.base_salary + s.bonus - s.deduction) as total_net_salary
                    FROM {$this->table} s
                    INNER JOIN employees e ON s.employee_id = e.id
                    LEFT JOIN positions p ON e.position_id = p.id";

            if ($departmentId) {
                $sql .= " WHERE e.department_id = :dept_id";
            }

            $stmt = $this->db->prepare($sql);
            if ($departmentId) {
                $stmt->bindValue(':dept_id', $departmentId, PDO::PARAM_INT);
            }
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("Error calculating payroll: " . $e->getMessage());
        }
    }
}
