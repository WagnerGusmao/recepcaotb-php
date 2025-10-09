const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'frequencia.db');
const db = new sqlite3.Database(dbPath);

console.log('=== ESTRUTURA DO BANCO DE DADOS ===\n');

db.serialize(() => {
    // Mostrar estrutura da tabela pessoas
    db.all("PRAGMA table_info(pessoas)", (err, rows) => {
        if (err) {
            console.error('Erro ao ler tabela pessoas:', err.message);
        } else if (rows.length === 0) {
            console.log('❌ Tabela pessoas não existe');
        } else {
            console.log('📋 TABELA PESSOAS:');
            rows.forEach(row => {
                console.log(`  ${row.name} | ${row.type} | ${row.notnull ? 'NOT NULL' : 'NULL'} | ${row.dflt_value || ''}`);
            });
        }
        console.log('');
        
        // Mostrar estrutura da tabela frequencias
        db.all("PRAGMA table_info(frequencias)", (err, rows) => {
            if (err) {
                console.error('Erro ao ler tabela frequencias:', err.message);
            } else if (rows.length === 0) {
                console.log('❌ Tabela frequencias não existe');
            } else {
                console.log('📋 TABELA FREQUENCIAS:');
                rows.forEach(row => {
                    console.log(`  ${row.name} | ${row.type} | ${row.notnull ? 'NOT NULL' : 'NULL'} | ${row.dflt_value || ''}`);
                });
            }
            
            db.close();
        });
    });
});