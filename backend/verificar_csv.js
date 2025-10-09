const fs = require('fs');

const csvContent = fs.readFileSync('./frequencias_completas.csv', 'utf8');
const lines = csvContent.split('\n').filter(line => line.trim());

const separator = lines[0].includes(',') ? ',' : ';';
const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));

console.log('📋 Cabeçalho do CSV:');
header.forEach((col, index) => {
    console.log(`${index}: ${col}`);
});

console.log('\n📋 Primeiras 3 linhas de dados:');
for (let i = 1; i <= 3 && i < lines.length; i++) {
    const columns = lines[i].split(separator).map(col => col.trim().replace(/"/g, ''));
    console.log(`\nLinha ${i}:`);
    columns.slice(0, 10).forEach((col, index) => {
        console.log(`  ${index}: ${col}`);
    });
}