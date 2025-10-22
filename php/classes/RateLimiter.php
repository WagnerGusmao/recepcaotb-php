<?php
/**
 * RateLimiter - Controle de Taxa de Requisições
 * 
 * Implementa proteção contra ataques de força bruta limitando
 * o número de tentativas em um período de tempo.
 * 
 * Uso:
 * ```php
 * $limiter = new RateLimiter(5, 15); // 5 tentativas em 15 minutos
 * if ($limiter->tooManyAttempts('login:192.168.1.1:user@email.com')) {
 *     // Bloqueado
 * }
 * $limiter->hit('login:192.168.1.1:user@email.com');
 * ```
 */

require_once __DIR__ . '/../config/database.php';

class RateLimiter {
    private $db;
    private $maxAttempts;
    private $decayMinutes;
    
    /**
     * Constructor
     * 
     * @param int $maxAttempts Número máximo de tentativas permitidas
     * @param int $decayMinutes Tempo em minutos para resetar o contador
     */
    public function __construct($maxAttempts = 5, $decayMinutes = 15) {
        $this->db = db()->connect();
        $this->maxAttempts = $maxAttempts;
        $this->decayMinutes = $decayMinutes;
    }
    
    /**
     * Verifica se excedeu o número de tentativas permitidas
     * 
     * @param string $key Chave única para identificar a tentativa (ex: 'login:IP:email')
     * @return bool True se excedeu, false caso contrário
     */
    public function tooManyAttempts($key) {
        // Limpar registros expirados primeiro
        $this->clearExpired();
        
        $stmt = $this->db->prepare(
            "SELECT attempts FROM rate_limits 
             WHERE key_name = ? AND expires_at > NOW()"
        );
        $stmt->execute([$key]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            return false;
        }
        
        return $result['attempts'] >= $this->maxAttempts;
    }
    
    /**
     * Registra uma nova tentativa
     * 
     * @param string $key Chave única para identificar a tentativa
     * @return int Número total de tentativas
     */
    public function hit($key) {
        $expiresAt = date('Y-m-d H:i:s', time() + ($this->decayMinutes * 60));
        
        $stmt = $this->db->prepare(
            "INSERT INTO rate_limits (key_name, attempts, expires_at) 
             VALUES (?, 1, ?)
             ON DUPLICATE KEY UPDATE 
                attempts = attempts + 1,
                expires_at = IF(expires_at < NOW(), ?, expires_at)"
        );
        $stmt->execute([$key, $expiresAt, $expiresAt]);
        
        // Retornar número atual de tentativas
        return $this->getAttempts($key);
    }
    
    /**
     * Limpa o contador de tentativas para uma chave específica
     * 
     * @param string $key Chave única
     * @return bool True se removeu com sucesso
     */
    public function clear($key) {
        $stmt = $this->db->prepare("DELETE FROM rate_limits WHERE key_name = ?");
        return $stmt->execute([$key]);
    }
    
    /**
     * Obtém o número de tentativas para uma chave
     * 
     * @param string $key Chave única
     * @return int Número de tentativas
     */
    public function getAttempts($key) {
        $stmt = $this->db->prepare(
            "SELECT attempts FROM rate_limits 
             WHERE key_name = ? AND expires_at > NOW()"
        );
        $stmt->execute([$key]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ? (int)$result['attempts'] : 0;
    }
    
    /**
     * Obtém tempo restante em segundos até nova tentativa ser permitida
     * 
     * @param string $key Chave única
     * @return int Segundos restantes (0 se pode tentar agora)
     */
    public function availableIn($key) {
        $stmt = $this->db->prepare(
            "SELECT TIMESTAMPDIFF(SECOND, NOW(), expires_at) as seconds
             FROM rate_limits 
             WHERE key_name = ? AND expires_at > NOW()"
        );
        $stmt->execute([$key]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ? max(0, (int)$result['seconds']) : 0;
    }
    
    /**
     * Limpa todos os registros expirados do banco
     * Executado automaticamente ao verificar tentativas
     * 
     * @return int Número de registros removidos
     */
    private function clearExpired() {
        $stmt = $this->db->prepare("DELETE FROM rate_limits WHERE expires_at < NOW()");
        $stmt->execute();
        return $stmt->rowCount();
    }
    
    /**
     * Reseta todas as tentativas (usar com cuidado - apenas para manutenção)
     * 
     * @return bool True se resetou com sucesso
     */
    public function resetAll() {
        $stmt = $this->db->prepare("TRUNCATE TABLE rate_limits");
        return $stmt->execute();
    }
    
    /**
     * Obtém tentativas restantes para uma chave
     * 
     * @param string $key Chave única
     * @return int Número de tentativas restantes
     */
    public function retriesLeft($key) {
        $attempts = $this->getAttempts($key);
        return max(0, $this->maxAttempts - $attempts);
    }
    
    /**
     * Obtém IP do cliente considerando proxies
     * 
     * @return string Endereço IP do cliente
     */
    public static function getClientIP() {
        // Verificar se está atrás de um proxy
        $ipKeys = [
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR'
        ];
        
        foreach ($ipKeys as $key) {
            if (isset($_SERVER[$key])) {
                // X-Forwarded-For pode conter múltiplos IPs separados por vírgula
                $ips = explode(',', $_SERVER[$key]);
                $ip = trim($ips[0]);
                
                // Validar IP
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}
