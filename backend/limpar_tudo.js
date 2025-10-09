const db = require('./database');

console.log('Limpando todas as tabelas...');

db.run('DELETE FROM frequencias', (err) => {
    if (err) console.error('Erro frequencias:', err);
    else console.log('✅ Frequências removidas');
});

db.run('DELETE FROM pessoas', (err) => {
    if (err) console.error('Erro pessoas:', err);
    else console.log('✅ Pessoas removidas');
});

db.run('DELETE FROM sqlite_sequence', (err) => {
    if (err) console.error('Erro sequence:', err);
    else console.log('✅ IDs resetados');
});

setTimeout(() => {
    console.log('✅ Banco completamente limpo');
    process.exit(0);
}, 500);