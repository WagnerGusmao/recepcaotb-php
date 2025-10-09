const db = require('./database');

console.log('Atualizando estrutura da tabela para religião...');

// Adicionar coluna religião se não existir
db.run('ALTER TABLE pessoas ADD COLUMN religiao TEXT', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        console.error('Erro ao adicionar coluna religião:', err);
    } else {
        console.log('✅ Coluna religião adicionada/verificada');
    }
});

// Remover coluna sexo se existir (SQLite não suporta DROP COLUMN diretamente)
// Vamos apenas ignorar a coluna sexo nos selects

setTimeout(() => {
    console.log('✅ Estrutura atualizada para religião');
    process.exit(0);
}, 1000);