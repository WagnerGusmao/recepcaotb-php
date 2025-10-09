const db = require('./database');

db.get("SELECT COUNT(*) as total FROM pessoas", (err, row) => {
    if (err) {
        console.error('Erro:', err.message);
    } else {
        console.log(`Total de registros na base de dados: ${row.total}`);
    }
    db.close();
});