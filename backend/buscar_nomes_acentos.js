const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

const termo = process.argv[2];

if (!termo) {
    console.log('❌ Uso: node buscar_nomes_acentos.js <termo>');
    console.log('Exemplo: node buscar_nomes_acentos.js "João"');
    process.exit(1);
}

db.all(`SELECT nome FROM pessoas 
        WHERE nome LIKE ? 
        ORDER BY nome 
        LIMIT 20`, [`%${termo}%`], (err, rows) => {
    if (err) {
        console.log('❌ Erro:', err.message);
        return;
    }
    
    console.log(`📋 Nomes encontrados com "${termo}":`);
    rows.forEach((row, index) => {
        console.log(`${index + 1}. "${row.nome}"`);
    });
    
    db.close();
});