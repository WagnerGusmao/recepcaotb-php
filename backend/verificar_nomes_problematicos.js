const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

db.all(`SELECT nome FROM pessoas 
        WHERE nome LIKE '%Ã%' OR nome LIKE '%ã%' OR nome LIKE '%ç%' OR nome LIKE '%á%' 
        ORDER BY nome 
        LIMIT 20`, (err, rows) => {
    if (err) {
        console.log('❌ Erro:', err.message);
        return;
    }
    
    console.log('📋 Nomes com possíveis problemas de acentuação:');
    rows.forEach((row, index) => {
        console.log(`${index + 1}. "${row.nome}"`);
    });
    
    db.close();
});