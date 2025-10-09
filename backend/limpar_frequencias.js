const db = require('./database');

console.log('Limpando registros de frequência...');

db.run('DELETE FROM frequencias', (err) => {
    if (err) {
        console.error('Erro:', err);
    } else {
        console.log('✅ Frequências removidas');
    }
});

db.run('DELETE FROM sqlite_sequence WHERE name="frequencias"', (err) => {
    if (err) {
        console.error('Erro ao resetar ID:', err);
    } else {
        console.log('✅ IDs resetados');
        process.exit(0);
    }
});