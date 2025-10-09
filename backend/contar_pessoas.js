const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

db.get('SELECT COUNT(*) as total FROM pessoas', (err, row) => {
    if (err) {
        console.log('❌ Erro:', err.message);
        return;
    }
    
    console.log(`👥 Total de pessoas cadastradas: ${row.total}`);
    db.close();
});