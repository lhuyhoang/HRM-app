<?php
abstract class BaseModel
{
    protected $db;
    protected $table;
    protected $primaryKey = 'id';

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get all records
     * @param array $conditions Optional where conditions
     * @param string $orderBy Optional order by clause
     * @return array
     */
    public function getAll($conditions = [], $orderBy = null)
    {
        try {
            $sql = "SELECT * FROM {$this->table}";

            if (!empty($conditions)) {
                $whereClauses = [];
                foreach ($conditions as $key => $value) {
                    $whereClauses[] = "$key = :$key";
                }
                $sql .= " WHERE " . implode(" AND ", $whereClauses);
            }

            if ($orderBy) {
                $sql .= " ORDER BY $orderBy";
            }

            $stmt = $this->db->prepare($sql);

            if (!empty($conditions)) {
                foreach ($conditions as $key => $value) {
                    $stmt->bindValue(":$key", $value);
                }
            }

            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error fetching records: " . $e->getMessage());
        }
    }

    /**
     * Get record by ID
     * @param int $id
     * @return array|false
     */
    public function getById($id)
    {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = :id LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("Error fetching record: " . $e->getMessage());
        }
    }

    /**
     * Create new record
     * @param array $data
     * @return int Last insert ID
     */
    public function create($data)
    {
        try {
            $columns = array_keys($data);
            $placeholders = array_map(function ($col) {
                return ":$col"; }, $columns);

            $sql = "INSERT INTO {$this->table} (" . implode(", ", $columns) . ") 
                    VALUES (" . implode(", ", $placeholders) . ")";

            $stmt = $this->db->prepare($sql);

            foreach ($data as $key => $value) {
                $stmt->bindValue(":$key", $value);
            }

            $stmt->execute();
            return $this->db->lastInsertId();
        } catch (PDOException $e) {
            throw new Exception("Error creating record: " . $e->getMessage());
        }
    }

    /**
     * Update record by ID
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update($id, $data)
    {
        try {
            $setClauses = [];
            foreach ($data as $key => $value) {
                $setClauses[] = "$key = :$key";
            }

            $sql = "UPDATE {$this->table} SET " . implode(", ", $setClauses) .
                " WHERE {$this->primaryKey} = :id";

            $stmt = $this->db->prepare($sql);

            foreach ($data as $key => $value) {
                $stmt->bindValue(":$key", $value);
            }
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error updating record: " . $e->getMessage());
        }
    }

    /**
     * Delete record by ID
     * @param int $id
     * @return bool
     */
    public function delete($id)
    {
        try {
            $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error deleting record: " . $e->getMessage());
        }
    }

    /**
     * Count records
     * @param array $conditions Optional where conditions
     * @return int
     */
    public function count($conditions = [])
    {
        try {
            $sql = "SELECT COUNT(*) as total FROM {$this->table}";

            if (!empty($conditions)) {
                $whereClauses = [];
                foreach ($conditions as $key => $value) {
                    $whereClauses[] = "$key = :$key";
                }
                $sql .= " WHERE " . implode(" AND ", $whereClauses);
            }

            $stmt = $this->db->prepare($sql);

            if (!empty($conditions)) {
                foreach ($conditions as $key => $value) {
                    $stmt->bindValue(":$key", $value);
                }
            }

            $stmt->execute();
            $result = $stmt->fetch();
            return (int) $result['total'];
        } catch (PDOException $e) {
            throw new Exception("Error counting records: " . $e->getMessage());
        }
    }

    /**
     * Execute custom query
     * @param string $sql
     * @param array $params
     * @return array
     */
    protected function query($sql, $params = [])
    {
        try {
            $stmt = $this->db->prepare($sql);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Error executing query: " . $e->getMessage());
        }
    }
}
