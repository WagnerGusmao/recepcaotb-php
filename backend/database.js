const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'frequencia.db');
const db = new sqlite3.Database(dbPath);

// Configurar UTF-8 e habilitar foreign keys
db.run('PRAGMA encoding = "UTF-8"');
db.run('PRAGMA foreign_keys = ON');

// Criar tabelas
db.serialize(() => {
    // Tabela pessoas
    db.run(`CREATE TABLE IF NOT EXISTS pessoas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT,
        nascimento DATE,
        religiao TEXT,
        cidade TEXT,
        estado TEXT,
        telefone TEXT,
        email TEXT,
        indicacao TEXT,
        observacao TEXT,
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

    // Tabela usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        tipo TEXT NOT NULL CHECK(tipo IN ('geral', 'responsavel', 'administrador')),
        pessoa_id INTEGER,
        ativo INTEGER DEFAULT 1,
        deve_trocar_senha INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pessoa_id) REFERENCES pessoas (id)
    )`);

    // Tabela sessoes
    db.run(`CREATE TABLE IF NOT EXISTS sessoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
    )`);

    // Adicionar coluna deve_trocar_senha se não existir (para bancos existentes)
    db.run(`ALTER TABLE usuarios ADD COLUMN deve_trocar_senha INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Erro ao adicionar coluna deve_trocar_senha:', err.message);
        }
    });

    // Adicionar colunas para senhas de pet na tabela frequencias
    db.run(`ALTER TABLE frequencias ADD COLUMN numero_senha_tutor INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Erro ao adicionar coluna numero_senha_tutor:', err.message);
        }
    });

    db.run(`ALTER TABLE frequencias ADD COLUMN numero_senha_pet INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Erro ao adicionar coluna numero_senha_pet:', err.message);
        }
    });

    // Criar índices para melhor performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_pessoas_nome ON pessoas(nome)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pessoas_cpf ON pessoas(cpf)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_frequencias_data ON frequencias(data)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_frequencias_pessoa_id ON frequencias(pessoa_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_frequencias_tipo ON frequencias(tipo)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_sessoes_expires ON sessoes(expires_at)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)`);
});

module.exports = db;