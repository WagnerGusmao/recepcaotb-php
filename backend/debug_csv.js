const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'setembro.csv');

if (!fs.existsSync(csvPath)) {
    console.log('❌ Arquivo setembro.csv não encontrado');
    process.exit(1);
}

const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.split('\n');

console.log('=== DEBUG CSV ===');
console.log('Total de linhas:', lines.length);
console.log('\nPrimeiras 10 linhas:');

for (let i = 0; i < Math.min(10, lines.length); i++) {
    console.log(`Linha ${i}: "${lines[i]}"`);
}

if (lines.length > 0) {
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('\nColunas encontradas:', headers);
    
    // Mostrar primeira linha com dados
    if (lines.length > 1) {
        const values = lines[1].split(',').map(v => v.trim().replace(/"/g, ''));
        console.log('\nPrimeira linha de dados:');
        headers.forEach((header, index) => {
            console.log(`  ${header}: "${values[index] || ''}"`);
        });
    }
}