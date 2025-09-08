const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'frequencia.db');
const db = new sqlite3.Database(dbPath);

// Data específica: 08/09/2025
const novaData = '2025-09-08 00:00:00';

db.serialize(() => {
    // Atualizar tabela pessoas
    db.run(`UPDATE pessoas SET created_at = ?`, [novaData], function(err) {
        if (err) {
            console.error('Erro ao atualizar pessoas:', err);
        } else {
            console.log(`${this.changes} registros atualizados na tabela pessoas`);
        }
    });

    // Atualizar tabela frequencias
    db.run(`UPDATE frequencias SET created_at = ?`, [novaData], function(err) {
        if (err) {
            console.error('Erro ao atualizar frequencias:', err);
        } else {
            console.log(`${this.changes} registros atualizados na tabela frequencias`);
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Erro ao fechar banco:', err);
    } else {
        console.log('Atualização concluída com sucesso!');
    }
});