const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const db = require('./database');
const { verificarAuth, verificarTipo, login, logout } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações de CORS
app.use(cors({
    origin: '*', // Em produção, substitua por domínios específicos
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Middleware para lidar com preflight requests
app.options('*', cors());

// Configurações do Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log de todas as requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, req.body);
    next();
});

// Servir arquivos estáticos da pasta raiz
app.use(express.static(path.join(__dirname, '..')));

// Rate limiting para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rotas
app.use('/api/usuarios', require('./usuarios'));
app.use('/api/exportacao', require('./exportacao'));
app.use('/api/duplicatas', require('./duplicatas'));
app.post('/api/login', require('./auth').login);
app.post('/api/logout', require('./auth').logout);

// Função para validar CPF
const validarCPF = (cpf) => {
    if (!cpf) return true; // CPF é opcional
    
    cpf = cpf.replace(/[\D]/g, '');
    
    // Verifica se tem 11 dígitos e não é uma sequência de números iguais
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    const digito1 = resto > 9 ? 0 : resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) {
        return false;
    }
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    const digito2 = resto > 9 ? 0 : resto;
    
    return digito2 === parseInt(cpf.charAt(10));
};

// Função para formatar telefone
const formatarTelefone = (telefone) => {
    if (!telefone) return null;
    
    // Remove tudo que não for dígito
    const numeros = telefone.replace(/\D/g, '');
    
    // Verifica se tem o número de dígitos correto
    if (numeros.length < 10 || numeros.length > 11) {
        return null;
    }
    
    // Formata o telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    const ddd = numeros.substring(0, 2);
    const numero = numeros.length === 11 ? 
        `${numeros.substring(2, 7)}-${numeros.substring(7)}` : 
        `${numeros.substring(2, 6)}-${numeros.substring(6)}`;
    
    return `(${ddd}) ${numero}`;
};

// Função para validar e formatar data
const validarData = (data) => {
    if (!data) return null;
    
    // Tenta converter para data
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) {
        return null;
    }
    
    // Verifica se a data é válida (não é futura e não é muito antiga)
    const hoje = new Date();
    const dataMinima = new Date(1900, 0, 1);
    
    if (dataObj > hoje || dataObj < dataMinima) {
        return null;
    }
    
    // Retorna no formato YYYY-MM-DD
    return dataObj.toISOString().split('T')[0];
};

