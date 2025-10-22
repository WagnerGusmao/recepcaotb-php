<?php
/**
 * API para gerenciamento de frequência de voluntários
 * Sistema Terra do Bugio
 * 
 * Acesso restrito: Apenas administradores e líderes
 */

// Iniciar buffer de saída para capturar qualquer output indesejado
ob_start();

// Configurar exibição de erros para ambiente de produção
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Configurar timezone
require_once __DIR__ . '/../config/timezone.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/Auth.php';

// Configurar CORS com política restritiva
require_once __DIR__ . '/../config/cors.php';
CorsHandler::handle();

// Limpar qualquer output anterior e definir header
ob_clean();
header('Content-Type: application/json; charset=utf-8');

// Verificar autenticação
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido ou expirado']);
    exit;
}

// Verificar permissões - apenas administradores e líderes
// Aceitar tanto 'admin' quanto 'administrador' por compatibilidade
if (!in_array($user['tipo'], ['admin', 'administrador', 'lider'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado. Apenas administradores e líderes podem lançar frequência de voluntários.']);
    exit;
}

// Locais de trabalho permitidos
const LOCAIS_TRABALHO = [
    'Recepção',
    'Café', 
    'Brechó',
    'Memorial',
    'Hospital',
    'Pet',
    'Espaço Criança',
    'Acolhimento',
    'Segurança'
];

try {
    $db = new Database();
    $pdo = $db->connect();
    
    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_SERVER['REQUEST_URI'];
    
    // Extrair ID da URL se presente
    $pathParts = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));
    $id = null;
    if (end($pathParts) && is_numeric(end($pathParts))) {
        $id = (int)end($pathParts);
    }
    
    switch ($method) {
        case 'GET':
            if ($id) {
                // Buscar frequência específica
                getFrequencia($pdo, $id);
            } else {
                // Listar frequências
                listFrequencias($pdo);
            }
            break;
            
        case 'POST':
            // Criar nova frequência
            createFrequencia($pdo, $user['id']);
            break;
            
        case 'PUT':
            if ($id) {
                // Atualizar frequência
                updateFrequencia($pdo, $id, $user['id']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID da frequência é obrigatório para atualização']);
            }
            break;
            
        case 'DELETE':
            if ($id) {
                // Excluir frequência
                deleteFrequencia($pdo, $id);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID da frequência é obrigatório para exclusão']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
            break;
    }
    
} catch (Exception $e) {
    error_log("Erro na API de frequência de voluntários: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno do servidor']);
}

/**
 * Listar frequências com filtros opcionais
 */
function listFrequencias($pdo) {
    $voluntarioId = $_GET['voluntario_id'] ?? '';
    $dataInicio = $_GET['data_inicio'] ?? '';
    $dataFim = $_GET['data_fim'] ?? '';
    $localInicio = $_GET['local_inicio'] ?? '';
    $limit = (int)($_GET['limit'] ?? 50);
    $offset = (int)($_GET['offset'] ?? 0);
    
    $sql = "
        SELECT 
            fv.*,
            v.nome as voluntario_nome,
            v.cpf as voluntario_cpf,
            v.email as voluntario_email,
            u.nome as lancado_por_nome
        FROM frequencia_voluntarios fv
        INNER JOIN voluntarios v ON fv.voluntario_id = v.id
        INNER JOIN usuarios u ON fv.lancado_por = u.id
        WHERE 1=1
    ";
    $params = [];
    
    if ($voluntarioId) {
        $sql .= " AND fv.voluntario_id = ?";
        $params[] = $voluntarioId;
    }
    
    if ($dataInicio) {
        $sql .= " AND fv.data_trabalho >= ?";
        $params[] = $dataInicio;
    }
    
    if ($dataFim) {
        $sql .= " AND fv.data_trabalho <= ?";
        $params[] = $dataFim;
    }
    
    if ($localInicio) {
        $sql .= " AND fv.local_inicio = ?";
        $params[] = $localInicio;
    }
    
    $sql .= " ORDER BY fv.data_trabalho DESC, fv.hora_inicio DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $frequencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Contar total para paginação
    $countSql = "
        SELECT COUNT(*) as total 
        FROM frequencia_voluntarios fv
        INNER JOIN voluntarios v ON fv.voluntario_id = v.id
        WHERE 1=1
    ";
    $countParams = [];
    
    if ($voluntarioId) {
        $countSql .= " AND fv.voluntario_id = ?";
        $countParams[] = $voluntarioId;
    }
    
    if ($dataInicio) {
        $countSql .= " AND fv.data_trabalho >= ?";
        $countParams[] = $dataInicio;
    }
    
    if ($dataFim) {
        $countSql .= " AND fv.data_trabalho <= ?";
        $countParams[] = $dataFim;
    }
    
    if ($localInicio) {
        $countSql .= " AND fv.local_inicio = ?";
        $countParams[] = $localInicio;
    }
    
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($countParams);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    http_response_code(200);
    echo json_encode([
        'frequencias' => $frequencias,
        'total' => (int)$total,
        'limit' => $limit,
        'offset' => $offset,
        'locais_trabalho' => LOCAIS_TRABALHO
    ]);
}

/**
 * Buscar frequência específica
 */
function getFrequencia($pdo, $id) {
    $stmt = $pdo->prepare("
        SELECT 
            fv.*,
            v.nome as voluntario_nome,
            v.cpf as voluntario_cpf,
            v.email as voluntario_email,
            u.nome as lancado_por_nome
        FROM frequencia_voluntarios fv
        INNER JOIN voluntarios v ON fv.voluntario_id = v.id
        INNER JOIN usuarios u ON fv.lancado_por = u.id
        WHERE fv.id = ?
    ");
    $stmt->execute([$id]);
    $frequencia = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$frequencia) {
        http_response_code(404);
        echo json_encode(['error' => 'Frequência não encontrada']);
        return;
    }
    
    http_response_code(200);
    echo json_encode($frequencia);
}

/**
 * Criar nova frequência
 */
function createFrequencia($pdo, $usuarioId) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $voluntarioId = (int)($input['voluntario_id'] ?? 0);
    $dataTrabalho = $input['data_trabalho'] ?? '';
    $horaInicio = $input['hora_inicio'] ?? '';
    $horaFim = $input['hora_fim'] ?? '';
    $localInicio = trim($input['local_inicio'] ?? '');
    $localFim = trim($input['local_fim'] ?? '');
    $observacoes = trim($input['observacoes'] ?? '');
    
    // Validações
    if (!$voluntarioId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID do voluntário é obrigatório']);
        return;
    }
    
    if (!$dataTrabalho) {
        http_response_code(400);
        echo json_encode(['error' => 'Data do trabalho é obrigatória']);
        return;
    }
    
    if (!$horaInicio) {
        http_response_code(400);
        echo json_encode(['error' => 'Hora de início é obrigatória']);
        return;
    }
    
    if (!$localInicio) {
        http_response_code(400);
        echo json_encode(['error' => 'Local de início é obrigatório']);
        return;
    }
    
    // Validar se local de início é válido
    if (!in_array($localInicio, LOCAIS_TRABALHO)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Local de início inválido',
            'locais_validos' => LOCAIS_TRABALHO
        ]);
        return;
    }
    
    // Validar local de fim se fornecido
    if ($localFim && !in_array($localFim, LOCAIS_TRABALHO)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Local de fim inválido',
            'locais_validos' => LOCAIS_TRABALHO
        ]);
        return;
    }
    
    // Verificar se voluntário existe
    $stmt = $pdo->prepare("SELECT nome FROM voluntarios WHERE id = ?");
    $stmt->execute([$voluntarioId]);
    $voluntario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$voluntario) {
        http_response_code(404);
        echo json_encode(['error' => 'Voluntário não encontrado']);
        return;
    }
    
    // Verificar se já existe frequência para este voluntário na mesma data
    $stmt = $pdo->prepare("SELECT id FROM frequencia_voluntarios WHERE voluntario_id = ? AND data_trabalho = ?");
    $stmt->execute([$voluntarioId, $dataTrabalho]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Já existe frequência registrada para este voluntário nesta data']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO frequencia_voluntarios 
            (voluntario_id, data_trabalho, hora_inicio, hora_fim, local_inicio, local_fim, observacoes, lancado_por)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $voluntarioId,
            $dataTrabalho,
            $horaInicio,
            $horaFim ?: null,
            $localInicio,
            $localFim ?: null,
            $observacoes ?: null,
            $usuarioId
        ]);
        
        $frequenciaId = $pdo->lastInsertId();
        
        // Buscar a frequência criada com dados completos
        $stmt = $pdo->prepare("
            SELECT 
                fv.*,
                v.nome as voluntario_nome,
                v.cpf as voluntario_cpf,
                u.nome as lancado_por_nome
            FROM frequencia_voluntarios fv
            INNER JOIN voluntarios v ON fv.voluntario_id = v.id
            INNER JOIN usuarios u ON fv.lancado_por = u.id
            WHERE fv.id = ?
        ");
        $stmt->execute([$frequenciaId]);
        $frequencia = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Frequência registrada com sucesso',
            'frequencia' => $frequencia
        ]);
        
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            http_response_code(409);
            echo json_encode(['error' => 'Já existe frequência registrada para este voluntário nesta data']);
        } else {
            throw $e;
        }
    }
}

