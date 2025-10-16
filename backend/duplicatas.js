const express = require('express');
const { verificarAuth, verificarTipo } = require('./auth');
const db = require('./database');

const router = express.Router();

// Cache simples para análise de duplicatas (expira em 10 minutos)
const cacheAnalise = {
    dados: null,
    timestamp: null,
    threshold: null,
    expirar: 10 * 60 * 1000 // 10 minutos em millisegundos
};

// Função para verificar se o cache é válido
function cacheValido(threshold) {
    if (!cacheAnalise.dados || !cacheAnalise.timestamp) return false;
    
    const agora = Date.now();
    const expirou = (agora - cacheAnalise.timestamp) > cacheAnalise.expirar;
    const thresholdMudou = cacheAnalise.threshold !== parseFloat(threshold);
    
    return !expirou && !thresholdMudou;
}

// Função para limpar cache quando dados são modificados
function limparCache() {
    cacheAnalise.dados = null;
    cacheAnalise.timestamp = null;
    cacheAnalise.threshold = null;
    console.log('[CACHE] Cache de duplicatas limpo');
}

// Função para calcular similaridade entre strings (Levenshtein Distance)
function calcularSimilaridade(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1.0;
    
    const matrix = [];
    const len1 = s1.length;
    const len2 = s2.length;
    
    for (let i = 0; i <= len2; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= len1; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len2; i++) {
        for (let j = 1; j <= len1; j++) {
            if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1.0 : (maxLen - matrix[len2][len1]) / maxLen;
}

// Função para normalizar nome (remover acentos, espaços extras, etc.)
function normalizarNome(nome) {
    return nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/\s+/g, ' ') // Remove espaços extras
        .trim();
}

// Detectar duplicatas (apenas administradores) - Com cache otimizado
router.get('/', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    const { threshold = 0.85, forceRefresh = false } = req.query; // Limiar de similaridade (85% por padrão)
    
    try {
        // Verificar se pode usar cache (exceto se forceRefresh for true)
        if (!forceRefresh && cacheValido(threshold)) {
            console.log('[CACHE] Usando dados em cache para análise de duplicatas');
            return res.json({
                ...cacheAnalise.dados,
                cache_usado: true,
                cache_timestamp: new Date(cacheAnalise.timestamp).toLocaleString('pt-BR')
            });
        }
        
        console.log('[CACHE] Cache inválido ou expirado, gerando nova análise');
        
        // Marcar início do processamento
        const inicioProcessamento = Date.now();
        
        // Buscar todas as pessoas
        const inicioBusca = Date.now();
        const pessoas = await db('pessoas').orderBy('nome');
        const tempoBusca = Date.now() - inicioBusca;
        
        console.log(`[ANÁLISE] ${pessoas.length} pessoas encontradas em ${tempoBusca}ms`);
        
        // Calcular estimativa de tempo baseada no número de pessoas
        const totalComparacoes = (pessoas.length * (pessoas.length - 1)) / 2;
        const estimativaMs = Math.ceil(totalComparacoes * 0.1); // ~0.1ms por comparação
        const estimativaSegundos = Math.ceil(estimativaMs / 1000);
        const estimativaMinutos = Math.ceil(estimativaSegundos / 60);
        
        let estimativaTexto;
        if (estimativaSegundos < 60) {
            estimativaTexto = `${estimativaSegundos} segundos`;
        } else if (estimativaMinutos < 10) {
            estimativaTexto = `${estimativaMinutos} minutos`;
        } else {
            estimativaTexto = `${estimativaMinutos} minutos (processo longo)`;
        }
        
        console.log(`[ANÁLISE] Estimativa de processamento: ${estimativaTexto} (${totalComparacoes.toLocaleString()} comparações)`);
        
        const duplicatas = [];
        const processados = new Set();
        let comparacoesRealizadas = 0;
        let gruposEncontrados = 0;
        
        // Progresso a cada 10% do processamento
        const intervalosProgresso = Math.ceil(pessoas.length / 10);
        let proximoProgresso = intervalosProgresso;
        
        for (let i = 0; i < pessoas.length; i++) {
            if (processados.has(pessoas[i].id)) continue;
            
            // Log de progresso
            if (i >= proximoProgresso) {
                const progresso = Math.round((i / pessoas.length) * 100);
                const tempoDecorrido = Date.now() - inicioProcessamento;
                const tempoRestanteEstimado = (tempoDecorrido / (i / pessoas.length)) - tempoDecorrido;
                const minutosRestantes = Math.ceil(tempoRestanteEstimado / 60000);
                
                console.log(`[ANÁLISE] Progresso: ${progresso}% (${gruposEncontrados} grupos encontrados) - Tempo restante estimado: ${minutosRestantes}min`);
                proximoProgresso += intervalosProgresso;
            }
            
            const grupo = [pessoas[i]];
            processados.add(pessoas[i].id);
            
            for (let j = i + 1; j < pessoas.length; j++) {
                if (processados.has(pessoas[j].id)) continue;
                
                comparacoesRealizadas++;
                const similaridade = calcularSimilaridade(
                    normalizarNome(pessoas[i].nome),
                    normalizarNome(pessoas[j].nome)
                );
                
                if (similaridade >= parseFloat(threshold)) {
                    grupo.push(pessoas[j]);
                    processados.add(pessoas[j].id);
                }
            }
            
            if (grupo.length > 1) {
                gruposEncontrados++;
                
                // Buscar frequências para cada pessoa do grupo
                const inicioFrequencias = Date.now();
                const grupoComFrequencias = await Promise.all(
                    grupo.map(async (pessoa) => {
                        try {
                            const result = await db('frequencias')
                                .where('pessoa_id', pessoa.id)
                                .count('* as total')
                                .first();
                            
                            return {
                                ...pessoa,
                                total_frequencias: result?.total || 0
                            };
                        } catch (error) {
                            console.error('Erro ao buscar frequências:', error);
                            return {
                                ...pessoa,
                                total_frequencias: 0
                            };
                        }
                    })
                );
                const tempoFrequencias = Date.now() - inicioFrequencias;
                
                // Calcular similaridade média
                const similaridade_media = grupo.length > 1 ? 
                    grupo.reduce((acc, p, idx) => {
                        if (idx === 0) return acc;
                        return acc + calcularSimilaridade(
                            normalizarNome(grupo[0].nome),
                            normalizarNome(p.nome)
                        );
                    }, 0) / (grupo.length - 1) : 1.0;
                
                duplicatas.push({
                    id: `grupo_${i}`,
                    pessoas: grupoComFrequencias,
                    similaridade_media: similaridade_media,
                    tempo_busca_frequencias_ms: tempoFrequencias
                });
            }
        }
        
        const tempoTotalProcessamento = Date.now() - inicioProcessamento;
        const tempoTotalSegundos = Math.round(tempoTotalProcessamento / 1000);
        const tempoTotalMinutos = Math.round(tempoTotalSegundos / 60);
        
        console.log(`[ANÁLISE] Processamento concluído em ${tempoTotalSegundos}s (${comparacoesRealizadas.toLocaleString()} comparações realizadas)`);
        
        // Calcular estatísticas de performance
        const mediaComparacoesPorSegundo = Math.round(comparacoesRealizadas / (tempoTotalProcessamento / 1000));
        const eficienciaProcessamento = Math.round((comparacoesRealizadas / totalComparacoes) * 100);
        
        const resultado = {
            total_grupos: duplicatas.length,
            total_pessoas_duplicadas: duplicatas.reduce((acc, grupo) => acc + grupo.pessoas.length, 0),
            total_pessoas_analisadas: pessoas.length,
            threshold_usado: parseFloat(threshold),
            grupos: duplicatas.sort((a, b) => b.similaridade_media - a.similaridade_media),
            cache_usado: false,
            gerado_em: new Date().toLocaleString('pt-BR'),
            estatisticas_processamento: {
                tempo_total_ms: tempoTotalProcessamento,
                tempo_total_segundos: tempoTotalSegundos,
                tempo_total_minutos: tempoTotalMinutos,
                tempo_busca_pessoas_ms: tempoBusca,
                comparacoes_realizadas: comparacoesRealizadas,
                comparacoes_totais_possiveis: totalComparacoes,
                media_comparacoes_por_segundo: mediaComparacoesPorSegundo,
                eficiencia_processamento_pct: eficienciaProcessamento,
                estimativa_inicial: estimativaTexto,
                precisao_estimativa: tempoTotalSegundos <= estimativaSegundos * 1.2 ? 'boa' : 'imprecisa'
            }
        };
        
        // Armazenar no cache
        cacheAnalise.dados = resultado;
        cacheAnalise.timestamp = Date.now();
        cacheAnalise.threshold = parseFloat(threshold);
        console.log(`[CACHE] Resultado armazenado no cache (${duplicatas.length} grupos em ${tempoTotalSegundos}s)`);
        
        res.json(resultado);
        
    } catch (error) {
        console.error('Erro ao detectar duplicatas:', error);
        res.status(500).json({ error: 'Erro ao analisar duplicatas: ' + error.message });
    }
});

