const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('./database');

const SALT_ROUNDS = 10;

// Middleware de autenticação
function verificarAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    db.get(`SELECT u.*, s.expires_at FROM usuarios u 
            JOIN sessoes s ON u.id = s.usuario_id 
            WHERE s.token = ? AND s.expires_at > datetime('now')`, 
            [token], (err, user) => {
        if (err) {
            console.error('Erro ao verificar token:', err);
            return res.status(401).json({ error: 'Erro na autenticação' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }
        
        req.user = user;
        next();
    });
}

// Middleware de autorização por tipo
function verificarTipo(tiposPermitidos) {
    return (req, res, next) => {
        if (!tiposPermitidos.includes(req.user.tipo)) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        next();
    };
}

// Login
async function login(req, res) {
    const { email, senha } = req.body;
    
    db.get('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [email], async (err, user) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ error: 'Erro no servidor' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // Verificar senha com bcrypt
        try {
            const senhaValida = await bcrypt.compare(senha, user.senha);
            
            if (!senhaValida) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
            
            // Gerar token
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h
            
            db.run('INSERT INTO sessoes (usuario_id, token, expires_at) VALUES (?, ?, ?)',
                   [user.id, token, expiresAt], (err) => {
                if (err) {
                    console.error('Erro ao criar sessão:', err);
                    return res.status(500).json({ error: 'Erro ao criar sessão' });
                }
                
                res.json({
                    token,
                    user: {
                        id: user.id,
                        nome: user.nome,
                        email: user.email,
                        tipo: user.tipo,
                        deve_trocar_senha: user.deve_trocar_senha || 0
                    }
                });
            });
        } catch (error) {
            console.error('Erro ao verificar senha:', error);
            return res.status(500).json({ error: 'Erro no servidor' });
        }
    });
}

// Logout
function logout(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    db.run('DELETE FROM sessoes WHERE token = ?', [token], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao fazer logout' });
        }
        res.json({ message: 'Logout realizado com sucesso' });
    });
}

// Função auxiliar para hash de senha (usar ao criar/atualizar usuários)
async function hashSenha(senha) {
    return await bcrypt.hash(senha, SALT_ROUNDS);
}

module.exports = {
    verificarAuth,
    verificarTipo,
    login,
    logout,
    hashSenha
};