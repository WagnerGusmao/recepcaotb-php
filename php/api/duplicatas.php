<?php
/**
 * API de Duplicatas (Funcionalidade Temporariamente Indisponível)
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

// Verificar se é administrador - líderes NÃO têm acesso a duplicatas
// Aceitar tanto 'admin' quanto 'administrador' por compatibilidade
if (!in_array($user['tipo'], ['admin', 'administrador'])) {
    http_response_code(403);
    echo json_encode([
        'error' => 'Acesso negado',
        'message' => 'Apenas administradores podem gerenciar duplicatas'
    ]);
    exit;
}

try {
    switch ($method) {
        case 'GET':
            if (end($pathParts) === 'stats') {
                handleStats();
            } elseif (end($pathParts) === 'duplicatas') {
                handleAnalyseDuplicates();
            } elseif (count($pathParts) >= 3 && $pathParts[count($pathParts)-2] === 'grupo') {
                // GET /api/duplicatas/grupo/{grupoId}
                $grupoId = end($pathParts);
                handleGetGrupoDetalhes($grupoId);
            } else {
                handleAnalyseDuplicates();
            }
            break;
            
        case 'POST':
            if (end($pathParts) === 'mesclar') {
                handleMerge();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint não encontrado']);
            }
            break;
            
        case 'DELETE':
            if (end($pathParts) === 'cache') {
                handleClearCache();
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
    error_log("Erro na API de duplicatas: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno do servidor',
        'code' => 'INTERNAL_SERVER_ERROR'
    ]);
}

/**
 * Retorna estatísticas do sistema
 */
function handleStats() {
    try {
        $totalPessoas = db()->fetchOne("SELECT COUNT(*) as total FROM pessoas");
        $totalFrequencias = db()->fetchOne("SELECT COUNT(*) as total FROM frequencias");
        
        http_response_code(200);
        echo json_encode([
            'total_pessoas' => $totalPessoas['total'],
            'total_frequencias' => $totalFrequencias['total'],
            'ultima_analise' => null,
            'cache_ativo' => false,
            'status' => 'Funcionalidade em desenvolvimento'
        ]);
    } catch (Exception $e) {
        throw $e;
    }
}

/**
 * Análise de duplicatas (versão básica implementada)
 */
