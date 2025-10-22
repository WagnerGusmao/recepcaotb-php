<?php
/**
 * API de Pessoas
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
        case 'GET':
            handleGetPessoas($auth);
            break;
            
        case 'POST':
            handleCreatePessoa($auth);
            break;
            
        case 'PUT':
            $id = end($pathParts);
            if (is_numeric($id)) {
                handleUpdatePessoa($auth, $id);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID inválido']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Erro na API de pessoas: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno do servidor',
        'code' => 'INTERNAL_SERVER_ERROR'
    ]);
}

/**
 * Lista pessoas com filtros opcionais
 */
function handleGetPessoas($auth) {
    $busca = $_GET['busca'] ?? '';
    $limit = $_GET['limit'] ?? '';
    
    $sql = "SELECT * FROM pessoas";
    $params = [];
    
    if (!empty($busca)) {
        // Validar termo de busca
        if (strlen(trim($busca)) < 2) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Termo de busca deve ter pelo menos 2 caracteres',
                'code' => 'INVALID_SEARCH_TERM'
            ]);
            return;
        }
        
        $termoBusca = '%' . trim($busca) . '%';
        $sql .= " WHERE nome LIKE ? OR cpf LIKE ? OR cidade LIKE ? OR estado LIKE ? OR telefone LIKE ? OR email LIKE ?";
        $params = [$termoBusca, $termoBusca, $termoBusca, $termoBusca, $termoBusca, $termoBusca];
        
        // Adicionar ORDER BY antes do LIMIT
        $sql .= " ORDER BY created_at DESC LIMIT 50";
    } elseif (!empty($limit)) {
        // Se um limite específico foi fornecido, usar ele
        $sql .= " ORDER BY created_at DESC LIMIT " . intval($limit);
    } else {
        // Para relatórios sem busca, não aplicar limite (retornar todas as pessoas)
        $sql .= " ORDER BY created_at DESC";
    }
    
    $pessoas = db()->fetchAll($sql, $params);
    
    http_response_code(200);
    echo json_encode($pessoas);
}

/**
 * Cria uma nova pessoa
 */
function handleCreatePessoa($auth) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Dados inválidos',
            'code' => 'INVALID_INPUT'
        ]);
        return;
    }
    
    // Extrair dados
    $nome = trim($input['nome'] ?? '');
    $cpf = trim($input['cpf'] ?? '');
    $nascimento = $input['nascimento'] ?? null;
    $religiao = trim($input['religiao'] ?? '');
    $cidade = trim($input['cidade'] ?? '');
    $estado = trim($input['estado'] ?? '');
    $telefone = trim($input['telefone'] ?? '');
    $email = trim($input['email'] ?? '');
    $indicacao = trim($input['indicacao'] ?? '');
    $observacao = trim($input['observacao'] ?? '');
    
    // Validações obrigatórias
    if (empty($nome)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Nome é obrigatório',
            'code' => 'VALIDATION_ERROR'
        ]);
        return;
    }
    
    // Verificar se CPF já existe (se fornecido)
    if (!empty($cpf)) {
        $cpfExistente = db()->fetchOne("SELECT id FROM pessoas WHERE cpf = ?", [$cpf]);
        if ($cpfExistente) {
            http_response_code(409);
            echo json_encode([
                'error' => 'CPF já cadastrado',
                'code' => 'CPF_EXISTS'
            ]);
            return;
        }
    }
    
    // Preparar dados para inserção
    $dadosPessoa = [
        $nome,
        $cpf ?: '',
        $nascimento ?: null,
        $religiao ?: '',
        $cidade ?: '',
        $estado ?: '',
        $telefone ?: '',
        $email ?: '',
        $indicacao ?: '',
        $observacao ?: ''
    ];
    
    // Inserir no banco de dados
    $pessoaId = db()->insert(
        "INSERT INTO pessoas (nome, cpf, nascimento, religiao, cidade, estado, telefone, email, indicacao, observacao, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
        $dadosPessoa
    );
    
    // Buscar a pessoa criada
    $pessoaCriada = db()->fetchOne("SELECT * FROM pessoas WHERE id = ?", [$pessoaId]);
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Pessoa cadastrada com sucesso',
        'pessoa' => $pessoaCriada
    ]);
}

/**
 * Atualiza uma pessoa existente
 */
function handleUpdatePessoa($auth, $id) {
    // Verificar autenticação para edição
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
    
    // Validar se a pessoa existe
    $pessoaExistente = db()->fetchOne("SELECT * FROM pessoas WHERE id = ?", [$id]);
    if (!$pessoaExistente) {
        http_response_code(404);
        echo json_encode([
            'error' => 'Pessoa não encontrada',
            'code' => 'PERSON_NOT_FOUND'
        ]);
        return;
    }
    
    // Preparar dados para atualização (apenas campos não vazios)
    $updates = [];
    $params = [];
    
    $campos = ['nome', 'cpf', 'nascimento', 'religiao', 'cidade', 'estado', 'telefone', 'email', 'observacao'];
    
    foreach ($campos as $campo) {
        if (isset($input[$campo])) {
            if ($campo === 'observacao' || !empty(trim($input[$campo]))) {
                $updates[] = "$campo = ?";
                $params[] = trim($input[$campo]);
            }
        }
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Nenhum dado para atualizar',
            'code' => 'NO_DATA_TO_UPDATE'
        ]);
        return;
    }
    
    $params[] = $id;
    
    // Atualizar no banco de dados
    $updated = db()->execute(
        "UPDATE pessoas SET " . implode(', ', $updates) . " WHERE id = ?",
        $params
    );
    
    if ($updated > 0) {
        // Buscar dados atualizados
        $pessoaAtualizada = db()->fetchOne("SELECT * FROM pessoas WHERE id = ?", [$id]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Dados atualizados com sucesso',
            'pessoa' => $pessoaAtualizada
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'error' => 'Falha ao atualizar dados',
            'code' => 'UPDATE_FAILED'
        ]);
    }
}