// Cadastrar pessoa
app.post('/api/pessoas', verificarAuth, verificarTipo(['geral', 'responsavel', 'administrador']), async (req, res) => {
    try {
        let { nome, cpf, nascimento, religiao, cidade, estado, telefone, email, indicacao, observacao } = req.body;
        
        // Validações obrigatórias
        if (!nome || !cidade || !estado) {
            return res.status(400).json({ error: 'Nome, cidade e estado são campos obrigatórios' });
        }
        
        // Valida CPF se informado
        if (cpf && !validarCPF(cpf)) {
            return res.status(400).json({ error: 'CPF inválido' });
        }
        
        // Formata e valida telefone
        telefone = formatarTelefone(telefone);
        if (telefone === null) {
            return res.status(400).json({ error: 'Telefone inválido. Use o formato (XX) XXXXX-XXXX' });
        }
        
        // Valida e formata email
        if (email) {
            email = email.toLowerCase().trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'E-mail inválido' });
            }
        } else {
            email = null;
        }
        
        // Valida e formata data de nascimento
        nascimento = validarData(nascimento);
        if (nascimento === null) {
            return res.status(400).json({ error: 'Data de nascimento inválida' });
        }
        
        // Usar horário local do Brasil (UTC-3)
        const agora = new Date();
        const horaLocal = new Date(agora.getTime() - (3 * 60 * 60 * 1000));
        const created_at = horaLocal.toISOString().replace('T', ' ').substring(0, 19);
        
        // Verifica se já existe pessoa com o mesmo CPF
        if (cpf) {
            const pessoaExistente = await new Promise((resolve, reject) => {
                db.get('SELECT id FROM pessoas WHERE cpf = ?', [cpf], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (pessoaExistente) {
                return res.status(400).json({ error: 'Já existe uma pessoa cadastrada com este CPF' });
            }
        }
        
        // Insere no banco de dados
        const sql = `INSERT INTO pessoas (
            nome, cpf, nascimento, religiao, cidade, estado, 
            telefone, email, indicacao, observacao, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const params = [
            nome.trim(), 
            cpf ? cpf.replace(/[\D]/g, '') : null, 
            nascimento, 
            religiao ? religiao.trim() : null, 
            cidade.trim(), 
            estado.trim(), 
            telefone, 
            email,
            indicacao ? indicacao.trim() : null, 
            observacao ? observacao.trim() : null, 
            created_at,
            created_at // updated_at é igual ao created_at na criação
        ];
        
        const result = await new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
        
        res.status(201).json({ 
            id: result.lastID, 
            message: 'Pessoa cadastrada com sucesso',
            data: {
                nome,
                cpf: cpf ? cpf.replace(/[\D]/g, '') : null,
                nascimento,
                cidade,
                estado,
                telefone,
                email,
                created_at
            }
        });
        
    } catch (error) {
        console.error('Erro ao cadastrar pessoa:', error);
        res.status(500).json({ 
            error: 'Erro interno ao processar a solicitação',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Atualizar pessoa (apenas voluntários)
app.put('/api/pessoas/:id', verificarAuth, verificarTipo(['geral', 'responsavel', 'administrador']), (req, res) => {
    const { id } = req.params;
    const { nome, cpf, nascimento, religiao, cidade, estado, telefone, email, observacao } = req.body;
    
    const sql = `UPDATE pessoas SET nome=?, cpf=?, nascimento=?, religiao=?, cidade=?, estado=?, telefone=?, email=?, observacao=? WHERE id=?`;
    
    db.run(sql, [nome, cpf, nascimento, religiao, cidade, estado, telefone, email ? email.toLowerCase() : email, observacao, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Pessoa atualizada com sucesso' });
    });
});

// Buscar pessoas
app.get('/api/pessoas', (req, res) => {
    const { busca } = req.query;
    let sql = 'SELECT * FROM pessoas';
    let params = [];
    
    console.log('Busca recebida:', busca);
    
    if (busca) {
        sql += ' WHERE nome LIKE ? OR cpf LIKE ?';
        params = [`%${busca}%`, `%${busca}%`];
        sql += ' ORDER BY nome LIMIT 50';
    } else {
        sql += ' ORDER BY nome';
    }
    
    console.log('SQL:', sql, 'Params:', params);
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Erro na busca de pessoas:', err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log(`Encontradas ${rows.length} pessoas`);
        res.json(rows);
    });
});

// Buscar todas as pessoas para relatórios (sem limite) - apenas responsáveis e admins
app.get('/api/pessoas/todas', verificarAuth, verificarTipo(['responsavel', 'administrador']), (req, res) => {
    const sql = 'SELECT * FROM pessoas ORDER BY nome';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar todas as pessoas:', err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log(`Retornadas ${rows.length} pessoas para relatório`);
        res.json(rows);
    });
});

// Registrar frequência (apenas voluntários)
app.post('/api/frequencias', verificarAuth, verificarTipo(['geral', 'responsavel', 'administrador']), (req, res) => {
    const { pessoaId, tipo, numeroSenha, numeroSenhaTutor, numeroSenhaPet, data } = req.body;
    
    // Usar horário local do Brasil (UTC-3)
    const agora = new Date();
    const horaLocal = new Date(agora.getTime() - (3 * 60 * 60 * 1000));
    const created_at = horaLocal.toISOString().replace('T', ' ').substring(0, 19);
    
    let sql, params;
    
    if (tipo === 'pet' && numeroSenhaTutor && numeroSenhaPet) {
        // Para tipo pet, salvar as duas senhas separadamente
        sql = `INSERT INTO frequencias (pessoa_id, tipo, numero_senha, numero_senha_tutor, numero_senha_pet, data, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
        params = [pessoaId, tipo, numeroSenha, numeroSenhaTutor, numeroSenhaPet, data, created_at];
    } else {
        // Para outros tipos, usar apenas numero_senha
        sql = `INSERT INTO frequencias (pessoa_id, tipo, numero_senha, data, created_at)
               VALUES (?, ?, ?, ?, ?)`;
        params = [pessoaId, tipo, numeroSenha, data, created_at];
    }
    
    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        let message = 'Frequência registrada com sucesso';
        if (tipo === 'pet') {
            message += ` - Tutor: ${numeroSenhaTutor}, Pet: ${numeroSenhaPet}`;
        }
        
        res.json({ id: this.lastID, message });
    });
});

// Buscar frequências com filtros (apenas responsáveis e admins)
app.get('/api/frequencias', verificarAuth, verificarTipo(['responsavel', 'administrador']), (req, res) => {
    const { dataInicio, dataFim, tipo } = req.query;
    
    let sql = `SELECT f.id, f.pessoa_id, f.tipo, f.numero_senha, f.numero_senha_tutor, f.numero_senha_pet, 
                      f.data, f.created_at, p.nome, p.cidade, p.estado, p.telefone, p.email 
               FROM frequencias f 
               JOIN pessoas p ON f.pessoa_id = p.id 
               WHERE 1=1`;
    let params = [];
    
    if (dataInicio) {
        sql += ' AND f.data >= ?';
        params.push(dataInicio);
    }
    
    if (dataFim) {
        sql += ' AND f.data <= ?';
        params.push(dataFim);
    }
    
    if (tipo) {
        sql += ' AND f.tipo = ?';
        params.push(tipo);
    }
    
    sql += ' ORDER BY f.created_at DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});