function handleAnalyseDuplicates() {
    try {
        $threshold = $_GET['threshold'] ?? 0.85;
        
        // Análise básica de duplicatas
        $grupos = [];
        
        // 1. Duplicatas por nome similar (primeiras 3 palavras)
        $nomesSimilares = db()->fetchAll("
            SELECT 
                SUBSTRING_INDEX(nome, ' ', 3) as nome_base,
                COUNT(*) as quantidade,
                GROUP_CONCAT(id ORDER BY id) as ids,
                GROUP_CONCAT(nome ORDER BY id SEPARATOR '|||') as nomes_completos
            FROM pessoas 
            WHERE nome IS NOT NULL AND nome != ''
            GROUP BY SUBSTRING_INDEX(nome, ' ', 3)
            HAVING COUNT(*) > 1
            ORDER BY quantidade DESC
        ");
        
        foreach ($nomesSimilares as $grupo) {
            $ids = explode(',', $grupo['ids']);
            $nomes = explode('|||', $grupo['nomes_completos']);
            
            $pessoas = [];
            for ($i = 0; $i < count($ids); $i++) {
                $pessoa = db()->fetchOne("SELECT * FROM pessoas WHERE id = ?", [$ids[$i]]);
                if ($pessoa) {
                    // Adicionar contagem de frequências
                    $frequencias = db()->fetchOne("SELECT COUNT(*) as total FROM frequencias WHERE pessoa_id = ?", [$pessoa['id']]);
                    $pessoa['total_frequencias'] = $frequencias['total'];
                    $pessoas[] = $pessoa;
                }
            }
            
            if (count($pessoas) > 1) {
                // Calcular similaridade mais precisa
                $similaridade = calculateNameSimilarity($pessoas);
                
                // Sugerir pessoa principal (mais frequências ou mais dados completos)
                $pessoaPrincipal = suggestMainPerson($pessoas);
                
                $grupos[] = [
                    'id' => 'nome_' . md5($grupo['nome_base']),
                    'tipo' => 'nome_similar',
                    'similaridade_media' => $similaridade,
                    'pessoas' => $pessoas,
                    'criterio' => "Nome similar: {$grupo['nome_base']}",
                    'pessoa_principal_sugerida' => $pessoaPrincipal,
                    'confianca_mesclagem' => $similaridade > 0.85 ? 'alta' : 'media',
                    'campos_conflitantes' => findConflictingFields($pessoas)
                ];
            }
        }
        
        // 2. Duplicatas por telefone
        $telefonesDuplicados = db()->fetchAll("
            SELECT 
                telefone,
                COUNT(*) as quantidade,
                GROUP_CONCAT(id ORDER BY id) as ids
            FROM pessoas 
            WHERE telefone IS NOT NULL AND telefone != ''
            GROUP BY telefone
            HAVING COUNT(*) > 1
            ORDER BY quantidade DESC
        ");
        
        foreach ($telefonesDuplicados as $grupo) {
            $ids = explode(',', $grupo['ids']);
            
            $pessoas = [];
            foreach ($ids as $id) {
                $pessoa = db()->fetchOne("SELECT * FROM pessoas WHERE id = ?", [$id]);
                if ($pessoa) {
                    // Adicionar contagem de frequências
                    $frequencias = db()->fetchOne("SELECT COUNT(*) as total FROM frequencias WHERE pessoa_id = ?", [$pessoa['id']]);
                    $pessoa['total_frequencias'] = $frequencias['total'];
                    $pessoas[] = $pessoa;
                }
            }
            
            if (count($pessoas) > 1) {
                // Sugerir pessoa principal
                $pessoaPrincipal = suggestMainPerson($pessoas);
                
                $grupos[] = [
                    'id' => 'tel_' . md5($grupo['telefone']),
                    'tipo' => 'telefone_identico',
                    'similaridade_media' => 1.0, // Telefone idêntico = 100%
                    'pessoas' => $pessoas,
                    'criterio' => "Telefone idêntico: {$grupo['telefone']}",
                    'pessoa_principal_sugerida' => $pessoaPrincipal,
                    'confianca_mesclagem' => 'muito_alta', // Telefone idêntico = alta confiança
                    'campos_conflitantes' => findConflictingFields($pessoas)
                ];
            }
        }
        
        // 3. Duplicatas por email
        $emailsDuplicados = db()->fetchAll("
            SELECT 
                email,
                COUNT(*) as quantidade,
                GROUP_CONCAT(id ORDER BY id) as ids
            FROM pessoas 
            WHERE email IS NOT NULL AND email != ''
            GROUP BY email
            HAVING COUNT(*) > 1
            ORDER BY quantidade DESC
        ");
        
        foreach ($emailsDuplicados as $grupo) {
            $ids = explode(',', $grupo['ids']);
            
            $pessoas = [];
            foreach ($ids as $id) {
                $pessoa = db()->fetchOne("SELECT * FROM pessoas WHERE id = ?", [$id]);
                if ($pessoa) {
                    // Adicionar contagem de frequências
                    $frequencias = db()->fetchOne("SELECT COUNT(*) as total FROM frequencias WHERE pessoa_id = ?", [$pessoa['id']]);
                    $pessoa['total_frequencias'] = $frequencias['total'];
                    $pessoas[] = $pessoa;
                }
            }
            
            if (count($pessoas) > 1) {
                // Sugerir pessoa principal
                $pessoaPrincipal = suggestMainPerson($pessoas);
                
                $grupos[] = [
                    'id' => 'email_' . md5($grupo['email']),
                    'tipo' => 'email_identico',
                    'similaridade_media' => 1.0, // Email idêntico = 100%
                    'pessoas' => $pessoas,
                    'criterio' => "Email idêntico: {$grupo['email']}",
                    'pessoa_principal_sugerida' => $pessoaPrincipal,
                    'confianca_mesclagem' => 'muito_alta', // Email idêntico = alta confiança
                    'campos_conflitantes' => findConflictingFields($pessoas)
                ];
            }
        }
        
        // Ordenar grupos por similaridade (maiores primeiro)
        usort($grupos, function($a, $b) {
            return $b['similaridade_media'] <=> $a['similaridade_media'];
        });
        
        // Calcular estatísticas
        $totalPessoas = db()->fetchOne("SELECT COUNT(*) as total FROM pessoas")['total'];
        $totalGrupos = count($grupos);
        $pessoasDuplicadas = 0;
        
        foreach ($grupos as $grupo) {
            $pessoasDuplicadas += count($grupo['pessoas']);
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'total_pessoas' => $totalPessoas,
            'total_grupos' => $totalGrupos,
            'pessoas_duplicadas' => $pessoasDuplicadas,
            'total_pessoas_duplicadas' => $pessoasDuplicadas, // Compatibilidade com frontend
            'threshold_usado' => $threshold,
            'tempo_processamento' => '< 1 segundo',
            'grupos' => $grupos,
            'estatisticas' => [
                'algoritmo' => 'Análise básica por campos idênticos e similares',
                'criterios' => ['nome_similar', 'telefone_identico', 'email_identico'],
                'precisao' => 'Alta para campos idênticos, média para nomes similares'
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Erro na análise de duplicatas: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error' => 'Erro interno na análise de duplicatas',
            'message' => $e->getMessage(),
            'code' => 'INTERNAL_ERROR'
        ]);
    }
}

/**
 * Mesclagem de duplicatas (implementada)
 */
function handleMerge() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Dados de entrada inválidos']);
            return;
        }
        
        $pessoaPrincipalId = $input['pessoa_principal_id'] ?? null;
        $pessoasSecundariasIds = $input['pessoas_secundarias_ids'] ?? [];
        $dadosMesclados = $input['dados_mesclados'] ?? [];
        $mesclagem_seletiva = $input['mesclagem_seletiva'] ?? false;
        $registros_selecionados = $input['registros_selecionados'] ?? [];
        
        // Validações
        if (!$pessoaPrincipalId || empty($pessoasSecundariasIds)) {
            http_response_code(400);
            echo json_encode(['error' => 'pessoa_principal_id e pessoas_secundarias_ids são obrigatórios']);
            return;
        }
        
        if (in_array($pessoaPrincipalId, $pessoasSecundariasIds)) {
            http_response_code(400);
            echo json_encode(['error' => 'Pessoa principal não pode estar na lista de secundárias']);
            return;
        }
        
        if (count($pessoasSecundariasIds) > 10) {
            http_response_code(400);
            echo json_encode(['error' => 'Máximo de 10 pessoas por mesclagem']);
            return;
        }
        
        // Verificar se todas as pessoas existem
        $pessoaPrincipal = db()->fetchOne("SELECT * FROM pessoas WHERE id = ?", [$pessoaPrincipalId]);
        if (!$pessoaPrincipal) {
            http_response_code(404);
            echo json_encode(['error' => 'Pessoa principal não encontrada']);
            return;
        }
        
        $pessoasSecundarias = [];
        foreach ($pessoasSecundariasIds as $id) {
            $pessoa = db()->fetchOne("SELECT * FROM pessoas WHERE id = ?", [$id]);
            if (!$pessoa) {
                http_response_code(404);
                echo json_encode(['error' => "Pessoa secundária ID $id não encontrada"]);
                return;
            }
            $pessoasSecundarias[] = $pessoa;
        }
        
        // Iniciar transação
        db()->beginTransaction();
        
        try {
            // 1. Criar dados mesclados inteligentemente se não fornecidos
            if (empty($dadosMesclados)) {
                // Buscar dados de todas as pessoas para mesclagem
                $todasPessoas = [];
                $todasPessoas[] = $pessoaPrincipal;
                foreach ($pessoasSecundarias as $pessoa) {
                    $todasPessoas[] = $pessoa;
                }
                
                // Criar dados mesclados automaticamente
                $dadosMesclados = mergePersonData($todasPessoas, $pessoaPrincipalId);
            }
            
            // Atualizar dados da pessoa principal com dados mesclados
            if (!empty($dadosMesclados)) {
                $updateFields = [];
                $updateParams = [];
                
                $allowedFields = ['nome', 'cpf', 'nascimento', 'religiao', 'cidade', 'estado', 'telefone', 'email', 'indicacao', 'observacao'];
                
                foreach ($dadosMesclados as $field => $value) {
                    if (in_array($field, $allowedFields) && !empty($value)) {
                        $updateFields[] = "$field = ?";
                        $updateParams[] = $value;
                    }
                }
                
                if (!empty($updateFields)) {
                    $updateParams[] = $pessoaPrincipalId;
                    $sql = "UPDATE pessoas SET " . implode(', ', $updateFields) . " WHERE id = ?";
                    db()->execute($sql, $updateParams);
                }
            }
            
            // 2. Transferir frequências das pessoas secundárias para a principal
            $frequenciasTransferidas = 0;
            
            if ($mesclagem_seletiva && !empty($registros_selecionados)) {
                // Mesclagem seletiva - apenas registros específicos
                foreach ($registros_selecionados as $registro) {
                    if (isset($registro['tipo']) && isset($registro['pessoa_id']) && isset($registro['id'])) {
                        if ($registro['tipo'] === 'frequencia') {
                            // Transferir frequência específica
                            $result = db()->execute(
                                "UPDATE frequencias SET pessoa_id = ? WHERE id = ? AND pessoa_id = ?",
                                [$pessoaPrincipalId, $registro['id'], $registro['pessoa_id']]
                            );
                            $frequenciasTransferidas += $result;
                        }
                    }
                }
                
                // Remover apenas pessoas que não têm mais frequências
                $pessoasParaRemover = [];
                foreach ($pessoasSecundariasIds as $pessoaSecundariaId) {
                    $frequenciasRestantes = db()->fetchOne(
                        "SELECT COUNT(*) as total FROM frequencias WHERE pessoa_id = ?", 
                        [$pessoaSecundariaId]
                    );
                    
                    if ($frequenciasRestantes['total'] == 0) {
                        $pessoasParaRemover[] = $pessoaSecundariaId;
                    }
                }
                $pessoasSecundariasIds = $pessoasParaRemover;
                
            } else {
                // Mesclagem completa - todas as frequências
                foreach ($pessoasSecundariasIds as $pessoaSecundariaId) {
                    $result = db()->execute(
                        "UPDATE frequencias SET pessoa_id = ? WHERE pessoa_id = ?",
                        [$pessoaPrincipalId, $pessoaSecundariaId]
                    );
                    $frequenciasTransferidas += $result;
                }
            }
            
            // 3. Remover pessoas secundárias
            $pessoasRemovidas = 0;
            foreach ($pessoasSecundariasIds as $pessoaSecundariaId) {
                $result = db()->execute("DELETE FROM pessoas WHERE id = ?", [$pessoaSecundariaId]);
                $pessoasRemovidas += $result;
            }
            
            // Confirmar transação
            db()->commit();
            
            // Buscar dados atualizados da pessoa principal
            $pessoaPrincipalAtualizada = db()->fetchOne("SELECT * FROM pessoas WHERE id = ?", [$pessoaPrincipalId]);
            $totalFrequencias = db()->fetchOne("SELECT COUNT(*) as total FROM frequencias WHERE pessoa_id = ?", [$pessoaPrincipalId]);
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Mesclagem realizada com sucesso',
                'pessoa_principal' => $pessoaPrincipalAtualizada,
                'frequencias_transferidas' => $frequenciasTransferidas,
                'pessoas_removidas' => $pessoasRemovidas,
                'total_frequencias_final' => $totalFrequencias['total'],
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            
        } catch (Exception $e) {
            db()->rollback();
            throw $e;
        }
        
    } catch (Exception $e) {
        error_log("Erro na mesclagem de duplicatas: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error' => 'Erro interno na mesclagem',
            'message' => $e->getMessage(),
            'code' => 'MERGE_ERROR'
        ]);
    }
}