// Mesclar pessoas (apenas administradores) - Versão otimizada
router.post('/mesclar', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    console.log('[MESCLAGEM] Recebida requisição de mesclagem:', JSON.stringify(req.body, null, 2));
    
    const { pessoa_principal_id, pessoas_secundarias_ids, dados_mesclados } = req.body;
    
    // Validações mais detalhadas
    if (!pessoa_principal_id) {
        console.log('[MESCLAGEM] Erro: pessoa_principal_id não fornecido');
        return res.status(400).json({ error: 'ID da pessoa principal não fornecido' });
    }
    
    if (!pessoas_secundarias_ids) {
        console.log('[MESCLAGEM] Erro: pessoas_secundarias_ids não fornecido');
        return res.status(400).json({ error: 'IDs das pessoas secundárias não fornecidos' });
    }
    
    if (!Array.isArray(pessoas_secundarias_ids)) {
        console.log('[MESCLAGEM] Erro: pessoas_secundarias_ids não é um array');
        return res.status(400).json({ error: 'IDs das pessoas secundárias deve ser um array' });
    }
    
    if (pessoas_secundarias_ids.length === 0) {
        console.log('[MESCLAGEM] Erro: array de pessoas secundárias está vazio');
        return res.status(400).json({ error: 'Nenhuma pessoa secundária especificada' });
    }
    
    // Verificar se a pessoa principal não está na lista de secundárias
    if (pessoas_secundarias_ids.includes(pessoa_principal_id)) {
        console.log('[MESCLAGEM] Erro: pessoa principal está na lista de secundárias');
        return res.status(400).json({ error: 'A pessoa principal não pode estar na lista de pessoas secundárias' });
    }
    
    // Limitar número de mesclagens simultâneas para evitar sobrecarga
    if (pessoas_secundarias_ids.length > 10) {
        return res.status(400).json({ 
            error: 'Limite excedido: máximo 10 pessoas podem ser mescladas por vez',
            sugestao: 'Divida a operação em lotes menores'
        });
    }
    
    try {
        console.log(`[MESCLAGEM] Iniciando mesclagem: Principal=${pessoa_principal_id}, Secundárias=[${pessoas_secundarias_ids.join(',')}]`);
        
        // Função auxiliar para executar queries com Promise e timeout usando Knex
        const runQuery = async (queryBuilder, timeout = 10000) => {
            return Promise.race([
                queryBuilder,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Query timeout: operação demorou mais que ' + timeout + 'ms')), timeout)
                )
            ]);
        };
        
        // Função para executar SELECT com timeout usando Knex
        const selectQuery = async (queryBuilder, timeout = 5000) => {
            return Promise.race([
                queryBuilder,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Select timeout: consulta demorou mais que ' + timeout + 'ms')), timeout)
                )
            ]);
        };
        
        // Verificar se todas as pessoas existem antes de iniciar
        const pessoasExistentes = await selectQuery(
            db('pessoas')
                .select('id')
                .whereIn('id', [pessoa_principal_id, ...pessoas_secundarias_ids])
        );
        
        if (pessoasExistentes.length !== pessoas_secundarias_ids.length + 1) {
            return res.status(400).json({ error: 'Uma ou mais pessoas não foram encontradas' });
        }
        
        // Contar frequências antes da mesclagem para relatório
        const frequenciasAntes = await selectQuery(
            db('frequencias')
                .select('pessoa_id')
                .count('* as total')
                .whereIn('pessoa_id', [pessoa_principal_id, ...pessoas_secundarias_ids])
                .groupBy('pessoa_id')
        );
        
        const totalFrequencias = frequenciasAntes.reduce((acc, f) => acc + parseInt(f.total), 0);
        
        // Iniciar transação com Knex
        const trx = await db.transaction();
        
        try {
            console.log('[MESCLAGEM] Transação iniciada');
            
            // 1. Atualizar dados da pessoa principal com os dados mesclados
            if (dados_mesclados) {
                const { nome, cpf, nascimento, religiao, cidade, estado, telefone, email, indicacao, observacao } = dados_mesclados;
                
                console.log('[MESCLAGEM] Atualizando dados da pessoa principal');
                await runQuery(
                    trx('pessoas')
                        .where('id', pessoa_principal_id)
                        .update({
                            nome, cpf, nascimento, religiao, cidade, estado, 
                            telefone, email, indicacao, observacao
                        }),
                    8000
                );
            }
            
            // 2. Transferir frequências em lotes para melhor performance
            console.log('[MESCLAGEM] Transferindo frequências');
            const loteSize = 3; // Processar 3 pessoas por vez
            
            for (let i = 0; i < pessoas_secundarias_ids.length; i += loteSize) {
                const lote = pessoas_secundarias_ids.slice(i, i + loteSize);
                
                // Transferir frequências do lote atual
                await runQuery(
                    trx('frequencias')
                        .whereIn('pessoa_id', lote)
                        .update({
                            pessoa_id: pessoa_principal_id
                        }),
                    10000
                );
                
                console.log(`[MESCLAGEM] Lote ${Math.floor(i/loteSize) + 1} processado (${lote.length} pessoas)`);
            }
            
            // 3. Remover pessoas secundárias em lotes
            console.log('[MESCLAGEM] Removendo pessoas secundárias');
            for (let i = 0; i < pessoas_secundarias_ids.length; i += loteSize) {
                const lote = pessoas_secundarias_ids.slice(i, i + loteSize);
                
                await runQuery(
                    trx('pessoas').whereIn('id', lote).del(),
                    8000
                );
            }
            
            // 4. Confirmar transação
            console.log('[MESCLAGEM] Confirmando transação');
            await trx.commit();
            
            console.log('[MESCLAGEM] Mesclagem concluída com sucesso');
            
            // Limpar cache pois os dados foram modificados
            limparCache();
            
            res.json({ 
                message: 'Mesclagem realizada com sucesso',
                pessoa_principal_id,
                pessoas_removidas: pessoas_secundarias_ids.length,
                total_frequencias_transferidas: totalFrequencias,
                tempo_processamento: 'Otimizado com processamento em lotes',
                detalhes: {
                    lotes_processados: Math.ceil(pessoas_secundarias_ids.length / loteSize),
                    pessoas_por_lote: loteSize
                }
            });
            
        } catch (error) {
            console.log('[MESCLAGEM] Erro durante transação, fazendo rollback');
            await trx.rollback();
            throw error;
        }
        
    } catch (error) {
        console.error('Erro na mesclagem:', error);
        
        // Erro mais específico baseado no tipo
        let mensagemErro = 'Erro durante a mesclagem: ' + error.message;
        if (error.message.includes('timeout')) {
            mensagemErro = 'Operação demorou muito para ser concluída. Tente com menos pessoas por vez.';
        } else if (error.message.includes('SQLITE_BUSY')) {
            mensagemErro = 'Banco de dados ocupado. Tente novamente em alguns segundos.';
        }
        
        res.status(500).json({ 
            error: mensagemErro,
            tipo_erro: error.message.includes('timeout') ? 'timeout' : 'database',
            sugestao: 'Tente processar menos pessoas por vez (máximo 7 recomendado)'
        });
    }
});

