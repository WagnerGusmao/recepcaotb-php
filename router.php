<?php
/**
 * Roteador para o servidor PHP embutido
 * Sistema de Recepção Terra do Bugio - Versão PHP
 */

// Verificar se é uma requisição para API
$requestUri = $_SERVER['REQUEST_URI'];

// Remover query string da URI
$requestUri = strtok($requestUri, '?');

// Se for uma requisição para API, redirecionar para o diretório PHP
if (strpos($requestUri, '/api/') !== false) {
    // Extrair apenas a parte da API da URI
    $apiPath = $requestUri;
    
    if (strpos($apiPath, '/api/auth') !== false || strpos($apiPath, '/api/login') !== false || strpos($apiPath, '/api/logout') !== false || strpos($apiPath, '/api/me') !== false) {
        require_once __DIR__ . '/php/api/auth.php';
        exit;
    } elseif (strpos($apiPath, '/api/pessoas') !== false) {
        require_once __DIR__ . '/php/api/pessoas.php';
        exit;
    } elseif (strpos($apiPath, '/api/frequencias') !== false) {
        require_once __DIR__ . '/php/api/frequencias.php';
        exit;
    } elseif (strpos($apiPath, '/api/usuarios') !== false) {
        require_once __DIR__ . '/php/api/usuarios.php';
        exit;
    } elseif (strpos($apiPath, '/api/duplicatas') !== false) {
        require_once __DIR__ . '/php/api/duplicatas.php';
        exit;
    } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'API endpoint não encontrado']);
        exit;
    }
}

// Para arquivos estáticos (CSS, JS, imagens, etc.), deixar o servidor PHP servir diretamente
if (file_exists(__DIR__ . $requestUri)) {
    return false; // Deixa o servidor PHP servir o arquivo
}

// Para outros arquivos, usar o comportamento padrão do servidor PHP
return false;
?>
