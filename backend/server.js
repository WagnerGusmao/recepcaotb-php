require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const db = require('./database');
const auth = require('./auth');
const usuariosRoutes = require('./usuarios');
const duplicatasRoutes = require('./duplicatas');
const backupRoutes = require('./routes/backup');
const pessoasRoutes = require('./pessoas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet({
    contentSecurityPolicy: false, // Desabilita CSP temporariamente para compatibilidade
    crossOriginEmbedderPolicy: false // Desabilita COEP para compatibilidade
}));
app.use(compression());

// Configuração do CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
    exposedHeaders: ['X-Auth-Expiration', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
}));

// Middleware para lidar com preflight requests
app.options('*', cors());

// Configuração do rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requisições por janela
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
        error: 'Muitas requisições deste IP. Tente novamente em 15 minutos.',
        code: 'TOO_MANY_REQUESTS'
    }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas de login
    message: { 
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        code: 'TOO_MANY_LOGIN_ATTEMPTS'
    },
    skipSuccessfulRequests: true
});

// Middleware para log de requisições
app.use((req, res, next) => {
    next();
});

// Configuração do Express
app.use(express.json({ 
    limit: '50mb'
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '50mb',
    parameterLimit: 10000
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));

// Rota para a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});


// Rotas públicas
app.post('/api/login', loginLimiter, auth.login.bind(auth));

// Rota de health check (não protegida)
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas de pessoas (cadastro público - não protegido)
app.use('/api/pessoas', pessoasRoutes);

// Middleware de autenticação para rotas protegidas
app.use('/api', auth.verificarAuth);

// Rotas protegidas
app.post('/api/logout', auth.logout.bind(auth));
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/duplicatas', duplicatasRoutes);
app.use('/api', backupRoutes);
app.get('/api/me', (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            nome: req.user.nome,
            email: req.user.email,
            tipo: req.user.tipo,
            exp: req.user.exp
        },
        permissions: getPermissionsForUserType(req.user.tipo)
    });
});

// Rota para atualizar dados de uma pessoa
app.put('/api/pessoas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cpf, nascimento, religiao, cidade, estado, telefone, email, observacao } = req.body;
        
        // Validar se a pessoa existe
        const pessoaExistente = await db('pessoas').where('id', id).first();
        if (!pessoaExistente) {
            return res.status(404).json({ 
                error: 'Pessoa não encontrada',
                code: 'PERSON_NOT_FOUND'
            });
        }
        
        // Preparar dados para atualização (apenas campos não vazios)
        const dadosAtualizacao = {};
        if (nome && nome.trim()) dadosAtualizacao.nome = nome.trim();
        if (cpf && cpf.trim()) dadosAtualizacao.cpf = cpf.trim();
        if (nascimento) dadosAtualizacao.nascimento = nascimento;
        if (religiao && religiao.trim()) dadosAtualizacao.religiao = religiao.trim();
        if (cidade && cidade.trim()) dadosAtualizacao.cidade = cidade.trim();
        if (estado && estado.trim()) dadosAtualizacao.estado = estado.trim();
        if (telefone && telefone.trim()) dadosAtualizacao.telefone = telefone.trim();
        if (email && email.trim()) dadosAtualizacao.email = email.trim();
        if (observacao !== undefined) dadosAtualizacao.observacao = observacao;
        
        // Atualizar no banco de dados
        const updated = await db('pessoas')
            .where('id', id)
            .update(dadosAtualizacao);
        
        if (updated > 0) {
            // Buscar dados atualizados
            const pessoaAtualizada = await db('pessoas').where('id', id).first();
            res.json({
                success: true,
                message: 'Dados atualizados com sucesso',
                pessoa: pessoaAtualizada
            });
        } else {
            res.status(500).json({ 
                error: 'Falha ao atualizar dados',
                code: 'UPDATE_FAILED'
            });
        }
        
    } catch (error) {
        console.error('Erro ao atualizar pessoa:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            code: 'UPDATE_ERROR'
        });
    }
});

// Rota para listar frequências (para relatórios)
app.get('/api/frequencias', async (req, res) => {
    try {
        const { dataInicio, dataFim, tipo, pessoaId } = req.query;
        
        let query = db('frequencias')
            .join('pessoas', 'frequencias.pessoa_id', 'pessoas.id')
            .select(
                'frequencias.*',
                'pessoas.nome as pessoa_nome',
                'pessoas.cpf',
                'pessoas.cidade',
                'pessoas.estado',
                'pessoas.telefone',
                'pessoas.email'
            );
        
        // Aplicar filtros
        if (dataInicio) {
            query = query.where('frequencias.data', '>=', dataInicio);
        }
        
        if (dataFim) {
            query = query.where('frequencias.data', '<=', dataFim);
        }
        
        if (tipo) {
            query = query.where('frequencias.tipo', tipo);
        }
        
        if (pessoaId) {
            query = query.where('frequencias.pessoa_id', pessoaId);
        }
        
        // Ordenar por data mais recente
        query = query.orderBy('frequencias.data', 'desc');
        
        const frequencias = await query;
        
        res.json(frequencias);
        
    } catch (error) {
        console.error('Erro ao buscar frequências:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            code: 'FREQUENCY_SEARCH_ERROR'
        });
    }
});