// Visualizar detalhes de um grupo de duplicatas
router.get('/grupo/:grupoId', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    const { pessoaIds } = req.query; // IDs separados por vírgula
    
    if (!pessoaIds) {
        return res.status(400).json({ error: 'IDs das pessoas não fornecidos' });
    }
    
    const ids = pessoaIds.split(',').map(id => parseInt(id));
    const placeholders = ids.map(() => '?').join(',');
    
    // Buscar dados das pessoas usando Knex
    try {
        const pessoas = await db('pessoas').whereIn('id', ids);
        
        // Buscar frequências de cada pessoa
        const pessoasComDetalhes = await Promise.all(
            pessoas.map(async (pessoa) => {
                try {
                    const frequencias = await db('frequencias')
                        .where('pessoa_id', pessoa.id)
                        .orderBy('data', 'desc');
                    
                    return {
                        ...pessoa,
                        frequencias: frequencias || [],
                        total_frequencias: frequencias ? frequencias.length : 0
                    };
                } catch (error) {
                    console.error('Erro ao buscar frequências:', error);
                    return {
                        ...pessoa,
                        frequencias: [],
                        total_frequencias: 0
                    };
                }
            })
        );
        
        res.json({
            grupo_id: req.params.grupoId,
            pessoas: pessoasComDetalhes,
            total_pessoas: pessoasComDetalhes.length,
            sugestao_mesclagem: gerarSugestaoMesclagem(pessoasComDetalhes)
        });
        
    } catch (error) {
        console.error('Erro ao visualizar grupo:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes: ' + error.message });
    }
});

