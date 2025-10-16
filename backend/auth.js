const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('./database');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura';
const TOKEN_EXPIRATION = '24h';

/**
 * Middleware de autenticação JWT
 * Verifica o token JWT e adiciona o usuário ao objeto de requisição
 */
async function verificarAuth(req, res, next) {
    try {
        // Extrair o token do cabeçalho Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Token de autenticação não fornecido',
                code: 'AUTH_TOKEN_MISSING'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                error: 'Token não fornecido',
                code: 'TOKEN_NOT_PROVIDED'
            });
        }

        // Verificar o token JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Verificar se a sessão ainda é válida no banco de dados usando Knex
        const sessionData = await db('usuarios as u')
            .join('sessoes as s', 'u.id', 's.usuario_id')
            .where('s.token', token)
            .where('s.expires_at', '>', new Date().toISOString())
            .select('u.*', 's.expires_at')
            .first();
        
        if (!sessionData) {
            return res.status(401).json({ 
                error: 'Sessão expirada ou inválida',
                code: 'INVALID_OR_EXPIRED_SESSION'
            });
        }
        
        // Adicionar informações do usuário ao objeto de requisição
        req.user = {
            id: sessionData.id,
            nome: sessionData.nome,
            email: sessionData.email,
            tipo: sessionData.tipo,
            senha: sessionData.senha, // Necessário para verificação de senha atual
            deve_trocar_senha: sessionData.deve_trocar_senha,
            exp: decoded.exp
        };
        
        // Atualizar o tempo de expiração da sessão (sliding expiration)
        const newExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        try {
            await db('sessoes')
                .where('token', token)
                .update({ expires_at: newExpiration });
        } catch (err) {
            console.error('Erro ao atualizar expiração da sessão:', err);
            // Não interrompemos o fluxo por esse erro
        }
        
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Sessão expirada',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Token inválido',
                code: 'INVALID_TOKEN'
            });
        }
        
        res.status(500).json({ 
            error: 'Erro na autenticação',
            code: 'AUTHENTICATION_ERROR'
        });
    }
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

/**
 * Realiza o login do usuário e retorna um token JWT
 */
async function login(req, res) {
    const { email, senha } = req.body;
    
    // Validação básica dos campos
    if (!email || !senha) {
        return res.status(400).json({ 
            error: 'Email e senha são obrigatórios',
            code: 'MISSING_CREDENTIALS'
        });
    }
    
    try {
        // Buscar usuário no banco de dados usando Knex
        const user = await db('usuarios')
            .where({ email, ativo: 1 })
            .first();
        
        // Verificar se o usuário existe
        if (!user) {
            return res.status(401).json({ 
                error: 'Credenciais inválidas',
                code: 'INVALID_CREDENTIALS'
            });
        }
        
        // Verificar senha com bcrypt
        const senhaValida = await bcrypt.compare(senha, user.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ 
                error: 'Credenciais inválidas',
                code: 'INVALID_CREDENTIALS'
            });
        }
        
        // Gerar token JWT
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                type: user.tipo
            },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRATION }
        );
        
        // Calcular data de expiração
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas de expiração
        
        // Criar registro de sessão no banco de dados usando Knex
        await db('sessoes').insert({
            usuario_id: user.id,
            token: token,
            expires_at: expiresAt.toISOString(),
            user_agent: req.headers['user-agent'] || 'unknown',
            ip_address: req.ip || req.connection.remoteAddress || 'unknown'
        });
        
        // Retornar token e informações do usuário
        res.json({
            token,
            expiresAt: expiresAt.toISOString(),
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo,
                deve_trocar_senha: user.deve_trocar_senha || 0
            }
        });
        
    } catch (error) {
        console.error('Erro inesperado no login:', error);
        res.status(500).json({ 
            error: 'Erro inesperado no servidor',
            code: 'UNEXPECTED_ERROR'
        });
    }
}

/**
 * Realiza o logout do usuário, invalidando o token atual
 */
async function logout(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(400).json({ 
                error: 'Token não fornecido',
                code: 'TOKEN_NOT_PROVIDED'
            });
        }
        
        // Invalidar o token no banco de dados usando Knex
        const deletedRows = await db('sessoes')
            .where('token', token)
            .del();
        
        if (deletedRows === 0) {
            // Token já estava inválido/inexistente, mas retornamos sucesso
            console.log('Tentativa de logout com token inválido');
        }
        
        res.json({ 
            success: true,
            message: 'Logout realizado com sucesso'
        });
    } catch (error) {
        console.error('Erro inesperado no logout:', error);
        res.status(500).json({ 
            error: 'Erro inesperado ao fazer logout',
            code: 'LOGOUT_PROCESSING_ERROR'
        });
    }
}

/**
 * Gera um hash seguro para a senha usando bcrypt
 * @param {string} senha - Senha em texto puro
 * @returns {Promise<string>} Hash da senha
 */
async function hashSenha(senha) {
    if (!senha) {
        throw new Error('Senha não fornecida');
    }
    
    try {
        return await bcrypt.hash(senha, SALT_ROUNDS);
    } catch (error) {
        console.error('Erro ao gerar hash da senha:', error);
        throw new Error('Falha ao processar senha');
    }
}

/**
 * Verifica se uma senha atende aos requisitos de segurança
 * @param {string} senha - Senha a ser validada
 * @returns {{valida: boolean, mensagem?: string}} Resultado da validação
 */
function validarForcaSenha(senha) {
    if (!senha || senha.length < 8) {
        return { 
            valida: false, 
            mensagem: 'A senha deve ter pelo menos 8 caracteres' 
        };
    }
    
    if (!/[A-Z]/.test(senha)) {
        return { 
            valida: false, 
            mensagem: 'A senha deve conter pelo menos uma letra maiúscula' 
        };
    }
    
    if (!/[a-z]/.test(senha)) {
        return { 
            valida: false, 
            mensagem: 'A senha deve conter pelo menos uma letra minúscula' 
        };
    }
    
    if (!/[0-9]/.test(senha)) {
        return { 
            valida: false, 
            mensagem: 'A senha deve conter pelo menos um número' 
        };
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
        return { 
            valida: false, 
            mensagem: 'A senha deve conter pelo menos um caractere especial' 
        };
    }
    
    return { valida: true };
}

/**
 * Gera um token de redefinição de senha
 * @param {number} userId - ID do usuário
 * @returns {string} Token de redefinição
 */
function gerarTokenRedefinicaoSenha(userId) {
    const payload = {
        sub: userId,
        type: 'password_reset',
        iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Verifica um token JWT
 * @param {string} token - Token JWT
 * @returns {object} Payload decodificado
 */
function verificarToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        return null;
    }
}

module.exports = {
    // Middlewares
    verificarAuth,
    verificarTipo,
    
    // Funções de autenticação
    login,
    logout,
    
    // Utilitários
    hashSenha,
    validarForcaSenha,
    gerarTokenRedefinicaoSenha,
    verificarToken,
    
    // Constantes
    JWT_SECRET,
    TOKEN_EXPIRATION
};