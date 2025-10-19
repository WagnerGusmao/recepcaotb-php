<?php
/**
 * API de Usuários
 * Sistema de Recepção Terra do Bugio - Versão PHP
 */

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
        case 'GET':
            if (end($pathParts) === 'pessoas-disponiveis') {
                handlePessoasDisponiveis($auth);
            } else {
                handleGetUsuarios($auth);
            }
            break;
            
        case 'POST':
            handleCreateUsuario($auth);
            break;
            
        case 'PUT':
            $lastPart = end($pathParts);
            $secondLastPart = prev($pathParts);
            
            if ($lastPart === 'trocar-senha-obrigatoria') {
                handleTrocarSenhaObrigatoria($auth);
            } elseif ($lastPart === 'perfil') {
                handleEditarPerfil($auth);
            } elseif ($lastPart === 'reset-senha' && is_numeric($secondLastPart)) {
                handleResetSenha($auth, $secondLastPart);
            } elseif (is_numeric($lastPart)) {
                handleUpdateUsuario($auth, $lastPart);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Endpoint inválido']);
            }
            break;
            
        case 'DELETE':
            $id = end($pathParts);
            if (is_numeric($id)) {
                handleDeleteUsuario($auth, $id);
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
    error_log("Erro na API de usuários: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno do servidor',
        'code' => 'INTERNAL_SERVER_ERROR'
    ]);
}

/**
 * Lista usuários (apenas administradores)
 */
function handleGetUsuarios($auth) {
    $user = $auth->requireAuth();
    $auth->requireRole(['administrador'], $user);
    
    $users = db()->fetchAll(
        "SELECT u.id, u.nome, u.email, u.tipo, u.ativo, u.created_at, p.nome as pessoa_nome 
         FROM usuarios u 
         LEFT JOIN pessoas p ON u.pessoa_id = p.id 
         ORDER BY u.created_at DESC"
    );
    
    http_response_code(200);
    echo json_encode($users);
}

/**
 * Cria um novo usuário (apenas administradores)
 */
function handleCreateUsuario($auth) {
    $user = $auth->requireAuth();
    $auth->requireRole(['administrador'], $user);
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        return;
    }
    
    $nome = trim($input['nome'] ?? '');
    $email = trim($input['email'] ?? '');
    $senha = $input['senha'] ?? '';
    $tipo = $input['tipo'] ?? '';
    $pessoaId = $input['pessoa_id'] ?? null;
    $voluntarioId = $input['voluntario_id'] ?? null;
    
    // Validações básicas
    if (empty($nome) || empty($email) || empty($senha) || empty($tipo)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome, email, senha e tipo são obrigatórios']);
        return;
    }
    
    if (!in_array($tipo, ['geral', 'lider', 'administrador'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo inválido']);
        return;
    }
    
    if (strlen($senha) < 4) {
        http_response_code(400);
        echo json_encode(['error' => 'Senha deve ter pelo menos 4 caracteres']);
        return;
    }
    
    // Verificar se email já existe
    $emailExistente = db()->fetchOne("SELECT id FROM usuarios WHERE email = ?", [$email]);
    if ($emailExistente) {
        http_response_code(400);
        echo json_encode(['error' => 'Email já cadastrado']);
        return;
    }
    
    // Se foi fornecido voluntario_id, verificar se existe
    // Não vamos usar como pessoa_id pois são tabelas diferentes
    if ($voluntarioId) {
        $voluntario = db()->fetchOne("SELECT id FROM voluntarios WHERE id = ?", [$voluntarioId]);
        if (!$voluntario) {
            http_response_code(400);
            echo json_encode(['error' => 'Voluntário não encontrado']);
            return;
        }
        // Manter pessoa_id como null para usuários criados a partir de voluntários
        $pessoaId = null;
    }
    
    // Gerar hash da senha
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    
    try {
        // Inserir usuário no banco
        $usuarioId = db()->insert(
            "INSERT INTO usuarios (nome, email, senha, tipo, pessoa_id, ativo, deve_trocar_senha, created_at) 
             VALUES (?, ?, ?, ?, ?, 1, 1, NOW())",
            [$nome, $email, $senhaHash, $tipo, $pessoaId]
        );
    } catch (Exception $e) {
        error_log("Erro ao inserir usuário: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar usuário: ' . $e->getMessage()]);
        return;
    }
    
    // Buscar usuário criado
    $usuarioCriado = db()->fetchOne(
        "SELECT u.id, u.nome, u.email, u.tipo, u.ativo, u.created_at, 
                COALESCE(v.nome, p.nome) as pessoa_nome 
         FROM usuarios u 
         LEFT JOIN pessoas p ON u.pessoa_id = p.id 
         LEFT JOIN voluntarios v ON u.pessoa_id = v.id 
         WHERE u.id = ?",
        [$usuarioId]
    );
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Usuário criado com sucesso',
        'usuario' => $usuarioCriado
    ]);
}

