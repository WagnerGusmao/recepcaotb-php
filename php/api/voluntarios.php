<?php
/**
 * API para gerenciamento de voluntários
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
    echo json_encode(['error' => 'Acesso negado. Apenas administradores e líderes podem gerenciar voluntários.']);
    exit;
}

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
                // Buscar voluntário específico
                getVoluntario($pdo, $id);
            } else {
                // Listar voluntários
                listVoluntarios($pdo);
            }
            break;
            
        case 'POST':
            // Criar novo voluntário
            createVoluntario($pdo);
            break;
            
        case 'PUT':
            if ($id) {
                // Atualizar voluntário
                updateVoluntario($pdo, $id);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID do voluntário é obrigatório para atualização']);
            }
            break;
            
        case 'DELETE':
            if ($id) {
                // Excluir voluntário
                deleteVoluntario($pdo, $id);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID do voluntário é obrigatório para exclusão']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
            break;
    }
    
} catch (Exception $e) {
    error_log("Erro na API de voluntários: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno do servidor']);
}

/**
 * Listar voluntários com filtros opcionais
 */
function listVoluntarios($pdo) {
    $busca = $_GET['busca'] ?? '';
    $limit = (int)($_GET['limit'] ?? 50);
    $offset = (int)($_GET['offset'] ?? 0);
    
    $sql = "SELECT * FROM voluntarios WHERE 1=1";
    $params = [];
    
    if ($busca) {
        $sql .= " AND (nome LIKE ? OR cpf LIKE ? OR email LIKE ? OR cidade LIKE ?)";
        $buscaParam = "%$busca%";
        $params = [$buscaParam, $buscaParam, $buscaParam, $buscaParam];
    }
    
    $sql .= " ORDER BY nome ASC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $voluntarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Contar total para paginação
    $countSql = "SELECT COUNT(*) as total FROM voluntarios WHERE 1=1";
    $countParams = [];
    
    if ($busca) {
        $countSql .= " AND (nome LIKE ? OR cpf LIKE ? OR email LIKE ? OR cidade LIKE ?)";
        $buscaParam = "%$busca%";
        $countParams = [$buscaParam, $buscaParam, $buscaParam, $buscaParam];
    }
    
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($countParams);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    http_response_code(200);
    echo json_encode([
        'voluntarios' => $voluntarios,
        'total' => (int)$total,
        'limit' => $limit,
        'offset' => $offset
    ]);
}

/**
 * Buscar voluntário específico
 */
function getVoluntario($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM voluntarios WHERE id = ?");
    $stmt->execute([$id]);
    $voluntario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$voluntario) {
        http_response_code(404);
        echo json_encode(['error' => 'Voluntário não encontrado']);
        return;
    }
    
    http_response_code(200);
    echo json_encode($voluntario);
}

/**
 * Criar novo voluntário
 */