/**
 * Limpar cache (simulado)
 */
function handleClearCache() {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Cache simulado foi limpo',
        'timestamp' => date('Y-m-d H:i:s'),
        'note' => 'Funcionalidade de cache será implementada na versão completa'
    ]);
}

/**
 * Calcula similaridade entre nomes de pessoas
 */
function calculateNameSimilarity($pessoas) {
    if (count($pessoas) < 2) return 1.0;
    
    $nomes = array_map(function($p) { return strtoupper(trim($p['nome'])); }, $pessoas);
    $totalSimilaridade = 0;
    $comparacoes = 0;
    
    for ($i = 0; $i < count($nomes); $i++) {
        for ($j = $i + 1; $j < count($nomes); $j++) {
            $similaridade = calculateStringSimilarity($nomes[$i], $nomes[$j]);
            $totalSimilaridade += $similaridade;
            $comparacoes++;
        }
    }
    
    return $comparacoes > 0 ? $totalSimilaridade / $comparacoes : 1.0;
}

/**
 * Calcula similaridade entre duas strings usando algoritmo simples
 */
function calculateStringSimilarity($str1, $str2) {
    // Normalizar strings
    $str1 = preg_replace('/[^A-Z0-9]/', '', strtoupper($str1));
    $str2 = preg_replace('/[^A-Z0-9]/', '', strtoupper($str2));
    
    if ($str1 === $str2) return 1.0;
    if (empty($str1) || empty($str2)) return 0.0;
    
    // Usar similar_text para calcular similaridade
    similar_text($str1, $str2, $percent);
    return $percent / 100.0;
}

