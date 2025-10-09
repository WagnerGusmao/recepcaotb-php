const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'frequencia.db');
const db = new sqlite3.Database(dbPath);

console.log('Atualizando estrutura da tabela...');

db.serialize(() => {
    // Adicionar coluna indicacao se não existir
    db.run(`ALTER TABLE pessoas ADD COLUMN indicacao TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Erro ao adicionar coluna:', err.message);
        } else {
            console.log('✅ Coluna indicacao adicionada com sucesso');
        }
        db.close();
    });
});