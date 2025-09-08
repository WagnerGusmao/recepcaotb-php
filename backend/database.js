const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'frequencia.db');
const db = new sqlite3.Database(dbPath);

// Criar tabelas
db.serialize(() => {
    // Tabela pessoas
    db.run(`CREATE TABLE IF NOT EXISTS pessoas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        nascimento DATE NOT NULL,
        sexo TEXT NOT NULL,
        cep TEXT NOT NULL,
        rua TEXT NOT NULL,
        numero TEXT NOT NULL,
        complemento TEXT,
        bairro TEXT NOT NULL,
        cidade TEXT NOT NULL,
        estado TEXT NOT NULL,
        telefone TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela frequencias
    db.run(`CREATE TABLE IF NOT EXISTS frequencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pessoa_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        numero_senha INTEGER NOT NULL,
        data DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pessoa_id) REFERENCES pessoas (id)
    )`);
});

module.exports = db;