function createVoluntario($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $nome = trim($input['nome'] ?? '');
    $cpf = trim($input['cpf'] ?? '');
    $dataNascimento = $input['data_nascimento'] ?? null;
    $religiao = trim($input['religiao'] ?? '');
    $estado = trim($input['estado'] ?? '');
    $cidade = trim($input['cidade'] ?? '');
    $email = trim($input['email'] ?? '');
    
    // Validações
    if (empty($nome)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome é obrigatório']);
        return;
    }
    
    if (strlen($nome) < 3) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome deve ter pelo menos 3 caracteres']);
        return;
    }
    
    // Validar CPF se fornecido
    if ($cpf && !validarCPF($cpf)) {
        http_response_code(400);
        echo json_encode(['error' => 'CPF inválido']);
        return;
    }
    
    // Validar email se fornecido
    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'E-mail inválido']);
        return;
    }
    
    // Verificar se CPF já existe
    if ($cpf) {
        $cpfLimpo = preg_replace('/[^0-9]/', '', $cpf); // Remover formatação
        error_log("Verificando CPF: $cpf (limpo: $cpfLimpo)");
        
        $stmt = $pdo->prepare("SELECT id, nome FROM voluntarios WHERE cpf = ?");
        $stmt->execute([$cpf]);
        $existente = $stmt->fetch();
        
        if ($existente) {
            error_log("CPF já existe - ID: {$existente['id']}, Nome: {$existente['nome']}");
            http_response_code(409);
            echo json_encode([
                'error' => 'CPF já cadastrado',
                'detalhes' => "O CPF $cpf já pertence a: {$existente['nome']} (ID: {$existente['id']})"
            ]);
            return;
        }
    }
    
    // Verificar se email já existe
    if ($email) {
        error_log("Verificando e-mail: $email");
        
        $stmt = $pdo->prepare("SELECT id, nome FROM voluntarios WHERE email = ?");
        $stmt->execute([$email]);
        $existente = $stmt->fetch();
        
        if ($existente) {
            error_log("E-mail já existe - ID: {$existente['id']}, Nome: {$existente['nome']}");
            http_response_code(409);
            echo json_encode([
                'error' => 'E-mail já cadastrado',
                'detalhes' => "O e-mail $email já pertence a: {$existente['nome']} (ID: {$existente['id']})"
            ]);
            return;
        }
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO voluntarios (nome, cpf, data_nascimento, religiao, estado, cidade, email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $nome,
            $cpf ?: null,
            $dataNascimento ?: null,
            $religiao ?: null,
            $estado ?: null,
            $cidade ?: null,
            $email ?: null
        ]);
        
        $voluntarioId = $pdo->lastInsertId();
        
        $usuarioId = null;
        $senhaGerada = null;
        
        // Criar usuário se solicitado
        if (isset($input['criar_usuario']) && $input['criar_usuario'] && $email) {
            $dadosUsuario = $input['usuario'] ?? [];
            $tipoUsuario = $dadosUsuario['tipo'] ?? 'geral';
            $senhaUsuario = $dadosUsuario['senha'] ?? '';
            
            // Validar se pode criar o tipo de usuário solicitado
            if ($tipoUsuario === 'administrador') {
                // Apenas administradores podem criar outros administradores
                // Verificar se o usuário atual é administrador através do token
                $auth = new Auth();
                $currentUser = $auth->getCurrentUser();
                if (!$currentUser || $currentUser['tipo'] !== 'administrador') {
                    $tipoUsuario = 'geral'; // Forçar para geral se não for admin
                }
            }
            
            // Verificar se email já existe na tabela usuarios
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stmt->execute([$email]);
            if (!$stmt->fetch()) {
                // Validar força da senha antes de criar usuário
                $auth = new Auth();
                $senhaValidacao = $auth->validatePasswordStrength($senhaUsuario);
                if (!$senhaValidacao['valid']) {
                    $pdo->rollBack();
                    http_response_code(400);
                    echo json_encode([
                        'error' => $senhaValidacao['message'],
                        'code' => 'WEAK_PASSWORD'
                    ]);
                    exit;
                }
                
                // Criar usuário
                $senhaHash = password_hash($senhaUsuario, PASSWORD_DEFAULT);
                $senhaGerada = $senhaUsuario; // Para retornar na resposta
                
                $stmt = $pdo->prepare("
                    INSERT INTO usuarios (nome, email, senha, tipo, ativo, deve_trocar_senha)
                    VALUES (?, ?, ?, ?, 1, 1)
                ");
                
                $stmt->execute([$nome, $email, $senhaHash, $tipoUsuario]);
                $usuarioId = $pdo->lastInsertId();
            }
        }
        
        // Buscar o voluntário criado
        $stmt = $pdo->prepare("SELECT * FROM voluntarios WHERE id = ?");
        $stmt->execute([$voluntarioId]);
        $voluntario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $response = [
            'message' => 'Voluntário cadastrado com sucesso',
            'voluntario' => $voluntario
        ];
        
        // Adicionar informações do usuário criado se aplicável
        if ($usuarioId) {
            $response['usuario_criado'] = [
                'id' => $usuarioId,
                'email' => $email,
                'tipo' => $tipoUsuario,
                'senha_inicial' => $senhaGerada
            ];
        }
        
        http_response_code(201);
        echo json_encode($response);
        
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            http_response_code(409);
            echo json_encode(['error' => 'CPF ou e-mail já cadastrado']);
        } else {
            throw $e;
        }
    }
}

/**
 * Atualizar voluntário
 */
