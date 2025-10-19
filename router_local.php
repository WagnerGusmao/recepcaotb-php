<?php
/**
 * Roteador para Desenvolvimento Local
 * Simula o comportamento do .htaccess para o servidor PHP embutido
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Log da requisição para debug
error_log("Router Local: $method $uri");

// Roteamento para APIs
if (preg_match('/^\/api\/(.+)/', $uri, $matches)) {
    $apiEndpoint = $matches[1];
    
    // Remover parâmetros extras da URL
    $apiEndpoint = explode('/', $apiEndpoint)[0];
    
    $apiFile = __DIR__ . "/php/api/{$apiEndpoint}.php";
    
    if (file_exists($apiFile)) {
        // Definir variáveis de ambiente para simular o roteamento
        $_SERVER['SCRIPT_NAME'] = "/php/api/{$apiEndpoint}.php";
        $_SERVER['SCRIPT_FILENAME'] = $apiFile;
        
        require $apiFile;
        exit;
    } else {
        http_response_code(404);
        echo json_encode(['error' => "API endpoint não encontrado: $apiEndpoint"]);
        exit;
    }
}

// Servir arquivos estáticos
if (file_exists(__DIR__ . $uri) && !is_dir(__DIR__ . $uri)) {
    return false; // Deixa o servidor PHP embutido servir o arquivo
}

// Redirecionar para index.html se for a raiz
if ($uri === '/' || $uri === '') {
    $uri = '/index.html';
}

// Verificar se o arquivo existe
$file = __DIR__ . $uri;
if (file_exists($file) && !is_dir($file)) {
    return false; // Deixa o servidor PHP embutido servir o arquivo
}

// 404 para arquivos não encontrados
http_response_code(404);
echo "<h1>404 - Arquivo não encontrado</h1>";
echo "<p>URI: $uri</p>";
echo "<p>Arquivo procurado: $file</p>";
?>
