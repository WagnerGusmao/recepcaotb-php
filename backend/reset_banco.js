const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'frequencia.db');

console.log('Apagando banco de dados...');

// Apagar o arquivo do banco
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Banco de dados apagado');
} else {
    console.log('⚠️ Banco não encontrado');
}

// Recriar o banco
console.log('Recriando banco...');
require('./database');
console.log('✅ Banco recriado vazio');