function updateVoluntario($pdo, $id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Verificar se voluntário existe
    $stmt = $pdo->prepare("SELECT * FROM voluntarios WHERE id = ?");
    $stmt->execute([$id]);
    $voluntarioAtual = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$voluntarioAtual) {
        http_response_code(404);
        echo json_encode(['error' => 'Voluntário não encontrado']);
        return;
    }
    
    $nome = trim($input['nome'] ?? $voluntarioAtual['nome']);
    $cpf = trim($input['cpf'] ?? $voluntarioAtual['cpf']);
    $dataNascimento = $input['data_nascimento'] ?? $voluntarioAtual['data_nascimento'];
    $religiao = trim($input['religiao'] ?? $voluntarioAtual['religiao']);
    $estado = trim($input['estado'] ?? $voluntarioAtual['estado']);
    $cidade = trim($input['cidade'] ?? $voluntarioAtual['cidade']);
    $email = trim($input['email'] ?? $voluntarioAtual['email']);
    
    // Validações
    if (empty($nome)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome é obrigatório']);
        return;
    }
    
    if (strlen($nome) < 3) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome deve ter pelo menos 3 caracteres']);
        return;
    }
    
    // Validar CPF se fornecido e diferente do atual
    if ($cpf && $cpf !== $voluntarioAtual['cpf'] && !validarCPF($cpf)) {
        http_response_code(400);
        echo json_encode(['error' => 'CPF inválido']);
        return;
    }
    
    // Validar email se fornecido
    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'E-mail inválido']);
        return;
    }
    
    // Verificar duplicatas apenas se os valores mudaram
    if ($cpf && $cpf !== $voluntarioAtual['cpf']) {
        $stmt = $pdo->prepare("SELECT id FROM voluntarios WHERE cpf = ? AND id != ?");
        $stmt->execute([$cpf, $id]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'CPF já cadastrado para outro voluntário']);
            return;
        }
    }
    
    if ($email && $email !== $voluntarioAtual['email']) {
        $stmt = $pdo->prepare("SELECT id FROM voluntarios WHERE email = ? AND id != ?");
        $stmt->execute([$email, $id]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'E-mail já cadastrado para outro voluntário']);
            return;
        }
    }
    
    try {
        $stmt = $pdo->prepare("
            UPDATE voluntarios 
            SET nome = ?, cpf = ?, data_nascimento = ?, religiao = ?, estado = ?, cidade = ?, email = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $nome,
            $cpf ?: null,
            $dataNascimento ?: null,
            $religiao ?: null,
            $estado ?: null,
            $cidade ?: null,
            $email ?: null,
            $id
        ]);
        
        // Buscar o voluntário atualizado
        $stmt = $pdo->prepare("SELECT * FROM voluntarios WHERE id = ?");
        $stmt->execute([$id]);
        $voluntario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode([
            'message' => 'Voluntário atualizado com sucesso',
            'voluntario' => $voluntario
        ]);
        
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            http_response_code(409);
            echo json_encode(['error' => 'CPF ou e-mail já cadastrado']);
        } else {
            throw $e;
        }
    }
}

/**
 * Excluir voluntário
 */
function deleteVoluntario($pdo, $id) {
    // Verificar se voluntário existe
    $stmt = $pdo->prepare("SELECT nome FROM voluntarios WHERE id = ?");
    $stmt->execute([$id]);
    $voluntario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$voluntario) {
        http_response_code(404);
        echo json_encode(['error' => 'Voluntário não encontrado']);
        return;
    }
    
    $stmt = $pdo->prepare("DELETE FROM voluntarios WHERE id = ?");
    $stmt->execute([$id]);
    
    http_response_code(200);
    echo json_encode([
        'message' => 'Voluntário excluído com sucesso',
        'nome' => $voluntario['nome']
    ]);
}

/**
 * Validar CPF
 */
function validarCPF($cpf) {
    // Remove caracteres não numéricos
    $cpf = preg_replace('/[^0-9]/', '', $cpf);
    
    // Verifica se tem 11 dígitos
    if (strlen($cpf) != 11) {
        return false;
    }
    
    // Verifica se não é uma sequência de números iguais
    if (preg_match('/(\d)\1{10}/', $cpf)) {
        return false;
    }
    
    // Calcula os dígitos verificadores
    for ($t = 9; $t < 11; $t++) {
        $d = 0;
        for ($c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) {
            return false;
        }
    }
    
    return true;
}
?>