// Rota para registrar frequência
app.post('/api/frequencias', async (req, res) => {
    try {
        const { pessoaId, tipo, data, numeroSenha, numeroSenhaTutor, numeroSenhaPet } = req.body;
        
        // Validações básicas
        if (!pessoaId || !tipo || !data) {
            return res.status(400).json({ 
                error: 'Pessoa, tipo e data são obrigatórios',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }
        
        // Validar se a pessoa existe
        const pessoaExistente = await db('pessoas').where('id', pessoaId).first();
        if (!pessoaExistente) {
            return res.status(404).json({ 
                error: 'Pessoa não encontrada',
                code: 'PERSON_NOT_FOUND'
            });
        }
        
        // Verificar se já existe frequência para esta pessoa nesta data
        const frequenciaExistente = await db('frequencias')
            .where('pessoa_id', pessoaId)
            .where('data', data)
            .first();
        
        if (frequenciaExistente) {
            return res.status(409).json({ 
                error: 'Já existe frequência registrada para esta pessoa nesta data',
                code: 'FREQUENCY_ALREADY_EXISTS'
            });
        }
        
        // Preparar dados para inserção
        const dadosFrequencia = {
            pessoa_id: pessoaId,
            tipo: tipo,
            data: data,
            created_at: new Date().toISOString()
        };
        
        // Tratar diferentes tipos de frequência
        if (tipo === 'pet') {
            if (!numeroSenhaTutor || !numeroSenhaPet) {
                return res.status(400).json({ 
                    error: 'Para tipo Pet, ambas as senhas (tutor e pet) são obrigatórias',
                    code: 'MISSING_PET_PASSWORDS'
                });
            }
            dadosFrequencia.numero_senha_tutor = parseInt(numeroSenhaTutor);
            dadosFrequencia.numero_senha_pet = parseInt(numeroSenhaPet);
            dadosFrequencia.numero_senha = parseInt(numeroSenhaTutor); // Senha principal é a do tutor
        } else {
            if (!numeroSenha) {
                return res.status(400).json({ 
                    error: 'Número da senha é obrigatório',
                    code: 'MISSING_PASSWORD_NUMBER'
                });
            }
            dadosFrequencia.numero_senha = parseInt(numeroSenha);
        }
        
        // Inserir no banco de dados
        const [frequenciaId] = await db('frequencias').insert(dadosFrequencia);
        
        // Buscar frequência criada
        const frequenciaCriada = await db('frequencias')
            .join('pessoas', 'frequencias.pessoa_id', 'pessoas.id')
            .where('frequencias.id', frequenciaId)
            .select(
                'frequencias.*',
                'pessoas.nome as pessoa_nome'
            )
            .first();
        
        res.status(201).json({
            success: true,
            message: 'Frequência registrada com sucesso',
            frequencia: frequenciaCriada
        });
        
    } catch (error) {
        console.error('Erro ao registrar frequência:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            code: 'FREQUENCY_REGISTRATION_ERROR'
        });
    }
});

// Função auxiliar para obter permissões
function getPermissionsForUserType(userType) {
    const permissions = {
        administrador: {
            canManageUsers: true,
            canManageContent: true,
            canViewAuditLogs: true,
            canExportData: true
        },
        responsavel: {
            canManageUsers: false,
            canManageContent: true,
            canViewAuditLogs: false,
            canExportData: true
        },
        geral: {
            canManageUsers: false,
            canManageContent: false,
            canViewAuditLogs: false,
            canExportData: false
        }
    };
    
    return permissions[userType] || permissions.geral;
}

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
            error: 'Token inválido',
            code: 'INVALID_TOKEN'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
            error: 'Sessão expirada',
            code: 'TOKEN_EXPIRED'
        });
    }
    
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Rota 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        code: 'ENDPOINT_NOT_FOUND'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log('JWT Secret:', process.env.JWT_SECRET ? '*** (definido)' : 'Não definido!');
    
    if (!process.env.JWT_SECRET) {
        console.warn('AVISO: JWT_SECRET não está definido. Usando valor padrão. Isso não é seguro para produção!');
    }
    
    if (process.env.NODE_ENV === 'production' && !process.env.FORCE_HTTPS) {
        console.warn('AVISO: Executando em produção sem forçar HTTPS. Considere configurar um proxy reverso com HTTPS.');
    }
});