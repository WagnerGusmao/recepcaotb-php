const express = require('express');
const { verificarAuth, verificarTipo, hashSenha } = require('./auth');
const db = require('./database');

const router = express.Router();

// Deletar usuário (apenas admins)
router.delete('/:id', verificarAuth, verificarTipo(['administrador']), (req, res) => {
    const { id } = req.params;
    
    // Prevenir que o próprio usuário se delete
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário' });
    }
    
    // Iniciar transação para garantir integridade dos dados
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // 1. Primeiro, remover as sessões do usuário
        db.run('DELETE FROM sessoes WHERE usuario_id = ?', [id], function(err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Erro ao remover sessões do usuário' });
            }
            
            // 2. Depois, remover o usuário
            db.run('DELETE FROM usuarios WHERE id = ?', [id], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Erro ao remover usuário' });
                }
                
                if (this.changes === 0) {
                    db.run('ROLLBACK');
                    return res.status(404).json({ error: 'Usuário não encontrado' });
                }
                
                // Se tudo deu certo, fazer commit
                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('Erro ao fazer commit da transação:', err);
                        return res.status(500).json({ error: 'Erro ao finalizar operação' });
                    }
                    res.json({ message: 'Usuário removido com sucesso' });
                });
            });
        });
    });
});

// Listar usuários (apenas admins)
router.get('/', verificarAuth, verificarTipo(['administrador']), (req, res) => {
    db.all(`SELECT u.id, u.nome, u.email, u.tipo, u.ativo, u.created_at, p.nome as pessoa_nome
            FROM usuarios u 
            LEFT JOIN pessoas p ON u.pessoa_id = p.id
            ORDER BY u.created_at DESC`, (err, users) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(users);
    });
});

// Criar usuário (apenas admins)
router.post('/', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    const { nome, email, senha, tipo, pessoa_id } = req.body;
    
    if (!['geral', 'responsavel', 'administrador'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo inválido' });
    }
    
    try {
        const senhaHash = await hashSenha(senha);
        
        db.run(`INSERT INTO usuarios (nome, email, senha, tipo, pessoa_id) 
                VALUES (?, ?, ?, ?, ?)`,
                [nome, email, senhaHash, tipo, pessoa_id || null], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email já cadastrado' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, message: 'Usuário criado com sucesso' });
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        return res.status(500).json({ error: 'Erro ao processar senha' });
    }
});

// Atualizar usuário (apenas admins)
router.put('/:id', verificarAuth, verificarTipo(['administrador']), (req, res) => {
    const { id } = req.params;
    const { nome, email, tipo, ativo } = req.body;
    
    db.run(`UPDATE usuarios SET nome=?, email=?, tipo=?, ativo=? WHERE id=?`,
            [nome, email, tipo, ativo, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Usuário atualizado com sucesso' });
    });
});

// Resetar senha de usuário (apenas admins)
router.put('/:id/reset-senha', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    const { id } = req.params;
    const { novaSenha } = req.body;
    
    if (!novaSenha || novaSenha.length < 4) {
        return res.status(400).json({ error: 'Nova senha deve ter pelo menos 4 caracteres' });
    }
    
    try {
        const senhaHash = await hashSenha(novaSenha);
        
        db.run(`UPDATE usuarios SET senha=?, deve_trocar_senha=1 WHERE id=?`, [senhaHash, id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            
            // Invalidar todas as sessões do usuário
            db.run(`DELETE FROM sessoes WHERE usuario_id=?`, [id], (err) => {
                if (err) {
                    console.error('Erro ao invalidar sessões:', err);
                }
            });
            
            res.json({ message: 'Senha resetada com sucesso. O usuário precisará fazer login novamente e trocar a senha.' });
        });
    } catch (error) {
        console.error('Erro ao resetar senha:', error);
        return res.status(500).json({ error: 'Erro ao processar nova senha' });
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
        db.run(`UPDATE usuarios SET senha=?, deve_trocar_senha=0 WHERE id=?`, [senhaHash, usuarioId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Invalidar todas as outras sessões (manter apenas a atual)
            db.run(`DELETE FROM sessoes WHERE usuario_id=? AND token!=?`, [usuarioId, req.headers.authorization?.replace('Bearer ', '')], (err) => {
                if (err) {
                    console.error('Erro ao invalidar outras sessões:', err);
                }
            });
            
            res.json({ message: 'Senha alterada com sucesso!' });
        });
    } catch (error) {
        console.error('Erro ao trocar senha:', error);
        return res.status(500).json({ error: 'Erro ao processar nova senha' });
    }
});

// Editar perfil próprio (usuário logado)
router.put('/perfil', verificarAuth, async (req, res) => {
    const { nome, email, senhaAtual, novaSenha } = req.body;
    const usuarioId = req.user.id;
    
    if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }
    
    try {
        // Se está tentando alterar senha, verificar senha atual
        if (novaSenha) {
            if (!senhaAtual) {
                return res.status(400).json({ error: 'Senha atual é obrigatória para alterar senha' });
            }
            
            if (novaSenha.length < 4) {
                return res.status(400).json({ error: 'Nova senha deve ter pelo menos 4 caracteres' });
            }
            
            const bcrypt = require('bcrypt');
            const senhaValida = await bcrypt.compare(senhaAtual, req.user.senha);
            
            if (!senhaValida) {
                return res.status(401).json({ error: 'Senha atual incorreta' });
            }
            
            // Atualizar com nova senha
            const senhaHash = await hashSenha(novaSenha);
            
            db.run(`UPDATE usuarios SET nome=?, email=?, senha=? WHERE id=?`, 
                   [nome, email.toLowerCase(), senhaHash, usuarioId], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Este email já está sendo usado por outro usuário' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                
                // Invalidar outras sessões (manter apenas a atual)
                db.run(`DELETE FROM sessoes WHERE usuario_id=? AND token!=?`, 
                       [usuarioId, req.headers.authorization?.replace('Bearer ', '')], (err) => {
                    if (err) {
                        console.error('Erro ao invalidar outras sessões:', err);
                    }
                });
                
                res.json({ message: 'Perfil e senha atualizados com sucesso!' });
            });
        } else {
            // Atualizar apenas nome e email
            db.run(`UPDATE usuarios SET nome=?, email=? WHERE id=?`, 
                   [nome, email.toLowerCase(), usuarioId], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Este email já está sendo usado por outro usuário' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                
                res.json({ message: 'Perfil atualizado com sucesso!' });
            });
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).json({ error: 'Erro ao processar atualização' });
    }
});

// Buscar pessoas para vincular a usuário
router.get('/pessoas-disponiveis', verificarAuth, verificarTipo(['administrador']), (req, res) => {
    db.all(`SELECT p.id, p.nome, p.email 
            FROM pessoas p 
            LEFT JOIN usuarios u ON p.id = u.pessoa_id 
            WHERE u.pessoa_id IS NULL 
            ORDER BY p.nome`, (err, pessoas) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(pessoas);
    });
});

module.exports = router;