/**
 * Atualiza status de um usuário (apenas administradores)
 */
function handleUpdateUsuario($auth, $id) {
    $user = $auth->requireAuth();
    $auth->requireRole(['administrador'], $user);
    
    // Prevenir que o próprio usuário se desative ou altere seu próprio tipo
    if (intval($id) === $user['id']) {
        http_response_code(400);
        echo json_encode(['error' => 'Você não pode alterar seu próprio status ou tipo']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Verificar se pelo menos um campo foi fornecido
    if (!isset($input['ativo']) && !isset($input['tipo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Status ativo ou tipo é obrigatório']);
        return;
    }
    
    $updates = [];
    $params = [];
    
    // Atualizar status se fornecido
    if (isset($input['ativo'])) {
        $ativo = $input['ativo'] ? 1 : 0;
        $updates[] = "ativo = ?";
        $params[] = $ativo;
    }
    
    // Atualizar tipo se fornecido (apenas administradores)
    if (isset($input['tipo'])) {
        $tiposValidos = ['geral', 'lider', 'administrador'];
        if (!in_array($input['tipo'], $tiposValidos)) {
            http_response_code(400);
            echo json_encode(['error' => 'Tipo de usuário inválido']);
            return;
        }
        
        $updates[] = "tipo = ?";
        $params[] = $input['tipo'];
    }
    
    $params[] = $id;
    $sql = "UPDATE usuarios SET " . implode(", ", $updates) . " WHERE id = ?";
    
    $updated = db()->execute($sql, $params);
    
    if ($updated > 0) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Usuário atualizado com sucesso'
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Usuário não encontrado']);
    }
}

/**
 * Reset de senha de um usuário (apenas administradores)
 */
function handleResetSenha($auth, $id) {
    $user = $auth->requireAuth();
    $auth->requireRole(['administrador'], $user);
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['novaSenha'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nova senha é obrigatória']);
        return;
    }
    
    $novaSenha = $input['novaSenha'];
    
    if (strlen($novaSenha) < 4) {
        http_response_code(400);
        echo json_encode(['error' => 'Senha deve ter pelo menos 4 caracteres']);
        return;
    }
    
    // Gerar hash da nova senha
    $senhaHash = $auth->hashPassword($novaSenha);
    
    // Iniciar transação
    db()->beginTransaction();
    
    try {
        // Atualizar senha e marcar para trocar senha
        $updated = db()->execute(
            "UPDATE usuarios SET senha = ?, deve_trocar_senha = 1 WHERE id = ?",
            [$senhaHash, $id]
        );
        
        if ($updated === 0) {
            db()->rollback();
            http_response_code(404);
            echo json_encode(['error' => 'Usuário não encontrado']);
            return;
        }
        
        // Invalidar todas as sessões do usuário
        db()->execute("DELETE FROM sessoes WHERE usuario_id = ?", [$id]);
        
        db()->commit();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Senha resetada com sucesso'
        ]);
        
    } catch (Exception $e) {
        db()->rollback();
        throw $e;
    }
}

/**
 * Edita perfil do próprio usuário
 */
function handleEditarPerfil($auth) {
    $user = $auth->requireAuth();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        return;
    }
    
    $nome = trim($input['nome'] ?? '');
    $email = trim($input['email'] ?? '');
    $senhaAtual = $input['senhaAtual'] ?? '';
    $novaSenha = $input['novaSenha'] ?? '';
    
    if (empty($nome) || empty($email)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome e email são obrigatórios']);
        return;
    }
    
    // Verificar se email já existe (exceto o próprio usuário)
    $emailExistente = db()->fetchOne(
        "SELECT id FROM usuarios WHERE email = ? AND id != ?",
        [$email, $user['id']]
    );
    
    if ($emailExistente) {
        http_response_code(400);
        echo json_encode(['error' => 'Email já está em uso por outro usuário']);
        return;
    }
    
    // Se está tentando alterar senha, validar
    $alterarSenha = !empty($senhaAtual) && !empty($novaSenha);
    
    if ($alterarSenha) {
        // Buscar dados atuais do usuário para verificar senha
        $usuarioAtual = db()->fetchOne(
            "SELECT senha FROM usuarios WHERE id = ?",
            [$user['id']]
        );
        
        if (!$usuarioAtual) {
            http_response_code(404);
            echo json_encode(['error' => 'Usuário não encontrado']);
            return;
        }
        
        // Verificar senha atual
        if (!password_verify($senhaAtual, $usuarioAtual['senha'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Senha atual incorreta']);
            return;
        }
        
        // Validar nova senha
        if (strlen($novaSenha) < 4) {
            http_response_code(400);
            echo json_encode(['error' => 'Nova senha deve ter pelo menos 4 caracteres']);
            return;
        }
        
        // Atualizar perfil com nova senha
        $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);
        $updated = db()->execute(
            "UPDATE usuarios SET nome = ?, email = ?, senha = ?, deve_trocar_senha = 0 WHERE id = ?",
            [$nome, $email, $senhaHash, $user['id']]
        );
        
        if ($updated > 0) {
            // Invalidar outras sessões por segurança
            db()->execute("DELETE FROM sessoes WHERE usuario_id = ?", [$user['id']]);
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Perfil e senha atualizados com sucesso'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Falha ao atualizar perfil e senha']);
        }
    } else {
        // Atualizar apenas perfil (sem senha)
        $updated = db()->execute(
            "UPDATE usuarios SET nome = ?, email = ? WHERE id = ?",
            [$nome, $email, $user['id']]
        );
        
        if ($updated > 0) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Perfil atualizado com sucesso'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Falha ao atualizar perfil']);
        }
    }
}

