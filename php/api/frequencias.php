<?php
/**
 * API de Frequências
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

try {
    switch ($method) {
        case 'GET':
            handleGetFrequencias($auth);
            break;
            
        case 'POST':
            handleCreateFrequencia($auth);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Erro na API de frequências: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno do servidor',
        'code' => 'INTERNAL_SERVER_ERROR'
    ]);
}

/**
 * Lista frequências com filtros opcionais
 */
function handleGetFrequencias($auth) {
    // Verificar autenticação
    $user = $auth->requireAuth();
    
    $dataInicio = $_GET['dataInicio'] ?? '';
    $dataFim = $_GET['dataFim'] ?? '';
    $tipo = $_GET['tipo'] ?? '';
    $pessoaId = $_GET['pessoaId'] ?? '';
    
    $sql = "SELECT f.*, p.nome as pessoa_nome, p.cpf, p.cidade, p.estado, p.telefone, p.email 
            FROM frequencias f 
            INNER JOIN pessoas p ON f.pessoa_id = p.id 
            WHERE 1=1";
    $params = [];
    
    // Aplicar filtros
    if (!empty($dataInicio)) {
        $sql .= " AND f.data >= ?";
        $params[] = $dataInicio;
    }
    
    if (!empty($dataFim)) {
        $sql .= " AND f.data <= ?";
        $params[] = $dataFim;
    }
    
    if (!empty($tipo)) {
        $sql .= " AND f.tipo = ?";
        $params[] = $tipo;
    }
    
    if (!empty($pessoaId)) {
        $sql .= " AND f.pessoa_id = ?";
        $params[] = $pessoaId;
    }
    
    // Ordenar por data mais recente
    $sql .= " ORDER BY f.data DESC";
    
    $frequencias = db()->fetchAll($sql, $params);
    
    http_response_code(200);
    echo json_encode($frequencias);
}

/**
 * Registra uma nova frequência
 */
function handleCreateFrequencia($auth) {
    // Verificar autenticação
    $user = $auth->requireAuth();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Dados inválidos',
            'code' => 'INVALID_INPUT'
        ]);
        return;
    }
    
    $pessoaId = $input['pessoaId'] ?? '';
    $tipo = $input['tipo'] ?? '';
    $data = $input['data'] ?? '';
    $numeroSenha = $input['numeroSenha'] ?? '';
    $numeroSenhaTutor = $input['numeroSenhaTutor'] ?? '';
    $numeroSenhaPet = $input['numeroSenhaPet'] ?? '';
    
    // Validações básicas
    if (empty($pessoaId) || empty($tipo) || empty($data)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Pessoa, tipo e data são obrigatórios',
            'code' => 'MISSING_REQUIRED_FIELDS'
        ]);
        return;
    }
    
    // Validar se a pessoa existe
    $pessoaExistente = db()->fetchOne("SELECT * FROM pessoas WHERE id = ?", [$pessoaId]);
    if (!$pessoaExistente) {
        http_response_code(404);
        echo json_encode([
            'error' => 'Pessoa não encontrada',
            'code' => 'PERSON_NOT_FOUND'
        ]);
        return;
    }
    
    // Verificar se já existe frequência para esta pessoa nesta data
    $frequenciaExistente = db()->fetchOne(
        "SELECT * FROM frequencias WHERE pessoa_id = ? AND data = ?",
        [$pessoaId, $data]
    );
    
    if ($frequenciaExistente) {
        http_response_code(409);
        echo json_encode([
            'error' => 'Já existe frequência registrada para esta pessoa nesta data',
            'code' => 'FREQUENCY_ALREADY_EXISTS'
        ]);
        return;
    }
    
    // Preparar dados para inserção
    $dadosFrequencia = [
        $pessoaId,
        $tipo,
        $data
    ];
    
    $sql = "INSERT INTO frequencias (pessoa_id, tipo, data, created_at";
    $values = "VALUES (?, ?, ?, NOW()";
    
    // Tratar diferentes tipos de frequência
    if ($tipo === 'pet') {
        if (empty($numeroSenhaTutor) || empty($numeroSenhaPet)) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Para tipo Pet, ambas as senhas (tutor e pet) são obrigatórias',
                'code' => 'MISSING_PET_PASSWORDS'
            ]);
            return;
        }
        
        $sql .= ", numero_senha, numero_senha_tutor, numero_senha_pet";
        $values .= ", ?, ?, ?";
        $dadosFrequencia[] = intval($numeroSenhaTutor); // Senha principal é a do tutor
        $dadosFrequencia[] = intval($numeroSenhaTutor);
        $dadosFrequencia[] = intval($numeroSenhaPet);
    } else {
        if (empty($numeroSenha)) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Número da senha é obrigatório',
                'code' => 'MISSING_PASSWORD_NUMBER'
            ]);
            return;
        }
        
        $sql .= ", numero_senha";
        $values .= ", ?";
        $dadosFrequencia[] = intval($numeroSenha);
    }
    
    $sql .= ") " . $values . ")";
    
    // Inserir no banco de dados
    $frequenciaId = db()->insert($sql, $dadosFrequencia);
    
    // Buscar frequência criada
    $frequenciaCriada = db()->fetchOne(
        "SELECT f.*, p.nome as pessoa_nome 
         FROM frequencias f 
         INNER JOIN pessoas p ON f.pessoa_id = p.id 
         WHERE f.id = ?",
        [$frequenciaId]
    );
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Frequência registrada com sucesso',
        'frequencia' => $frequenciaCriada
    ]);
}
