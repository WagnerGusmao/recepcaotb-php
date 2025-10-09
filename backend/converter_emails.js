const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

console.log('🔄 Convertendo emails para minúsculo...');

db.run(`UPDATE pessoas SET email = LOWER(email) WHERE email IS NOT NULL AND email != ''`, function(err) {
    if (err) {
        console.error('❌ Erro:', err.message);
        return;
    }
    
    console.log(`✅ ${this.changes} emails convertidos para minúsculo`);
    
    db.close(() => {
        console.log('✅ Conversão concluída!');
    });
});