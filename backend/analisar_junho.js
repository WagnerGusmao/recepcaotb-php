const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function analisarJunho(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    console.log('📋 Cabeçalho:', header.slice(0, 10), '...');
    
    let junhoCol = -1;
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (colLower.includes('junho') || colLower.includes('jun')) {
            junhoCol = index;
            console.log(`📅 Coluna Junho encontrada: ${index} (${col})`);
        }
    });
    
    if (junhoCol === -1) {
        console.log('❌ Coluna de Junho não encontrada');
        return;
    }
    
    let totalPessoas = 0;
    let pessoasComFrequencia = 0;
    let frequenciasJunho = 0;
    
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (!nome) continue;
        
        totalPessoas++;
        
        const valorJunho = columns[junhoCol];
        if (valorJunho && valorJunho !== '' && valorJunho !== '0') {
            pessoasComFrequencia++;
            frequenciasJunho++;
        }
    }
    
    console.log('\n📊 ANÁLISE JUNHO:');
    console.log(`👥 Total de pessoas: ${totalPessoas}`);
    console.log(`📅 Pessoas com frequência em Junho: ${pessoasComFrequencia}`);
    console.log(`✅ Frequências de Junho a criar: ${frequenciasJunho}`);
    console.log(`📅 Data que será usada: 01/06/2025`);
    
    console.log('\n❓ CONFIRMA IMPORTAÇÃO DE JUNHO?');
    console.log('Execute: node importar_junho.js <arquivo.csv>');
    
    db.close();
}

const csvFile = process.argv[2];
if (!csvFile) {
    console.log('❌ Uso: node analisar_junho.js <arquivo.csv>');
    process.exit(1);
}

analisarJunho(csvFile);