const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

console.log('🔍 Testando consulta de frequências com nomes...\n');

const sql = `SELECT f.*, p.nome 
             FROM frequencias f 
             JOIN pessoas p ON f.pessoa_id = p.id 
             ORDER BY f.created_at DESC 
             LIMIT 10`;

db.all(sql, [], (err, rows) => {
    if (err) {
        console.log('❌ Erro:', err.message);
        return;
    }
    
    console.log(`📋 Encontradas ${rows.length} frequências:`);
    
    rows.forEach((freq, index) => {
        console.log(`${index + 1}. ${freq.nome} - Tipo: ${freq.tipo} - Senha: ${freq.numero_senha} - Data: ${freq.data}`);
    });
    
    db.close();
});