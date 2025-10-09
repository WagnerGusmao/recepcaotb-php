const db = require('./database');

console.log('Iniciando correção de São Roque...');

// Primeiro, verificar quantos registros existem
db.all('SELECT COUNT(*) as total FROM pessoas WHERE cidade LIKE "%ROQUE%"', (err, result) => {
    if (err) {
        console.error('Erro:', err);
        return;
    }
    
    console.log('Total de registros com ROQUE:', result[0].total);
    
    // Fazer a correção
    db.run(`UPDATE pessoas SET cidade = 'SÃO ROQUE' WHERE cidade = 'SO ROQUE'`, function(err) {
        if (err) {
            console.error('Erro na atualização:', err);
        } else {
            console.log('✅ Registros atualizados:', this.changes);
        }
        
        // Verificar resultado final
        db.all('SELECT cidade, COUNT(*) as total FROM pessoas WHERE cidade LIKE "%ROQUE%" GROUP BY cidade', (err, final) => {
            if (!err) {
                console.log('\nStatus final:');
                final.forEach(r => console.log(`${r.cidade}: ${r.total} pessoas`));
            }
            process.exit();
        });
    });
});