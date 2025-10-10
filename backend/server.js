const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const db = require('./database');
const { verificarAuth, verificarTipo, login, logout } = require('./auth');

const app = express();
const PORT = process.env.PORT || 10000;

// Configurar CORS baseado no ambiente
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://seu-dominio.vercel.app']
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

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

// Cadastrar pessoa
app.post('/api/pessoas', verificarAuth, verificarTipo(['geral', 'responsavel', 'administrador']), (req, res) => {
    const { nome, cpf, nascimento, religiao, cidade, estado, telefone, email, indicacao, observacao } = req.body;
    
    // Usar horário local do Brasil (UTC-3)
    const agora = new Date();
    const horaLocal = new Date(agora.getTime() - (3 * 60 * 60 * 1000));
    const created_at = horaLocal.toISOString().replace('T', ' ').substring(0, 19);
    
    const sql = `INSERT INTO pessoas (nome, cpf, nascimento, religiao, cidade, estado, telefone, email, indicacao, observacao, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [nome, cpf, nascimento, religiao, cidade, estado, telefone, email ? email.toLowerCase() : email, indicacao, observacao, created_at];
    
    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'Pessoa cadastrada com sucesso' });
    });
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

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});