/**
 * Troca senha obrigatória
 */
function handleTrocarSenhaObrigatoria($auth) {
    $user = $auth->requireAuth();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        return;
    }
    
    $senhaAtual = $input['senhaAtual'] ?? '';
    $novaSenha = $input['novaSenha'] ?? '';
    
    if (empty($senhaAtual) || empty($novaSenha)) {
        http_response_code(400);
        echo json_encode(['error' => 'Senha atual e nova senha são obrigatórias']);
        return;
    }
    
    // Verificar senha atual
    if (!password_verify($senhaAtual, $user['senha'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Senha atual incorreta']);
        return;
    }
    
    if (strlen($novaSenha) < 4) {
        http_response_code(400);
        echo json_encode(['error' => 'Nova senha deve ter pelo menos 4 caracteres']);
        return;
    }
    
    // Gerar hash da nova senha
    $senhaHash = $auth->hashPassword($novaSenha);
    
    // Iniciar transação
    db()->beginTransaction();
    
    try {
        // Atualizar senha e remover flag de trocar senha
        $updated = db()->execute(
            "UPDATE usuarios SET senha = ?, deve_trocar_senha = 0 WHERE id = ?",
            [$senhaHash, $user['id']]
        );
        
        if ($updated === 0) {
            db()->rollback();
            http_response_code(500);
            echo json_encode(['error' => 'Falha ao atualizar senha']);
            return;
        }
        
        // Invalidar todas as sessões do usuário (forçar novo login)
        db()->execute("DELETE FROM sessoes WHERE usuario_id = ?", [$user['id']]);
        
        db()->commit();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Senha alterada com sucesso'
        ]);
        
    } catch (Exception $e) {
        db()->rollback();
        throw $e;
    }
}

/**
 * Exclui um usuário (apenas administradores)
 */
function handleDeleteUsuario($auth, $id) {
    $user = $auth->requireAuth();
    $auth->requireRole(['administrador'], $user);
    
    // Prevenir que o próprio usuário se delete
    if (intval($id) === $user['id']) {
        http_response_code(400);
        echo json_encode(['error' => 'Você não pode excluir seu próprio usuário']);
        return;
    }
    
    // Iniciar transação
    db()->beginTransaction();
    
    try {
        // Primeiro, remover as sessões do usuário
        db()->execute("DELETE FROM sessoes WHERE usuario_id = ?", [$id]);
        
        // Depois, remover o usuário
        $deleted = db()->execute("DELETE FROM usuarios WHERE id = ?", [$id]);
        
        if ($deleted === 0) {
            db()->rollback();
            http_response_code(404);
            echo json_encode(['error' => 'Usuário não encontrado']);
            return;
        }
        
        db()->commit();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Usuário removido com sucesso'
        ]);
        
    } catch (Exception $e) {
        db()->rollback();
        throw $e;
    }
}

/**
 * Lista pessoas disponíveis para vincular a usuários
 */
function handlePessoasDisponiveis($auth) {
    $user = $auth->requireAuth();
    $auth->requireRole(['administrador'], $user);
    
    $pessoas = db()->fetchAll(
        "SELECT p.id, p.nome 
         FROM pessoas p 
         LEFT JOIN usuarios u ON p.id = u.pessoa_id 
         WHERE u.pessoa_id IS NULL 
         ORDER BY p.nome"
    );
    
    http_response_code(200);
    echo json_encode($pessoas);
}
