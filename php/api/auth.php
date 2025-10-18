<?php
/**
 * API de Autenticação
 * Sistema de Recepção Terra do Bugio - Versão PHP
 */

// Configurar timezone
require_once __DIR__ . '/../config/timezone.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Tratar requisições OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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
