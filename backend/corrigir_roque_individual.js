const db = require('./database');

console.log('Corrigindo São Roque individualmente...');

// Buscar todos os registros com SO ROQUE
db.all(`SELECT id FROM pessoas WHERE cidade = 'SO ROQUE'`, (err, rows) => {
    if (err) {
        console.error('Erro:', err);
        return;
    }
    
    console.log(`Encontrados ${rows.length} registros SO ROQUE`);
    
    if (rows.length === 0) {
        console.log('Nenhum registro encontrado');
        process.exit();
        return;
    }
    
    let updated = 0;
    let processed = 0;
    
    rows.forEach(row => {
        db.run(`UPDATE pessoas SET cidade = 'SÃO ROQUE' WHERE id = ?`, [row.id], function(err) {
            if (err) {
                console.error(`Erro ao atualizar ID ${row.id}:`, err);
            } else if (this.changes > 0) {
                updated++;
            }
            
            processed++;
            
            if (processed === rows.length) {
                console.log(`✅ Atualizados ${updated} de ${rows.length} registros`);
                
                // Verificar resultado
                db.all(`SELECT cidade, COUNT(*) as total FROM pessoas WHERE cidade LIKE '%ROQUE%' GROUP BY cidade`, (err, final) => {
                    if (!err) {
                        console.log('\nStatus final:');
                        final.forEach(r => console.log(`${r.cidade}: ${r.total} pessoas`));
                    }
                    process.exit();
                });
            }
        });
    });
});