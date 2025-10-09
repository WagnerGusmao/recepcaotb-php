const db = require('./database');

const updates = [
    ['SO PAULO', 'SÃO PAULO'],
    ['SO ROQUE', 'SÃO ROQUE'], 
    ['SO BERNARDO DO CAMPO', 'SÃO BERNARDO DO CAMPO'],
    ['RIBEIRAO PRETO', 'RIBEIRÃO PRETO'],
    ['BRASILIA', 'BRASÍLIA'],
    ['GOIANIA', 'GOIÂNIA']
];

let processed = 0;

updates.forEach(([old, newCity]) => {
    db.run('UPDATE pessoas SET cidade = ? WHERE cidade = ?', [newCity, old], function(err) {
        if (!err && this.changes > 0) {
            console.log(`✅ ${old} → ${newCity} (${this.changes} registros)`);
        }
        processed++;
        if (processed === updates.length) {
            console.log('✅ Correção de cidades concluída!');
            process.exit();
        }
    });
});