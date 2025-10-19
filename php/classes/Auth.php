<?php
/**
 * Classe de Autenticação
 * Sistema de Recepção Terra do Bugio - Versão PHP
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth {
    private $db;
    private $jwtSecret;
    private $tokenExpiration;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->jwtSecret = $_ENV['JWT_SECRET'] ?? 'sua_chave_secreta_muito_segura';
        $this->tokenExpiration = $_ENV['JWT_EXPIRATION'] ?? '24h';
    }
    
    /**
     * Realiza o login do usuário
     */
    public function login($email, $senha) {
        try {
            // Validação básica
            if (empty($email) || empty($senha)) {
                return [
                    'success' => false,
                    'error' => 'Email e senha são obrigatórios',
                    'code' => 'MISSING_CREDENTIALS'
                ];
            }
            
            // Buscar usuário no banco
            $stmt = $this->db->prepare("SELECT * FROM usuarios WHERE email = ? AND ativo = 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'Credenciais inválidas',
                    'code' => 'INVALID_CREDENTIALS'
                ];
            }
            
            // Verificar senha
            if (!password_verify($senha, $user['senha'])) {
                return [
                    'success' => false,
                    'error' => 'Credenciais inválidas',
                    'code' => 'INVALID_CREDENTIALS'
                ];
            }
            
            // Gerar token JWT
            $payload = [
                'userId' => $user['id'],
                'email' => $user['email'],
                'type' => $user['tipo'],
                'iat' => time(),
                'exp' => time() + (24 * 60 * 60) // 24 horas
            ];
            
            $token = JWT::encode($payload, $this->jwtSecret, 'HS256');
            
            // Calcular data de expiração
            $expiresAt = date('Y-m-d H:i:s', time() + (24 * 60 * 60));
            
            // Criar sessão no banco
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            $ipAddress = $this->getClientIP();
            $sessionId = uniqid('sess_', true);
            
            $stmt = $this->db->prepare("INSERT INTO sessoes (session_id, usuario_id, token, expires_at, user_agent, ip_address, created_at) 
                                       VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$sessionId, $user['id'], $token, $expiresAt, $userAgent, $ipAddress]);
            
            return [
                'success' => true,
                'token' => $token,
                'expiresAt' => $expiresAt,
                'user' => [
                    'id' => $user['id'],
                    'nome' => $user['nome'],
                    'email' => $user['email'],
                    'tipo' => $user['tipo'],
                    'deve_trocar_senha' => $user['deve_trocar_senha'] ?? 0
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Erro no login: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Erro interno do servidor',
                'code' => 'INTERNAL_ERROR'
            ];
        }
    }
    
    /**
     * Realiza o logout do usuário
     */
    public function logout($token) {
        try {
            if (empty($token)) {
                return [
                    'success' => false,
                    'error' => 'Token não fornecido',
                    'code' => 'TOKEN_NOT_PROVIDED'
                ];
            }
            
            // Remover sessão do banco
            $stmt = $this->db->prepare("DELETE FROM sessoes WHERE token = ?");
            $stmt->execute([$token]);
            
            return [
                'success' => true,
                'message' => 'Logout realizado com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log("Erro no logout: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Erro interno do servidor',
                'code' => 'LOGOUT_ERROR'
            ];
        }
    }
    
    /**
     * Verifica se o token é válido
     */
    public function verifyToken($token) {
        try {
            if (empty($token)) {
                return [
                    'valid' => false,
                    'error' => 'Token não fornecido',
                    'code' => 'TOKEN_NOT_PROVIDED'
                ];
            }
            
            // Verificar token JWT
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            
            // Verificar se a sessão ainda é válida no banco
            $stmt = $this->db->prepare("SELECT u.*, s.expires_at 
                                       FROM usuarios u 
                                       INNER JOIN sessoes s ON u.id = s.usuario_id 
                                       WHERE s.token = ? AND s.expires_at > NOW()");
            $stmt->execute([$token]);
            $sessionData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$sessionData) {
                return [
                    'valid' => false,
                    'error' => 'Sessão expirada ou inválida',
                    'code' => 'INVALID_OR_EXPIRED_SESSION'
                ];
            }
            
            // Atualizar expiração da sessão (sliding expiration)
            $newExpiration = date('Y-m-d H:i:s', time() + (24 * 60 * 60));
            $stmt = $this->db->prepare("UPDATE sessoes SET expires_at = ? WHERE token = ?");
            $stmt->execute([$newExpiration, $token]);
            
            return [
                'valid' => true,
                'user' => [
                    'id' => $sessionData['id'],
                    'nome' => $sessionData['nome'],
                    'email' => $sessionData['email'],
                    'tipo' => $sessionData['tipo'],
                    'senha' => $sessionData['senha'],
                    'deve_trocar_senha' => $sessionData['deve_trocar_senha'],
                    'exp' => $decoded->exp
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Erro na verificação do token: " . $e->getMessage());
            
            if (strpos($e->getMessage(), 'Expired token') !== false) {
                return [
                    'valid' => false,
                    'error' => 'Sessão expirada',
                    'code' => 'TOKEN_EXPIRED'
                ];
            }
            
            return [
                'valid' => false,
                'error' => 'Token inválido',
                'code' => 'INVALID_TOKEN'
            ];
        }
    }
    
    /**
     * Função compatível para obter headers (CLI e servidor web)
     */
    private function getAllHeaders() {
        if (function_exists('getallheaders')) {
            return getallheaders();
        }
        
        // Fallback para CLI e servidores que não suportam getallheaders()
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headerName = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
                $headers[$headerName] = $value;
            }
        }
        return $headers;
    }
    
    /**
     * Middleware de autenticação
     */
    public function requireAuth() {
        // Função compatível com CLI e servidor web
        $headers = $this->getAllHeaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            http_response_code(401);
            echo json_encode([
                'error' => 'Token de autenticação não fornecido',
                'code' => 'AUTH_TOKEN_MISSING'
            ]);
            exit;
        }
        
        $token = substr($authHeader, 7);
        $verification = $this->verifyToken($token);
        
        if (!$verification['valid']) {
            http_response_code(401);
            echo json_encode([
                'error' => $verification['error'],
                'code' => $verification['code']
            ]);
            exit;
        }
        
        return $verification['user'];
    }
    
    /**
     * Middleware de autorização por tipo
     */
    public function requireRole($allowedRoles, $user) {
        if (!in_array($user['tipo'], $allowedRoles)) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Acesso negado',
                'code' => 'ACCESS_DENIED'
            ]);
            exit;
        }
    }
    
    /**
     * Gera hash da senha
     */
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
    }
    
    /**
     * Valida força da senha
     */
    public function validatePasswordStrength($password) {
        if (strlen($password) < 8) {
            return [
                'valid' => false,
                'message' => 'A senha deve ter pelo menos 8 caracteres'
            ];
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            return [
                'valid' => false,
                'message' => 'A senha deve conter pelo menos uma letra maiúscula'
            ];
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            return [
                'valid' => false,
                'message' => 'A senha deve conter pelo menos uma letra minúscula'
            ];
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            return [
                'valid' => false,
                'message' => 'A senha deve conter pelo menos um número'
            ];
        }
        
        if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
            return [
                'valid' => false,
                'message' => 'A senha deve conter pelo menos um caractere especial'
            ];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Obtém o IP do cliente
     */
    private function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ips = explode(',', $_SERVER[$key]);
                return trim($ips[0]);
            }
        }
        
        return 'unknown';
    }
    
    /**
     * Obtém o usuário atual baseado no token JWT
     */
    public function getCurrentUser() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }
        
        $token = $matches[1];
        
        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            
            // Verificar se o token não expirou
            if ($decoded->exp < time()) {
                return null;
            }
            
            // Buscar dados atualizados do usuário
            $stmt = $this->db->prepare("SELECT * FROM usuarios WHERE id = ? AND ativo = 1");
            $stmt->execute([$decoded->userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return null;
            }
            
            return [
                'id' => $user['id'],
                'nome' => $user['nome'],
                'email' => $user['email'],
                'tipo' => $user['tipo'],
                'exp' => $decoded->exp
            ];
            
        } catch (Exception $e) {
            return null;
        }
    }
    
    /**
     * Obtém permissões para o tipo de usuário
     */
    public function getPermissionsForUserType($userType) {
        $permissions = [
            'administrador' => [
                'canManageUsers' => true,
                'canManageContent' => true,
                'canViewAuditLogs' => true,
                'canExportData' => true
            ],
            'lider' => [
                'canManageUsers' => false,
                'canManageContent' => true,
                'canViewAuditLogs' => false,
                'canExportData' => true
            ],
            'geral' => [
                'canManageUsers' => false,
                'canManageContent' => false,
                'canViewAuditLogs' => false,
                'canExportData' => false
            ]
        ];
        
        return $permissions[$userType] ?? $permissions['geral'];
    }
}