/**
 * Sugere a pessoa principal baseada em critérios
 */
function suggestMainPerson($pessoas) {
    if (empty($pessoas)) return null;
    
    $melhorPessoa = $pessoas[0];
    $melhorScore = calculatePersonScore($melhorPessoa);
    
    foreach ($pessoas as $pessoa) {
        $score = calculatePersonScore($pessoa);
        if ($score > $melhorScore) {
            $melhorScore = $score;
            $melhorPessoa = $pessoa;
        }
    }
    
    return $melhorPessoa['id'];
}

/**
 * Calcula score de uma pessoa para determinar qual deve ser a principal
 */
function calculatePersonScore($pessoa) {
    $score = 0;
    
    // Mais frequências = maior score
    $score += ($pessoa['total_frequencias'] ?? 0) * 10;
    
    // Dados mais completos = maior score
    if (!empty($pessoa['nome'])) $score += 5;
    if (!empty($pessoa['cpf']) && $pessoa['cpf'] !== '000.000.000-00') $score += 8;
    if (!empty($pessoa['telefone'])) $score += 3;
    if (!empty($pessoa['email'])) $score += 3;
    if (!empty($pessoa['nascimento'])) $score += 2;
    if (!empty($pessoa['cidade'])) $score += 2;
    if (!empty($pessoa['estado'])) $score += 2;
    if (!empty($pessoa['religiao'])) $score += 1;
    if (!empty($pessoa['indicacao'])) $score += 1;
    if (!empty($pessoa['observacao'])) $score += 1;
    
    // ID menor = cadastro mais antigo = maior score
    $score += (10000 - ($pessoa['id'] ?? 10000)) / 1000;
    
    return $score;
}