// Função para gerar sugestão de mesclagem
function gerarSugestaoMesclagem(pessoas) {
    if (pessoas.length === 0) return null;
    
    // Pessoa com mais frequências como principal
    const pessoaPrincipal = pessoas.reduce((prev, current) => 
        (current.total_frequencias > prev.total_frequencias) ? current : prev
    );
    
    // Mesclar dados (priorizar dados mais completos)
    const dadosMesclados = {
        nome: pessoaPrincipal.nome, // Manter nome da pessoa principal
        cpf: pessoas.find(p => p.cpf && p.cpf.trim())?.cpf || pessoaPrincipal.cpf,
        nascimento: pessoas.find(p => p.nascimento)?.nascimento || pessoaPrincipal.nascimento,
        religiao: pessoas.find(p => p.religiao && p.religiao.trim())?.religiao || pessoaPrincipal.religiao,
        cidade: pessoas.find(p => p.cidade && p.cidade.trim())?.cidade || pessoaPrincipal.cidade,
        estado: pessoas.find(p => p.estado && p.estado.trim())?.estado || pessoaPrincipal.estado,
        telefone: pessoas.find(p => p.telefone && p.telefone.trim())?.telefone || pessoaPrincipal.telefone,
        email: pessoas.find(p => p.email && p.email.trim())?.email || pessoaPrincipal.email,
        indicacao: pessoas.find(p => p.indicacao && p.indicacao.trim())?.indicacao || pessoaPrincipal.indicacao,
        observacao: pessoas.map(p => p.observacao).filter(obs => obs && obs.trim()).join(' | ') || pessoaPrincipal.observacao
    };
    
    return {
        pessoa_principal: pessoaPrincipal,
        pessoas_secundarias: pessoas.filter(p => p.id !== pessoaPrincipal.id),
        dados_mesclados: dadosMesclados,
        total_frequencias_transferidas: pessoas.reduce((acc, p) => acc + p.total_frequencias, 0) - pessoaPrincipal.total_frequencias
    };
}

