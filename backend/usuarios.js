const express = require('express');
const { verificarAuth, verificarTipo, hashSenha } = require('./auth');
const db = require('./database');

const router = express.Router();

// Deletar usuário (apenas admins)
router.delete('/:id', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    const { id } = req.params;
    
    // Prevenir que o próprio usuário se delete
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário' });
    }
    
    // Usar transação do Knex para garantir integridade dos dados
    const trx = await db.transaction();
    
    try {
        // 1. Primeiro, remover as sessões do usuário
        await trx('sessoes').where('usuario_id', id).del();
        
        // 2. Depois, remover o usuário
        const deleted = await trx('usuarios').where('id', id).del();
        
        if (deleted === 0) {
            await trx.rollback();
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Se tudo deu certo, fazer commit
        await trx.commit();
        res.json({ message: 'Usuário removido com sucesso' });
        
    } catch (error) {
        await trx.rollback();
        console.error('Erro ao remover usuário:', error);
        res.status(500).json({ error: 'Erro ao remover usuário' });
    }
});

// Listar usuários (apenas admins)
router.get('/', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    try {
        const users = await db('usuarios as u')
            .leftJoin('pessoas as p', 'u.pessoa_id', 'p.id')
            .select(
                'u.id',
                'u.nome',
                'u.email',
                'u.tipo',
                'u.ativo',
                'u.created_at',
                'p.nome as pessoa_nome'
            )
            .orderBy('u.created_at', 'desc');
        
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar usuário (apenas admins)
router.post('/', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    try {
        const { nome, email, senha, tipo, pessoa_id } = req.body;
        
        // Validações básicas
        if (!nome || !email || !senha || !tipo) {
            return res.status(400).json({ error: 'Nome, email, senha e tipo são obrigatórios' });
        }
        
        if (!['geral', 'responsavel', 'administrador'].includes(tipo)) {
            return res.status(400).json({ error: 'Tipo inválido' });
        }
        
        if (senha.length < 4) {
            return res.status(400).json({ error: 'Senha deve ter pelo menos 4 caracteres' });
        }
        
        // Verificar se email já existe
        const emailExistente = await db('usuarios').where('email', email).first();
        if (emailExistente) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        
        // Gerar hash da senha
        const senhaHash = await hashSenha(senha);
        
        // Inserir usuário no banco
        const [usuarioId] = await db('usuarios').insert({
            nome,
            email,
            senha: senhaHash,
            tipo,
            pessoa_id: pessoa_id || null,
            ativo: 1,
            deve_trocar_senha: 1,
            created_at: new Date().toISOString()
        });
        
        res.status(201).json({ 
            id: usuarioId, 
            message: 'Usuário criado com sucesso' 
        });
        
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Editar perfil próprio (usuário logado)
router.put('/perfil', verificarAuth, async (req, res) => {
    try {
        const { nome, email, senhaAtual, novaSenha } = req.body;
        const usuarioId = req.user.id;
        
        if (!nome || !email) {
            return res.status(400).json({ error: 'Nome e email são obrigatórios' });
        }
        
        // Como o usuário já passou pela autenticação, ele existe no sistema
        // Vamos buscar os dados atuais apenas para verificação de senha (se necessário)
        
        // Verificar se email já está sendo usado por outro usuário
        const emailExistente = await db('usuarios')
            .where('email', email.toLowerCase())
            .where('id', '!=', usuarioId)
            .first();
        
        if (emailExistente) {
            return res.status(400).json({ error: 'Este email já está sendo usado por outro usuário' });
        }
        
        let dadosAtualizacao = {
            nome,
            email: email.toLowerCase()
        };
        
        // Se está tentando alterar senha, verificar senha atual
        if (novaSenha) {
            if (!senhaAtual) {
                return res.status(400).json({ error: 'Senha atual é obrigatória para alterar senha' });
            }
            
            if (novaSenha.length < 4) {
                return res.status(400).json({ error: 'Nova senha deve ter pelo menos 4 caracteres' });
            }
            
            // Buscar dados do usuário para verificar senha atual
            const usuarioAtual = await db('usuarios').where('id', usuarioId).first();
            if (!usuarioAtual) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            
            const bcrypt = require('bcrypt');
            const senhaValida = await bcrypt.compare(senhaAtual, usuarioAtual.senha);
            
            if (!senhaValida) {
                return res.status(401).json({ error: 'Senha atual incorreta' });
            }
            
            // Adicionar nova senha aos dados de atualização
            const senhaHash = await hashSenha(novaSenha);
            dadosAtualizacao.senha = senhaHash;
        }
        
        // Atualizar no banco
        const updated = await db('usuarios')
            .where('id', usuarioId)
            .update(dadosAtualizacao);
        
        if (updated > 0) {
            // Se alterou senha, invalidar outras sessões
            if (novaSenha) {
                try {
                    const tokenAtual = req.headers.authorization?.replace('Bearer ', '');
                    await db('sessoes')
                        .where('usuario_id', usuarioId)
                        .where('token', '!=', tokenAtual)
                        .del();
                    console.log(`Outras sessões do usuário ${usuarioId} invalidadas`);
                } catch (err) {
                    console.error('Erro ao invalidar outras sessões:', err);
                    // Não interromper o fluxo por esse erro
                }
                
                res.json({ message: 'Perfil e senha atualizados com sucesso!' });
            } else {
                res.json({ message: 'Perfil atualizado com sucesso!' });
            }
        } else {
            res.status(500).json({ error: 'Falha ao atualizar perfil' });
        }
        
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar usuário (apenas admins)
router.put('/:id', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, tipo, ativo } = req.body;
        
        // Verificar se o usuário existe
        const usuarioExistente = await db('usuarios').where('id', id).first();
        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Atualizar usuário
        const updated = await db('usuarios')
            .where('id', id)
            .update({
                nome,
                email,
                tipo,
                ativo: ativo ? 1 : 0 // Converter boolean para integer
            });
        
        if (updated > 0) {
            res.json({ message: 'Usuário atualizado com sucesso' });
        } else {
            res.status(500).json({ error: 'Falha ao atualizar usuário' });
        }
        
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Resetar senha de usuário (apenas admins)
router.put('/:id/reset-senha', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    try {
        const { id } = req.params;
        const { novaSenha } = req.body;
        
        if (!novaSenha || novaSenha.length < 4) {
            return res.status(400).json({ error: 'Nova senha deve ter pelo menos 4 caracteres' });
        }
        
        // Verificar se o usuário existe
        const usuarioExistente = await db('usuarios').where('id', id).first();
        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Gerar hash da nova senha
        const senhaHash = await hashSenha(novaSenha);
        
        // Atualizar senha no banco
        const updated = await db('usuarios')
            .where('id', id)
            .update({
                senha: senhaHash,
                deve_trocar_senha: 1
            });
        
        if (updated > 0) {
            // Invalidar todas as sessões do usuário
            try {
                await db('sessoes').where('usuario_id', id).del();
                console.log(`Sessões do usuário ${id} invalidadas`);
            } catch (err) {
                console.error('Erro ao invalidar sessões:', err);
                // Não interromper o fluxo por esse erro
            }
            
            res.json({ 
                message: 'Senha resetada com sucesso. O usuário precisará fazer login novamente e trocar a senha.' 
            });
        } else {
            res.status(500).json({ error: 'Falha ao atualizar senha' });
        }
        
    } catch (error) {
        console.error('Erro ao resetar senha:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Trocar senha obrigatória (usuário logado)
router.put('/trocar-senha-obrigatoria', verificarAuth, async (req, res) => {
    const { senhaAtual, novaSenha } = req.body;
    const usuarioId = req.user.id;
    
    if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }
    
    if (novaSenha.length < 4) {
        return res.status(400).json({ error: 'Nova senha deve ter pelo menos 4 caracteres' });
    }
    
    try {
        // Verificar senha atual
        const bcrypt = require('bcrypt');
        const senhaValida = await bcrypt.compare(senhaAtual, req.user.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ error: 'Senha atual incorreta' });
        }
        
        // Hash da nova senha
        const senhaHash = await hashSenha(novaSenha);
        
        // Atualizar senha e remover flag de trocar senha
        const updated = await db('usuarios')
            .where('id', usuarioId)
            .update({
                senha: senhaHash,
                deve_trocar_senha: false
            });
            
        if (updated > 0) {
            // Invalidar todas as outras sessões (manter apenas a atual)
            try {
                const tokenAtual = req.headers.authorization?.replace('Bearer ', '');
                await db('sessoes')
                    .where('usuario_id', usuarioId)
                    .where('token', '!=', tokenAtual)
                    .del();
                console.log(`Outras sessões do usuário ${usuarioId} invalidadas`);
            } catch (err) {
                console.error('Erro ao invalidar outras sessões:', err);
                // Não interromper o fluxo por esse erro
            }
            
            res.json({ message: 'Senha alterada com sucesso!' });
        } else {
            res.status(500).json({ error: 'Falha ao atualizar senha' });
        }
    } catch (error) {
        console.error('Erro ao trocar senha:', error);
        return res.status(500).json({ error: 'Erro ao processar nova senha' });
    }
});


// Buscar pessoas para vincular a usuário
router.get('/pessoas-disponiveis', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    try {
        const pessoas = await db('pessoas as p')
            .leftJoin('usuarios as u', 'p.id', 'u.pessoa_id')
            .whereNull('u.pessoa_id')
            .select('p.id', 'p.nome', 'p.email')
            .orderBy('p.nome');
            
        res.json(pessoas);
    } catch (error) {
        console.error('Erro ao buscar pessoas disponíveis:', error);
        res.status(500).json({ error: 'Erro ao buscar pessoas disponíveis' });
    }
});

module.exports = router;