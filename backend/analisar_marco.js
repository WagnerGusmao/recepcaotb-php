const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function analisarMarco(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    console.log('📋 Cabeçalho:', header.slice(0, 10), '...');
    
    let marcoCol = -1;
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (colLower.includes('março') || colLower.includes('mar')) {
            marcoCol = index;
            console.log(`📅 Coluna Março encontrada: ${index} (${col})`);
        }
    });
    
    if (marcoCol === -1) {
        console.log('❌ Coluna de Março não encontrada');
        return;
    }
    
    let totalPessoas = 0;
    let pessoasComFrequencia = 0;
    let frequenciasMarco = 0;
    
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (!nome) continue;
        
        totalPessoas++;
        
        const valorMarco = columns[marcoCol];
        if (valorMarco && valorMarco !== '' && valorMarco !== '0') {
            pessoasComFrequencia++;
            frequenciasMarco++;
        }
    }
    
    console.log('\n📊 ANÁLISE MARÇO:');
    console.log(`👥 Total de pessoas: ${totalPessoas}`);
    console.log(`📅 Pessoas com frequência em Março: ${pessoasComFrequencia}`);
    console.log(`✅ Frequências de Março a criar: ${frequenciasMarco}`);
    console.log(`📅 Data que será usada: 02/03/2025`);
    
    console.log('\n❓ CONFIRMA IMPORTAÇÃO DE MARÇO?');
    console.log('Execute: node importar_marco.js <arquivo.csv>');
    
    db.close();
}

const csvFile = process.argv[2];
if (!csvFile) {
    console.log('❌ Uso: node analisar_marco.js <arquivo.csv>');
    process.exit(1);
}

analisarMarco(csvFile);