/**
 * Encontra campos conflitantes entre pessoas
 */
function findConflictingFields($pessoas) {
    if (count($pessoas) < 2) return [];
    
    $conflitos = [];
    $campos = ['nome', 'cpf', 'nascimento', 'religiao', 'cidade', 'estado', 'telefone', 'email', 'indicacao'];
    
    foreach ($campos as $campo) {
        $valores = [];
        foreach ($pessoas as $pessoa) {
            $valor = trim($pessoa[$campo] ?? '');
            if (!empty($valor) && $valor !== '000.000.000-00') {
                $valores[] = $valor;
            }
        }
        
        $valoresUnicos = array_unique($valores);
        if (count($valoresUnicos) > 1) {
            $conflitos[] = [
                'campo' => $campo,
                'valores' => $valoresUnicos,
                'quantidade' => count($valoresUnicos)
            ];
        }
    }
    
    return $conflitos;
}

/**
 * Obtém detalhes completos de um grupo de duplicatas
 */
function handleGetGrupoDetalhes($grupoId) {
    try {
        // Decodificar o ID do grupo para obter informações
        $pessoaIds = $_GET['pessoaIds'] ?? '';
        
        if (empty($pessoaIds)) {
            http_response_code(400);
            echo json_encode(['error' => 'pessoaIds é obrigatório']);
            return;
        }
        
        $ids = explode(',', $pessoaIds);
        $pessoas = [];
        
        foreach ($ids as $id) {
            $pessoa = db()->fetchOne("SELECT * FROM pessoas WHERE id = ?", [$id]);
            if ($pessoa) {
                // Buscar frequências da pessoa
                $frequencias = db()->fetchAll(
                    "SELECT id, tipo, numero_senha, data, numero_senha_tutor, numero_senha_pet, created_at 
                     FROM frequencias 
                     WHERE pessoa_id = ? 
                     ORDER BY data DESC, created_at DESC",
                    [$id]
                );
                
                $pessoa['frequencias'] = $frequencias;
                $pessoa['total_frequencias'] = count($frequencias);
                $pessoas[] = $pessoa;
            }
        }
        
        if (empty($pessoas)) {
            http_response_code(404);
            echo json_encode(['error' => 'Nenhuma pessoa encontrada']);
            return;
        }
        
        // Calcular estatísticas do grupo
        $totalFrequencias = 0;
        $pessoaComMaisFrequencias = null;
        $maxFrequencias = 0;
        
        foreach ($pessoas as $pessoa) {
            $totalFrequencias += $pessoa['total_frequencias'];
            if ($pessoa['total_frequencias'] > $maxFrequencias) {
                $maxFrequencias = $pessoa['total_frequencias'];
                $pessoaComMaisFrequencias = $pessoa;
            }
        }
        
        // Sugerir pessoa principal
        $pessoaPrincipalSugerida = suggestMainPerson($pessoas);
        
        // Encontrar campos conflitantes
        $camposConflitantes = findConflictingFields($pessoas);
        
        // Criar dados mesclados inteligentemente
        $dadosMesclados = mergePersonData($pessoas, $pessoaPrincipalSugerida);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'grupo_id' => $grupoId,
            'total_pessoas' => count($pessoas),
            'total_frequencias' => $totalFrequencias,
            'pessoa_principal_sugerida' => $pessoaPrincipalSugerida,
            'campos_conflitantes' => $camposConflitantes,
            'dados_mesclados' => $dadosMesclados,
            'pessoas' => $pessoas,
            'estatisticas' => [
                'pessoa_com_mais_frequencias' => $pessoaComMaisFrequencias ? $pessoaComMaisFrequencias['id'] : null,
                'max_frequencias' => $maxFrequencias,
                'media_frequencias' => count($pessoas) > 0 ? round($totalFrequencias / count($pessoas), 2) : 0
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Erro ao obter detalhes do grupo: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error' => 'Erro interno ao obter detalhes do grupo',
            'message' => $e->getMessage(),
            'code' => 'GROUP_DETAILS_ERROR'
        ]);
    }
}