// Nova rota para mesclagem em lotes (recomendado para muitas duplicatas)
router.post('/mesclar-lote', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    const { mesclagens } = req.body; // Array de mesclagens: [{pessoa_principal_id, pessoas_secundarias_ids, dados_mesclados}]
    
    if (!mesclagens || !Array.isArray(mesclagens) || mesclagens.length === 0) {
        return res.status(400).json({ error: 'Lista de mesclagens não fornecida' });
    }
    
    // Limitar número de mesclagens em lote
    if (mesclagens.length > 5) {
        return res.status(400).json({ 
            error: 'Limite excedido: máximo 5 mesclagens por lote',
            sugestao: 'Processe em lotes menores para melhor performance'
        });
    }
    
    const resultados = [];
    let sucessos = 0;
    let erros = 0;
    
    try {
        console.log(`[LOTE] Iniciando processamento de ${mesclagens.length} mesclagens`);
        
        for (let i = 0; i < mesclagens.length; i++) {
            const mesclagem = mesclagens[i];
            console.log(`[LOTE] Processando mesclagem ${i + 1}/${mesclagens.length}`);
            
            try {
                // Fazer requisição interna para a rota de mesclagem individual
                const resultado = await processarMesclagemIndividual(mesclagem);
                resultados.push({
                    indice: i,
                    sucesso: true,
                    pessoa_principal_id: mesclagem.pessoa_principal_id,
                    pessoas_removidas: mesclagem.pessoas_secundarias_ids.length,
                    detalhes: resultado
                });
                sucessos++;
                
            } catch (error) {
                console.error(`[LOTE] Erro na mesclagem ${i + 1}:`, error.message);
                resultados.push({
                    indice: i,
                    sucesso: false,
                    pessoa_principal_id: mesclagem.pessoa_principal_id,
                    erro: error.message
                });
                erros++;
            }
            
            // Pequena pausa entre mesclagens para não sobrecarregar
            if (i < mesclagens.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        console.log(`[LOTE] Processamento concluído: ${sucessos} sucessos, ${erros} erros`);
        
        res.json({
            message: `Lote processado: ${sucessos} sucessos, ${erros} erros`,
            total_processado: mesclagens.length,
            sucessos,
            erros,
            resultados,
            recomendacao: erros > 0 ? 'Verifique os erros e tente reprocessar as mesclagens que falharam' : null
        });
        
    } catch (error) {
        console.error('[LOTE] Erro geral no processamento:', error);
        res.status(500).json({ 
            error: 'Erro no processamento do lote: ' + error.message,
            resultados_parciais: resultados
        });
    }
});

// Função auxiliar para processar mesclagem individual (reutiliza lógica da rota principal)
async function processarMesclagemIndividual(mesclagem) {
    const { pessoa_principal_id, pessoas_secundarias_ids, dados_mesclados } = mesclagem;
    
    // Validações básicas
    if (!pessoa_principal_id || !pessoas_secundarias_ids || !Array.isArray(pessoas_secundarias_ids)) {
        throw new Error('Dados inválidos para mesclagem');
    }
    
    if (pessoas_secundarias_ids.length === 0) {
        throw new Error('Nenhuma pessoa secundária especificada');
    }
    
    if (pessoas_secundarias_ids.length > 7) {
        throw new Error('Muitas pessoas para mesclar de uma vez (máximo 7)');
    }
    
    // Função auxiliar para executar queries com Promise e timeout usando Knex
    const runQuery = async (queryBuilder, timeout = 8000) => {
        return Promise.race([
            queryBuilder,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Query timeout')), timeout)
            )
        ]);
    };
    
    // Iniciar transação com Knex
    const trx = await db.transaction();
    
    try {
        // 1. Atualizar dados da pessoa principal
        if (dados_mesclados) {
            const { nome, cpf, nascimento, religiao, cidade, estado, telefone, email, indicacao, observacao } = dados_mesclados;
            
            await runQuery(
                trx('pessoas')
                    .where('id', pessoa_principal_id)
                    .update({
                        nome, cpf, nascimento, religiao, cidade, estado, 
                        telefone, email, indicacao, observacao
                    }),
                10000
            );
        }
        
        // 2. Transferir frequências em lotes pequenos
        const loteSize = 2;
        for (let i = 0; i < pessoas_secundarias_ids.length; i += loteSize) {
            const lote = pessoas_secundarias_ids.slice(i, i + loteSize);
            
            await runQuery(
                trx('frequencias')
                    .whereIn('pessoa_id', lote)
                    .update({
                        pessoa_id: pessoa_principal_id
                    }),
                8000
            );
        }
        
        // 3. Remover pessoas secundárias
        for (let i = 0; i < pessoas_secundarias_ids.length; i += loteSize) {
            const lote = pessoas_secundarias_ids.slice(i, i + loteSize);
            
            await runQuery(
                trx('pessoas').whereIn('id', lote).del(),
                8000
            );
        }
        
        // 4. Confirmar transação
        await trx.commit();
        
        return {
            pessoa_principal_id,
            pessoas_removidas: pessoas_secundarias_ids.length,
            processamento: 'otimizado'
        };
        
    } catch (error) {
        await trx.rollback();
        throw error;
    }
}

