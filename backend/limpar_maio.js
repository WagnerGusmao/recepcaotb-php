const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

db.run("DELETE FROM frequencias WHERE data = '2025-05-04'", function(err) {
    if (err) {
        console.log('❌ Erro:', err.message);
    } else {
        console.log(`🗑️ Removidos ${this.changes} registros de maio`);
    }
    db.close();
});