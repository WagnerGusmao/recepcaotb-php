const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function analisarAgosto(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    console.log('📋 Cabeçalho:', header.slice(0, 10), '...');
    
    let agostoCol = -1;
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (colLower.includes('agosto') || colLower.includes('ago')) {
            agostoCol = index;
            console.log(`📅 Coluna Agosto encontrada: ${index} (${col})`);
        }
    });
    
    if (agostoCol === -1) {
        console.log('❌ Coluna de Agosto não encontrada');
        return;
    }
    
    let totalPessoas = 0;
    let pessoasComFrequencia = 0;
    let frequenciasAgosto = 0;
    
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (!nome) continue;
        
        totalPessoas++;
        
        const valorAgosto = columns[agostoCol];
        if (valorAgosto && valorAgosto !== '' && valorAgosto !== '0') {
            pessoasComFrequencia++;
            frequenciasAgosto++;
        }
    }
    
    console.log('\n📊 ANÁLISE AGOSTO:');
    console.log(`👥 Total de pessoas: ${totalPessoas}`);
    console.log(`📅 Pessoas com frequência em Agosto: ${pessoasComFrequencia}`);
    console.log(`✅ Frequências de Agosto a criar: ${frequenciasAgosto}`);
    console.log(`📅 Data que será usada: 03/08/2025`);
    
    console.log('\n❓ CONFIRMA IMPORTAÇÃO DE AGOSTO?');
    console.log('Execute: node importar_agosto.js <arquivo.csv>');
    
    db.close();
}

const csvFile = process.argv[2];
if (!csvFile) {
    console.log('❌ Uso: node analisar_agosto.js <arquivo.csv>');
    process.exit(1);
}

analisarAgosto(csvFile);