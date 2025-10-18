<?php
/**
 * API de Backups
 * Sistema de Recepção Terra do Bugio - Versão PHP
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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

// Verificar autenticação
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = '';
if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $token = $matches[1];
}

$authResult = $auth->verifyToken($token);
if (!$authResult['valid']) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido ou expirado']);
    exit;
}

$user = $authResult['user'];

// Verificar se é administrador
if ($user['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'Apenas administradores podem gerenciar backups']);
    exit;
}

// Diretório de backups
$backupDir = __DIR__ . '/../../backups';
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

try {
    switch ($method) {
        case 'GET':
            if (end($pathParts) === 'backups') {
                handleListBackups();
            } elseif (count($pathParts) >= 3 && $pathParts[count($pathParts)-2] === 'download') {
                $filename = end($pathParts);
                handleDownloadBackup($filename);
            } else {
                handleListBackups();
            }
            break;
            
        case 'POST':
            if (end($pathParts) === 'restore') {
                handleRestoreBackup();
            } else {
                handleCreateBackup();
            }
            break;
            
        case 'DELETE':
            $filename = end($pathParts);
            handleDeleteBackup($filename);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Erro na API de backups: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno do servidor',
        'message' => $e->getMessage()
    ]);
}

/**
 * Lista todos os backups disponíveis
 */
function handleListBackups() {
    global $backupDir;
    
    try {
        $backups = [];
        
        if (is_dir($backupDir)) {
            $files = glob($backupDir . '/*.sql');
            
            foreach ($files as $file) {
                $filename = basename($file);
                $size = filesize($file);
                $created = filemtime($file);
                
                // Determinar tipo baseado no nome do arquivo
                $tipo = 'completo';
                if (strpos($filename, 'cadastro_') === 0) {
                    $tipo = 'cadastros';
                } elseif (strpos($filename, 'frequencia_') === 0) {
                    $tipo = 'frequencias';
                }
                
                $backups[] = [
                    'nome' => $filename,
                    'tamanho' => $size,
                    'tamanho_formatado' => formatBytes($size),
                    'data_criacao' => date('Y-m-d H:i:s', $created),
                    'data_criacao_timestamp' => $created,
                    'tipo' => $tipo,
                    'pode_restaurar' => true,
                    'pode_baixar' => true,
                    'pode_excluir' => true
                ];
            }
            
            // Ordenar por data de criação (mais recente primeiro)
            usort($backups, function($a, $b) {
                return $b['data_criacao_timestamp'] - $a['data_criacao_timestamp'];
            });
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'backups' => $backups,
            'total' => count($backups),
            'diretorio' => $backupDir
        ]);
        
    } catch (Exception $e) {
        throw $e;
    }
}

/**
 * Cria um novo backup
 */
function handleCreateBackup() {
    global $backupDir;
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $tipo = $input['tipo'] ?? 'completo';
        
        // Configurações do MySQL
        $host = 'localhost';
        $username = 'root';
        $password = '';
        $database = 'recepcaotb';
        
        // Nome do arquivo baseado no tipo e timestamp
        $timestamp = date('Y-m-d_His');
        switch ($tipo) {
            case 'cadastros':
                $filename = "cadastro_backup_{$timestamp}.sql";
                $tables = ['pessoas', 'usuarios'];
                break;
            case 'frequencias':
                $filename = "frequencia_backup_{$timestamp}.sql";
                $tables = ['frequencias'];
                break;
            default:
                $filename = "recepcaotb_backup_{$timestamp}.sql";
                $tables = null; // Todas as tabelas
                break;
        }
        
        $filepath = $backupDir . '/' . $filename;
        
        // Comando mysqldump
        if ($tables) {
            $tablesStr = implode(' ', $tables);
            $command = "mysqldump -h{$host} -u{$username} --single-transaction --routines --triggers {$database} {$tablesStr} > \"{$filepath}\"";
        } else {
            $command = "mysqldump -h{$host} -u{$username} --single-transaction --routines --triggers {$database} > \"{$filepath}\"";
        }
        
        // Executar comando
        $output = [];
        $returnCode = 0;
        exec($command . ' 2>&1', $output, $returnCode);
        
        if ($returnCode !== 0) {
            throw new Exception("Erro ao criar backup: " . implode("\n", $output));
        }
        
        // Verificar se arquivo foi criado
        if (!file_exists($filepath) || filesize($filepath) === 0) {
            throw new Exception("Backup não foi criado ou está vazio");
        }
        
        $size = filesize($filepath);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Backup criado com sucesso',
            'backup' => [
                'nome' => $filename,
                'tamanho' => $size,
                'tamanho_formatado' => formatBytes($size),
                'tipo' => $tipo,
                'data_criacao' => date('Y-m-d H:i:s'),
                'caminho' => $filepath
            ]
        ]);
        
    } catch (Exception $e) {
        // Remover arquivo parcial se existir
        if (isset($filepath) && file_exists($filepath)) {
            unlink($filepath);
        }
        throw $e;
    }
}

/**
 * Restaura um backup
 */
function handleRestoreBackup() {
    global $backupDir;
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $filename = $input['arquivo'] ?? $input['filename'] ?? '';
        
        if (empty($filename)) {
            http_response_code(400);
            echo json_encode(['error' => 'Nome do arquivo é obrigatório (parâmetro: arquivo ou filename)']);
            return;
        }
        
        $filepath = $backupDir . '/' . $filename;
        
        if (!file_exists($filepath)) {
            http_response_code(404);
            echo json_encode(['error' => 'Arquivo de backup não encontrado']);
            return;
        }
        
        // Configurações do MySQL
        $host = 'localhost';
        $username = 'root';
        $password = '';
        $database = 'recepcaotb';
        
        // Comando mysql para restaurar
        $command = "mysql -h{$host} -u{$username} {$database} < \"{$filepath}\"";
        
        // Executar comando
        $output = [];
        $returnCode = 0;
        exec($command . ' 2>&1', $output, $returnCode);
        
        if ($returnCode !== 0) {
            throw new Exception("Erro ao restaurar backup: " . implode("\n", $output));
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Backup restaurado com sucesso',
            'arquivo' => $filename,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        throw $e;
    }
}

/**
 * Faz download de um backup
 */
function handleDownloadBackup($filename) {
    global $backupDir;
    
    try {
        $filepath = $backupDir . '/' . $filename;
        
        if (!file_exists($filepath)) {
            http_response_code(404);
            echo json_encode(['error' => 'Arquivo não encontrado']);
            return;
        }
        
        // Headers para download
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . filesize($filepath));
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        
        // Enviar arquivo
        readfile($filepath);
        exit;
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao baixar arquivo: ' . $e->getMessage()]);
    }
}

/**
 * Exclui um backup
 */
function handleDeleteBackup($filename) {
    global $backupDir;
    
    try {
        if (empty($filename)) {
            http_response_code(400);
            echo json_encode(['error' => 'Nome do arquivo é obrigatório']);
            return;
        }
        
        $filepath = $backupDir . '/' . $filename;
        
        if (!file_exists($filepath)) {
            http_response_code(404);
            echo json_encode(['error' => 'Arquivo não encontrado']);
            return;
        }
        
        if (!unlink($filepath)) {
            throw new Exception("Não foi possível excluir o arquivo");
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Backup excluído com sucesso',
            'arquivo' => $filename
        ]);
        
    } catch (Exception $e) {
        throw $e;
    }
}

/**
 * Formata bytes em formato legível
 */
function formatBytes($size, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
        $size /= 1024;
    }
    
    return round($size, $precision) . ' ' . $units[$i];
}
?>