/**
 * Mescla dados de pessoas para criar o registro mais completo possível
 */
function mergePersonData($pessoas, $pessoaPrincipalId) {
    if (empty($pessoas)) return [];
    
    // Encontrar pessoa principal
    $pessoaPrincipal = null;
    foreach ($pessoas as $pessoa) {
        if ($pessoa['id'] == $pessoaPrincipalId) {
            $pessoaPrincipal = $pessoa;
            break;
        }
    }
    
    if (!$pessoaPrincipal) {
        $pessoaPrincipal = $pessoas[0]; // Fallback para primeira pessoa
    }
    
    // Iniciar com dados da pessoa principal
    $dadosMesclados = [
        'nome' => $pessoaPrincipal['nome'],
        'cpf' => $pessoaPrincipal['cpf'],
        'nascimento' => $pessoaPrincipal['nascimento'],
        'religiao' => $pessoaPrincipal['religiao'],
        'cidade' => $pessoaPrincipal['cidade'],
        'estado' => $pessoaPrincipal['estado'],
        'telefone' => $pessoaPrincipal['telefone'],
        'email' => $pessoaPrincipal['email'],
        'indicacao' => $pessoaPrincipal['indicacao'],
        'observacao' => $pessoaPrincipal['observacao']
    ];
    
    // Mesclar com dados de outras pessoas para completar campos vazios
    foreach ($pessoas as $pessoa) {
        if ($pessoa['id'] == $pessoaPrincipalId) continue; // Pular pessoa principal
        
        // Para cada campo, usar o valor da pessoa secundária se o principal estiver vazio
        foreach ($dadosMesclados as $campo => $valor) {
            if (empty($valor) && !empty($pessoa[$campo])) {
                $dadosMesclados[$campo] = $pessoa[$campo];
            }
        }
    }
    
    // Lógica especial para campos específicos
    $dadosMesclados = applySmartMergeRules($dadosMesclados, $pessoas, $pessoaPrincipalId);
    
    return $dadosMesclados;
}

