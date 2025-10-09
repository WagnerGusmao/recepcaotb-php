const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'frequencia.db');

console.log('Forçando recriação do banco...');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Dropar tabelas existentes
    db.run('DROP TABLE IF EXISTS frequencias');
    db.run('DROP TABLE IF EXISTS pessoas');
    
    // Recriar tabela pessoas com estrutura correta
    db.run(`CREATE TABLE pessoas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT,
        nascimento DATE,
        sexo TEXT,
        cidade TEXT,
        estado TEXT,
        telefone TEXT,
        email TEXT,
        indicacao TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela pessoas:', err);
        } else {
            console.log('✅ Tabela pessoas recriada');
        }
    });

    // Recriar tabela frequencias
    db.run(`CREATE TABLE frequencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pessoa_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        numero_senha INTEGER NOT NULL,
        data DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pessoa_id) REFERENCES pessoas (id)
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela frequencias:', err);
        } else {
            console.log('✅ Tabela frequencias recriada');
        }
        db.close();
        console.log('🎉 Banco recriado com sucesso!');
    });
});