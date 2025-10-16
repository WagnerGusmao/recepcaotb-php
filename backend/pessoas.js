const express = require('express');
const router = express.Router();
const db = require('./database');

// Rota para buscar pessoas (pública para permitir busca no cadastro)
router.get('/', async (req, res) => {
    try {
        const { busca, limit } = req.query;
        
        let query = db('pessoas');
        
        if (busca) {
            // Se há termo de busca, aplicar filtros
            if (busca.trim().length < 2) {
                return res.status(400).json({ 
                    error: 'Termo de busca deve ter pelo menos 2 caracteres',
                    code: 'INVALID_SEARCH_TERM'
                });
            }
            
            const termoBusca = `%${busca.trim()}%`;
            query = query.where(function() {
                this.where('nome', 'like', termoBusca)
                    .orWhere('cpf', 'like', termoBusca)
                    .orWhere('cidade', 'like', termoBusca)
                    .orWhere('estado', 'like', termoBusca)
                    .orWhere('telefone', 'like', termoBusca)
                    .orWhere('email', 'like', termoBusca);
            });
            
            // Para buscas específicas, limitar a 50 resultados
            query = query.limit(50);
        } else if (limit) {
            // Se um limite específico foi fornecido, usar ele
            query = query.limit(parseInt(limit));
        }
        // Para relatórios sem busca, não aplicar limite (retornar todas as pessoas)
        
        const pessoas = await query;
        
        res.json(pessoas);
        
    } catch (error) {
        console.error('Erro na busca de pessoas:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            code: 'SEARCH_ERROR'
        });
    }
});

// Rota para criar uma nova pessoa (cadastro público)
router.post('/', async (req, res) => {
    try {
        const { nome, cpf, nascimento, religiao, cidade, estado, telefone, email, indicacao, observacao } = req.body;
        
        // Validações obrigatórias
        if (!nome || nome.trim() === '') {
            return res.status(400).json({ 
                error: 'Nome é obrigatório',
                code: 'VALIDATION_ERROR'
            });
        }
        
        // Verificar se CPF já existe (se fornecido)
        if (cpf && cpf.trim() !== '') {
            const cpfExistente = await db('pessoas').where('cpf', cpf.trim()).first();
            if (cpfExistente) {
                return res.status(409).json({ 
                    error: 'CPF já cadastrado',
                    code: 'CPF_EXISTS'
                });
            }
        }
        
        // Preparar dados para inserção (garantindo que campos obrigatórios não sejam null)
        const dadosPessoa = {
            nome: nome.trim(),
            cpf: (cpf && cpf.trim() !== '') ? cpf.trim() : '',
            nascimento: (nascimento && nascimento.trim() !== '') ? nascimento : null,
            religiao: (religiao && religiao.trim() !== '') ? religiao.trim() : '',
            cidade: (cidade && cidade.trim() !== '') ? cidade.trim() : '',
            estado: (estado && estado.trim() !== '') ? estado.trim() : '',
            telefone: (telefone && telefone.trim() !== '') ? telefone.trim() : '',
            email: (email && email.trim() !== '') ? email.trim() : '',
            indicacao: (indicacao && indicacao.trim() !== '') ? indicacao.trim() : '',
            observacao: (observacao && observacao.trim() !== '') ? observacao.trim() : ''
        };
        
        // Inserir no banco de dados
        const [pessoaId] = await db('pessoas').insert(dadosPessoa);
        
        // Buscar a pessoa criada
        const pessoaCriada = await db('pessoas').where('id', pessoaId).first();
        
        res.status(201).json({
            success: true,
            message: 'Pessoa cadastrada com sucesso',
            pessoa: pessoaCriada
        });
        
    } catch (error) {
        console.error('Erro ao cadastrar pessoa:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            code: 'CREATE_ERROR'
        });
    }
});

module.exports = router;