/**
 * Aplica regras inteligentes de mesclagem para campos específicos
 */
function applySmartMergeRules($dadosMesclados, $pessoas, $pessoaPrincipalId) {
    // 1. Nome: Usar o nome mais completo (mais palavras)
    $nomes = [];
    foreach ($pessoas as $pessoa) {
        if (!empty($pessoa['nome'])) {
            $nomes[] = $pessoa['nome'];
        }
    }
    
    if (!empty($nomes)) {
        // Ordenar por número de palavras (mais completo primeiro)
        usort($nomes, function($a, $b) {
            return str_word_count($b) - str_word_count($a);
        });
        $dadosMesclados['nome'] = $nomes[0];
    }
    
    // 2. CPF: Usar CPF válido (não 000.000.000-00)
    foreach ($pessoas as $pessoa) {
        if (!empty($pessoa['cpf']) && $pessoa['cpf'] !== '000.000.000-00') {
            $dadosMesclados['cpf'] = $pessoa['cpf'];
            break;
        }
    }
    
    // 3. Email: Usar email mais completo (com domínio real)
    $emails = [];
    foreach ($pessoas as $pessoa) {
        if (!empty($pessoa['email']) && filter_var($pessoa['email'], FILTER_VALIDATE_EMAIL)) {
            $emails[] = $pessoa['email'];
        }
    }
    
    if (!empty($emails)) {
        // Priorizar emails com domínios conhecidos
        $emailsPrioritarios = [];
        $emailsComuns = [];
        
        foreach ($emails as $email) {
            $domain = substr(strrchr($email, "@"), 1);
            if (in_array($domain, ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'])) {
                $emailsPrioritarios[] = $email;
            } else {
                $emailsComuns[] = $email;
            }
        }
        
        $dadosMesclados['email'] = !empty($emailsPrioritarios) ? $emailsPrioritarios[0] : $emails[0];
    }
    
    // 4. Telefone: Usar telefone com formato mais completo
    $telefones = [];
    foreach ($pessoas as $pessoa) {
        if (!empty($pessoa['telefone'])) {
            $telefones[] = $pessoa['telefone'];
        }
    }
    
    if (!empty($telefones)) {
        // Priorizar telefones com mais dígitos (mais completos)
        usort($telefones, function($a, $b) {
            $digitsA = preg_replace('/\D/', '', $a);
            $digitsB = preg_replace('/\D/', '', $b);
            return strlen($digitsB) - strlen($digitsA);
        });
        $dadosMesclados['telefone'] = $telefones[0];
    }
    
    // 5. Observações: Combinar observações de todas as pessoas
    $observacoes = [];
    foreach ($pessoas as $pessoa) {
        if (!empty($pessoa['observacao'])) {
            $observacoes[] = "ID {$pessoa['id']}: " . $pessoa['observacao'];
        }
    }
    
    if (!empty($observacoes)) {
        $dadosMesclados['observacao'] = implode(' | ', $observacoes);
    }
    
    // 6. Data de nascimento: Usar a data mais antiga (mais provável de estar correta)
    $nascimentos = [];
    foreach ($pessoas as $pessoa) {
        if (!empty($pessoa['nascimento']) && $pessoa['nascimento'] !== '0000-00-00') {
            $nascimentos[] = $pessoa['nascimento'];
        }
    }
    
    if (!empty($nascimentos)) {
        sort($nascimentos); // Ordenar cronologicamente
        $dadosMesclados['nascimento'] = $nascimentos[0];
    }
    
    return $dadosMesclados;
}
?>
