const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

console.log('🔍 Testando busca de pessoas...\n');

// Testar busca geral
db.all('SELECT COUNT(*) as total FROM pessoas', (err, result) => {
    if (err) {
        console.error('❌ Erro:', err.message);
        return;
    }
    console.log(`📊 Total de pessoas no banco: ${result[0].total}`);
});

// Testar busca com LIKE
db.all("SELECT id, nome, cpf, cidade, estado FROM pessoas WHERE nome LIKE '%WAGNER%' OR nome LIKE '%MARIA%' LIMIT 5", (err, rows) => {
    if (err) {
        console.error('❌ Erro na busca:', err.message);
        return;
    }
    
    console.log(`\n🔍 Teste de busca (${rows.length} resultados):`);
    rows.forEach(p => {
        console.log(`- ID: ${p.id} | Nome: ${p.nome} | CPF: ${p.cpf || 'N/A'} | ${p.cidade}/${p.estado}`);
    });
    
    db.close();
    console.log('\n✅ Teste concluído');
});