// Rota para obter estatísticas de performance
router.get('/stats', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    try {
        const [totalPessoas, totalFrequencias, pessoasComFrequencia] = await Promise.all([
            db('pessoas').count('* as total').first(),
            db('frequencias').count('* as total').first(),
            db('frequencias').countDistinct('pessoa_id as total').first()
        ]);
        
        const stats = {
            total_pessoas: totalPessoas.total,
            total_frequencias: totalFrequencias.total,
            pessoas_com_frequencia: pessoasComFrequencia.total
        };
        
        // Informações do cache
        const cacheInfo = {
            cache_ativo: cacheAnalise.dados !== null,
            cache_timestamp: cacheAnalise.timestamp ? new Date(cacheAnalise.timestamp).toLocaleString('pt-BR') : null,
            cache_threshold: cacheAnalise.threshold,
            cache_expira_em: cacheAnalise.timestamp ? 
                Math.max(0, Math.round((cacheAnalise.expirar - (Date.now() - cacheAnalise.timestamp)) / 1000)) : 0
        };
        
        res.json({
            ...stats,
            cache: cacheInfo,
            recomendacoes: {
                max_mesclagem_simultanea: 7,
                lote_recomendado: 3,
                timeout_sugerido: '10 segundos',
                cache_duracao: '10 minutos'
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter estatísticas: ' + error.message });
    }
});

// Rota para limpar cache manualmente
router.delete('/cache', verificarAuth, verificarTipo(['administrador']), (req, res) => {
    const cacheAtivo = cacheAnalise.dados !== null;
    limparCache();
    
    res.json({
        message: 'Cache limpo com sucesso',
        cache_estava_ativo: cacheAtivo,
        timestamp: new Date().toLocaleString('pt-BR')
    });
});

module.exports = router;
