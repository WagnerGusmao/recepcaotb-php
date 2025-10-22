<?php
/**
 * API de Autenticação
 * Sistema de Recepção Terra do Bugio - Versão PHP
 */

// Iniciar buffer de saída para capturar qualquer output indesejado
ob_start();

// Configurar exibição de erros para ambiente de produção
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Configurar timezone
require_once __DIR__ . '/../config/timezone.php';

// Configurar CORS com política restritiva
require_once __DIR__ . '/../config/cors.php';
CorsHandler::handle();

// Limpar qualquer output anterior e definir header
ob_clean();
header('Content-Type: application/json');

require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../config/database.php';

$auth = new Auth();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

try {
    switch ($method) {
        case 'POST':
            if (end($pathParts) === 'login') {
                handleLogin($auth);
            } elseif (end($pathParts) === 'logout') {
                handleLogout($auth);
            } else {
                // POST direto para /auth assume login
                handleLogin($auth);
            }
            break;
            
        case 'GET':
            if (end($pathParts) === 'me') {
                handleMe($auth);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint não encontrado']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Erro na API de autenticação: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno do servidor',
        'code' => 'INTERNAL_SERVER_ERROR'
    ]);
}

/**
 * Manipula login
 */
function handleLogin($auth) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Dados inválidos',
            'code' => 'INVALID_INPUT'
        ]);
        return;
    }
    
    $email = $input['email'] ?? '';
    $senha = $input['password'] ?? $input['senha'] ?? '';
    
    $result = $auth->login($email, $senha);
    
    if ($result['success']) {
        http_response_code(200);
        echo json_encode($result);
    } else {
        http_response_code(401);
        echo json_encode($result);
    }
}

/**
 * Manipula logout
 */
function handleLogout($auth) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Token não fornecido',
            'code' => 'TOKEN_NOT_PROVIDED'
        ]);
        return;
    }
    
    $token = substr($authHeader, 7);
    $result = $auth->logout($token);
    
    if ($result['success']) {
        http_response_code(200);
        echo json_encode($result);
    } else {
        http_response_code(500);
        echo json_encode($result);
    }
}

/**
 * Manipula informações do usuário atual
 */
function handleMe($auth) {
    $user = $auth->requireAuth();
    
    http_response_code(200);
    echo json_encode([
        'user' => [
            'id' => $user['id'],
            'nome' => $user['nome'],
            'email' => $user['email'],
            'tipo' => $user['tipo'],
            'exp' => $user['exp']
        ],
        'permissions' => $auth->getPermissionsForUserType($user['tipo'])
    ]);
}

// Garantir que apenas o JSON seja enviado (flush do buffer)
ob_end_flush();
