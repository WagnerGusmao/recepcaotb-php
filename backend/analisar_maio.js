const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function analisarMaio(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    console.log('📋 Cabeçalho:', header.slice(0, 10), '...');
    
    let maioCol = -1;
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (colLower.includes('maio') || colLower.includes('mai')) {
            maioCol = index;
            console.log(`📅 Coluna Maio encontrada: ${index} (${col})`);
        }
    });
    
    if (maioCol === -1) {
        console.log('❌ Coluna de Maio não encontrada');
        return;
    }
    
    let totalPessoas = 0;
    let pessoasComFrequencia = 0;
    let frequenciasMaio = 0;
    
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (!nome) continue;
        
        totalPessoas++;
        
        const valorMaio = columns[maioCol];
        if (valorMaio && valorMaio !== '' && valorMaio !== '0') {
            pessoasComFrequencia++;
            frequenciasMaio++;
        }
    }
    
    console.log('\n📊 ANÁLISE MAIO:');
    console.log(`👥 Total de pessoas: ${totalPessoas}`);
    console.log(`📅 Pessoas com frequência em Maio: ${pessoasComFrequencia}`);
    console.log(`✅ Frequências de Maio a criar: ${frequenciasMaio}`);
    console.log(`📅 Data que será usada: 04/05/2025`);
    
    console.log('\n❓ CONFIRMA IMPORTAÇÃO DE MAIO?');
    console.log('Execute: node importar_maio.js <arquivo.csv>');
    
    db.close();
}

const csvFile = process.argv[2];
if (!csvFile) {
    console.log('❌ Uso: node analisar_maio.js <arquivo.csv>');
    process.exit(1);
}

analisarMaio(csvFile);