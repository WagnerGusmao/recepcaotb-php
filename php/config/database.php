<?php
/**
 * Configuração do Banco de Dados
 * Sistema de Recepção Terra do Bugio - Versão PHP
 */

class Database {
    private $host;
    private $dbname;
    private $username;
    private $password;
    private $charset;
    private $pdo;
    
    public function __construct() {
        // Configurar timezone do PHP para São Paulo
        date_default_timezone_set('America/Sao_Paulo');
        
        // Configuração direta para teste (sem .env)
        $this->host = 'localhost';
        $this->dbname = 'recepcaotb';
        $this->username = 'root';
        $this->password = ''; // Sem senha (padrão XAMPP)
        $this->charset = 'utf8mb4';
    }
    
    /**
     * Carrega variáveis de ambiente do arquivo .env
     */
    private function loadEnv() {
        $envFile = __DIR__ . '/../../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                    list($key, $value) = explode('=', $line, 2);
                    $_ENV[trim($key)] = trim($value);
                }
            }
        }
    }
    
    /**
     * Conecta ao banco de dados
     */
    public function connect() {
        if ($this->pdo === null) {
            try {
                $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset}",
                    PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true
                ];
                
                $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
                
                // Configurar timezone
                $this->pdo->exec("SET time_zone = '-03:00'");
                
            } catch (PDOException $e) {
                error_log("Erro de conexão com o banco de dados: " . $e->getMessage());
                throw new Exception("Falha na conexão com o banco de dados");
            }
        }
        
        return $this->pdo;
    }
    
    /**
     * Executa uma query preparada
     */
    public function query($sql, $params = []) {
        try {
            $pdo = $this->connect();
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Erro na query: " . $e->getMessage() . " | SQL: " . $sql);
            throw new Exception("Erro na execução da query");
        }
    }
    
    /**
     * Busca um único registro
     */
    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }
    
    /**
     * Busca múltiplos registros
     */
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }
    
    /**
     * Executa uma query de inserção e retorna o último ID
     */
    public function insert($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $this->connect()->lastInsertId();
    }
    
    /**
     * Executa uma query de atualização/exclusão e retorna o número de linhas afetadas
     */
    public function execute($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }
    
    /**
     * Inicia uma transação
     */
    public function beginTransaction() {
        return $this->connect()->beginTransaction();
    }
    
    /**
     * Confirma uma transação
     */
    public function commit() {
        return $this->connect()->commit();
    }
    
    /**
     * Desfaz uma transação
     */
    public function rollback() {
        return $this->connect()->rollback();
    }
    
    /**
     * Testa a conexão com o banco
     */
    public function testConnection() {
        try {
            $this->connect();
            $this->query("SELECT 1");
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}

// Instância global do banco de dados
$database = new Database();

// Função helper para acessar o banco
function db() {
    global $database;
    return $database;
}