/**
 * Atualizar frequência
 */
function updateFrequencia($pdo, $id, $usuarioId) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Verificar se frequência existe
    $stmt = $pdo->prepare("SELECT * FROM frequencia_voluntarios WHERE id = ?");
    $stmt->execute([$id]);
    $frequenciaAtual = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$frequenciaAtual) {
        http_response_code(404);
        echo json_encode(['error' => 'Frequência não encontrada']);
        return;
    }
    
    $horaInicio = $input['hora_inicio'] ?? $frequenciaAtual['hora_inicio'];
    $horaFim = $input['hora_fim'] ?? $frequenciaAtual['hora_fim'];
    $localInicio = trim($input['local_inicio'] ?? $frequenciaAtual['local_inicio']);
    $localFim = trim($input['local_fim'] ?? $frequenciaAtual['local_fim']);
    $observacoes = trim($input['observacoes'] ?? $frequenciaAtual['observacoes']);
    
    // Validações
    if (!$horaInicio) {
        http_response_code(400);
        echo json_encode(['error' => 'Hora de início é obrigatória']);
        return;
    }
    
    if (!$localInicio) {
        http_response_code(400);
        echo json_encode(['error' => 'Local de início é obrigatório']);
        return;
    }
    
    // Validar se local de início é válido
    if (!in_array($localInicio, LOCAIS_TRABALHO)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Local de início inválido',
            'locais_validos' => LOCAIS_TRABALHO
        ]);
        return;
    }
    
    // Validar local de fim se fornecido
    if ($localFim && !in_array($localFim, LOCAIS_TRABALHO)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Local de fim inválido',
            'locais_validos' => LOCAIS_TRABALHO
        ]);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            UPDATE frequencia_voluntarios 
            SET hora_inicio = ?, hora_fim = ?, local_inicio = ?, local_fim = ?, observacoes = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $horaInicio,
            $horaFim ?: null,
            $localInicio,
            $localFim ?: null,
            $observacoes ?: null,
            $id
        ]);
        
        // Buscar a frequência atualizada
        $stmt = $pdo->prepare("
            SELECT 
                fv.*,
                v.nome as voluntario_nome,
                v.cpf as voluntario_cpf,
                u.nome as lancado_por_nome
            FROM frequencia_voluntarios fv
            INNER JOIN voluntarios v ON fv.voluntario_id = v.id
            INNER JOIN usuarios u ON fv.lancado_por = u.id
            WHERE fv.id = ?
        ");
        $stmt->execute([$id]);
        $frequencia = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode([
            'message' => 'Frequência atualizada com sucesso',
            'frequencia' => $frequencia
        ]);
        
    } catch (PDOException $e) {
        throw $e;
    }
}

/**
 * Excluir frequência
 */
function deleteFrequencia($pdo, $id) {
    // Verificar se frequência existe
    $stmt = $pdo->prepare("
        SELECT fv.id, v.nome as voluntario_nome, fv.data_trabalho
        FROM frequencia_voluntarios fv
        INNER JOIN voluntarios v ON fv.voluntario_id = v.id
        WHERE fv.id = ?
    ");
    $stmt->execute([$id]);
    $frequencia = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$frequencia) {
        http_response_code(404);
        echo json_encode(['error' => 'Frequência não encontrada']);
        return;
    }
    
    $stmt = $pdo->prepare("DELETE FROM frequencia_voluntarios WHERE id = ?");
    $stmt->execute([$id]);
    
    http_response_code(200);
    echo json_encode([
        'message' => 'Frequência excluída com sucesso',
        'voluntario' => $frequencia['voluntario_nome'],
        'data' => $frequencia['data_trabalho']
    ]);
}
?>
