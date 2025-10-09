const db = require('./database');

console.log('Limpando banco de dados...');

// Deletar todos os registros das tabelas
db.run('DELETE FROM frequencias', (err) => {
    if (err) {
        console.error('Erro ao limpar frequências:', err);
    } else {
        console.log('✅ Tabela frequencias limpa');
    }
});

db.run('DELETE FROM pessoas', (err) => {
    if (err) {
        console.error('Erro ao limpar pessoas:', err);
    } else {
        console.log('✅ Tabela pessoas limpa');
    }
});

// Reset dos auto-increment
db.run('DELETE FROM sqlite_sequence WHERE name="pessoas"', (err) => {
    if (err) {
        console.error('Erro ao resetar sequência pessoas:', err);
    } else {
        console.log('✅ Sequência pessoas resetada');
    }
});

db.run('DELETE FROM sqlite_sequence WHERE name="frequencias"', (err) => {
    if (err) {
        console.error('Erro ao resetar sequência frequências:', err);
    } else {
        console.log('✅ Sequência frequências resetada');
    }
});

setTimeout(() => {
    console.log('\n🎯 Banco de dados completamente limpo!');
    process.exit(0);
}, 1000);