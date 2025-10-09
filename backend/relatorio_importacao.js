const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

console.log('📊 RELATÓRIO FINAL DA IMPORTAÇÃO\n');

db.all(`
    SELECT 
        DATE(data) as data_freq,
        COUNT(*) as total
    FROM frequencias 
    WHERE data >= '2025-03-01'
    GROUP BY DATE(data)
    ORDER BY data
`, (err, rows) => {
    if (err) {
        console.log('❌ Erro:', err.message);
        return;
    }
    
    console.log('📅 Frequências importadas por data:');
    rows.forEach(row => {
        const data = new Date(row.data_freq + 'T00:00:00');
        const dataFormatada = data.toLocaleDateString('pt-BR');
        console.log(`   ${dataFormatada}: ${row.total} registros`);
    });
    
    const totalImportado = rows.reduce((sum, row) => sum + row.total, 0);
    console.log(`\n✅ Total de frequências importadas: ${totalImportado}`);
    
    db.close();
});