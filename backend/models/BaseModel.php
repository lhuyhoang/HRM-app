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

    public function getAll(array $conditions = [], ?string $orderBy = null): array
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

    public function getById($id): mixed
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

    public function create(array $data): string
    {
        try {
            $columns = array_keys($data);
            $placeholders = array_map(function ($col) {
                return ":$col";
            }, $columns);

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

    public function update($id, array $data): bool
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

    public function delete($id): bool
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

    public function count(array $conditions = []): int
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

    protected function query(string $sql, array $params = []): array
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
