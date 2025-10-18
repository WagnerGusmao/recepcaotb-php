<?php
/**
 * Arquivo principal do sistema PHP
 * Sistema de Recepção Terra do Bugio - Versão PHP
 */

// Configurações básicas
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php_errors.log');

// Criar diretório de logs se não existir
if (!is_dir(__DIR__ . '/logs')) {
    mkdir(__DIR__ . '/logs', 0755, true);
}

// Headers de segurança
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Verificar se é uma requisição para API
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

// Remover query string da URI
$requestUri = strtok($requestUri, '?');

// Debug: Log das variáveis principais
// error_log("DEBUG - REQUEST_URI: $requestUri");
// error_log("DEBUG - SCRIPT_NAME: $scriptName");

// Se for uma requisição para API, redirecionar
if (strpos($requestUri, '/api/') !== false) {
    // Extrair apenas a parte da API da URI
    $apiPath = $requestUri;
    
    if (strpos($apiPath, '/api/auth') !== false || strpos($apiPath, '/api/login') !== false || strpos($apiPath, '/api/logout') !== false || strpos($apiPath, '/api/me') !== false) {
        require_once __DIR__ . '/api/auth.php';
        exit;
    } elseif (strpos($apiPath, '/api/pessoas') !== false) {
        require_once __DIR__ . '/api/pessoas.php';
        exit;
    } elseif (strpos($apiPath, '/api/frequencias') !== false) {
        require_once __DIR__ . '/api/frequencias.php';
        exit;
    } elseif (strpos($apiPath, '/api/usuarios') !== false) {
        require_once __DIR__ . '/api/usuarios.php';
        exit;
    } elseif (strpos($apiPath, '/api/duplicatas') !== false) {
        require_once __DIR__ . '/api/duplicatas.php';
        exit;
    } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'API endpoint não encontrado']);
        exit;
    }
}

// Para requisições não-API, servir o arquivo HTML correspondente
$htmlFile = '';

if ($requestUri === '/' || $requestUri === '/index.html') {
    $htmlFile = '../index.html';
} elseif (strpos($requestUri, '/login.html') !== false) {
    $htmlFile = '../login.html';
} elseif (strpos($requestUri, '/painel-simples.html') !== false) {
    $htmlFile = '../painel-simples.html';
} elseif (strpos($requestUri, '/trocar-senha.html') !== false) {
    $htmlFile = '../trocar-senha.html';
} else {
    // Verificar se é um arquivo estático (CSS, JS, etc.)
    $cleanUri = ltrim($requestUri, '/');
    $filePath = '../' . $cleanUri;
    
    // Debug: Log da requisição
    error_log("Requisição estática: $requestUri -> $filePath (cleanUri: $cleanUri)");
    error_log("Arquivo existe: " . (file_exists($filePath) ? 'SIM' : 'NÃO'));
    error_log("Caminho absoluto: " . realpath($filePath));
    
    if (file_exists($filePath) && is_file($filePath)) {
        // Determinar tipo MIME baseado na extensão
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'html' => 'text/html',
            'htm' => 'text/html',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'pdf' => 'application/pdf',
            'json' => 'application/json',
            'xml' => 'application/xml',
            'txt' => 'text/plain'
        ];
        
        $mimeType = isset($mimeTypes[$extension]) ? $mimeTypes[$extension] : 'application/octet-stream';
        
        header('Content-Type: ' . $mimeType);
        header('Cache-Control: public, max-age=3600'); // Cache por 1 hora
        readfile($filePath);
        exit;
    } else {
        // Arquivo não encontrado, servir index.html como fallback
        $htmlFile = '../index.html';
    }
}

// Servir arquivo HTML
if ($htmlFile && file_exists($htmlFile)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($htmlFile);
} else {
    http_response_code(404);
    echo '<!DOCTYPE html>
<html>
<head>
    <title>Página não encontrada</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>404 - Página não encontrada</h1>
    <p>A página solicitada não foi encontrada.</p>
    <a href="/">Voltar ao início</a>
</body>
</html>';
}
?>
