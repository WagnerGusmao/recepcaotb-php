const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function analisarSetembro(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    console.log('📋 Cabeçalho:', header.slice(0, 10), '...');
    
    let setembroCol = -1;
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (colLower.includes('setembro') || colLower.includes('set')) {
            setembroCol = index;
            console.log(`📅 Coluna Setembro encontrada: ${index} (${col})`);
        }
    });
    
    if (setembroCol === -1) {
        console.log('❌ Coluna de Setembro não encontrada');
        return;
    }
    
    let totalPessoas = 0;
    let pessoasComFrequencia = 0;
    let frequenciasSetembro = 0;
    
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (!nome) continue;
        
        totalPessoas++;
        
        const valorSetembro = columns[setembroCol];
        if (valorSetembro && valorSetembro !== '' && valorSetembro !== '0') {
            pessoasComFrequencia++;
            frequenciasSetembro++;
        }
    }
    
    console.log('\n📊 ANÁLISE SETEMBRO:');
    console.log(`👥 Total de pessoas: ${totalPessoas}`);
    console.log(`📅 Pessoas com frequência em Setembro: ${pessoasComFrequencia}`);
    console.log(`✅ Frequências de Setembro a criar: ${frequenciasSetembro}`);
    console.log(`📅 Data que será usada: 07/09/2025`);
    
    console.log('\n❓ CONFIRMA IMPORTAÇÃO DE SETEMBRO?');
    console.log('Execute: node importar_setembro.js <arquivo.csv>');
    
    db.close();
}

const csvFile = process.argv[2];
if (!csvFile) {
    console.log('❌ Uso: node analisar_setembro.js <arquivo.csv>');
    process.exit(1);
}

analisarSetembro(csvFile);