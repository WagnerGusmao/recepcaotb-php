const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function analisarJulho(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    console.log('📋 Cabeçalho:', header.slice(0, 10), '...');
    
    let julhoCol = -1;
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (colLower.includes('julho') || colLower.includes('jul')) {
            julhoCol = index;
            console.log(`📅 Coluna Julho encontrada: ${index} (${col})`);
        }
    });
    
    if (julhoCol === -1) {
        console.log('❌ Coluna de Julho não encontrada');
        return;
    }
    
    let totalPessoas = 0;
    let pessoasComFrequencia = 0;
    let frequenciasJulho = 0;
    
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (!nome) continue;
        
        totalPessoas++;
        
        const valorJulho = columns[julhoCol];
        if (valorJulho && valorJulho !== '' && valorJulho !== '0') {
            pessoasComFrequencia++;
            frequenciasJulho++;
        }
    }
    
    console.log('\n📊 ANÁLISE JULHO:');
    console.log(`👥 Total de pessoas: ${totalPessoas}`);
    console.log(`📅 Pessoas com frequência em Julho: ${pessoasComFrequencia}`);
    console.log(`✅ Frequências de Julho a criar: ${frequenciasJulho}`);
    console.log(`📅 Data que será usada: 06/07/2025`);
    
    console.log('\n❓ CONFIRMA IMPORTAÇÃO DE JULHO?');
    console.log('Execute: node importar_julho.js <arquivo.csv>');
    
    db.close();
}

const csvFile = process.argv[2];
if (!csvFile) {
    console.log('❌ Uso: node analisar_julho.js <arquivo.csv>');
    process.exit(1);
}

analisarJulho(csvFile);