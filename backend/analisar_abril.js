const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function analisarAbril(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    console.log('📋 Cabeçalho:', header.slice(0, 10), '...');
    
    let abrilCol = -1;
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (colLower.includes('abril') || colLower.includes('abr')) {
            abrilCol = index;
            console.log(`📅 Coluna Abril encontrada: ${index} (${col})`);
        }
    });
    
    if (abrilCol === -1) {
        console.log('❌ Coluna de Abril não encontrada');
        return;
    }
    
    let totalPessoas = 0;
    let pessoasComFrequencia = 0;
    let frequenciasAbril = 0;
    
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (!nome) continue;
        
        totalPessoas++;
        
        const valorAbril = columns[abrilCol];
        if (valorAbril && valorAbril !== '' && valorAbril !== '0') {
            pessoasComFrequencia++;
            frequenciasAbril++;
        }
    }
    
    console.log('\n📊 ANÁLISE ABRIL:');
    console.log(`👥 Total de pessoas: ${totalPessoas}`);
    console.log(`📅 Pessoas com frequência em Abril: ${pessoasComFrequencia}`);
    console.log(`✅ Frequências de Abril a criar: ${frequenciasAbril}`);
    console.log(`📅 Data que será usada: 06/04/2025`);
    
    console.log('\n❓ CONFIRMA IMPORTAÇÃO DE ABRIL?');
    console.log('Execute: node importar_abril.js <arquivo.csv>');
    
    db.close();
}

const csvFile = process.argv[2];
if (!csvFile) {
    console.log('❌ Uso: node analisar_abril.js <arquivo.csv>');
    process.exit(1);
}

analisarAbril(csvFile);