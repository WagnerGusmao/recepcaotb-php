const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Cadastrar pessoa
app.post('/api/pessoas', (req, res) => {
    const { nome, cpf, nascimento, sexo, endereco, contato } = req.body;
    
    const sql = `INSERT INTO pessoas (nome, cpf, nascimento, sexo, cep, rua, numero, complemento, bairro, cidade, estado, telefone, email)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [
        nome, cpf, nascimento, sexo,
        endereco.cep, endereco.rua, endereco.numero, endereco.complemento,
        endereco.bairro, endereco.cidade, endereco.estado,
        contato.telefone, contato.email
    ];
    
    db.run(sql, params, function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return res.status(400).json({ error: 'CPF já cadastrado' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'Pessoa cadastrada com sucesso' });
    });
});

// Buscar pessoas
app.get('/api/pessoas', (req, res) => {
    const { busca } = req.query;
    let sql = 'SELECT * FROM pessoas';
    let params = [];
    
    if (busca) {
        sql += ' WHERE nome LIKE ? OR cpf LIKE ?';
        params = [`%${busca}%`, `%${busca}%`];
    }
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Registrar frequência
app.post('/api/frequencias', (req, res) => {
    const { pessoaId, tipo, numeroSenha, data } = req.body;
    
    const sql = `INSERT INTO frequencias (pessoa_id, tipo, numero_senha, data)
                 VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [pessoaId, tipo, numeroSenha, data], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'Frequência registrada com sucesso' });
    });
});

// Buscar frequências com filtros
app.get('/api/frequencias', (req, res) => {
    const { dataInicio, dataFim, tipo } = req.query;
    
    let sql = `SELECT f.*, p.nome 
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
    
    sql += ' ORDER BY f.numero_senha ASC';
    
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