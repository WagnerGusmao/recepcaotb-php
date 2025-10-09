const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function analisarFevereiro(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    console.log('📋 Cabeçalho:', header.slice(0, 10), '...');
    
    // Encontrar coluna de fevereiro
    let fevereiroCol = -1;
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (colLower.includes('fevereiro') || colLower.includes('fev')) {
            fevereiroCol = index;
            console.log(`📅 Coluna Fevereiro encontrada: ${index} (${col})`);
        }
    });
    
    if (fevereiroCol === -1) {
        console.log('❌ Coluna de Fevereiro não encontrada');
        return;
    }
    
    let totalPessoas = 0;
    let pessoasComFrequencia = 0;
    let frequenciasFevereiro = 0;
    
    // Analisar cada linha
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[4]; // NOME COMPLETO está na posição 4
        if (!nome) continue;
        
        totalPessoas++;
        
        const valorFevereiro = columns[fevereiroCol];
        if (valorFevereiro && valorFevereiro !== '' && valorFevereiro !== '0') {
            pessoasComFrequencia++;
            frequenciasFevereiro++;
        }
    }
    
    console.log('\n📊 ANÁLISE FEVEREIRO:');
    console.log(`👥 Total de pessoas: ${totalPessoas}`);
    console.log(`📅 Pessoas com frequência em Fevereiro: ${pessoasComFrequencia}`);
    console.log(`✅ Frequências de Fevereiro a criar: ${frequenciasFevereiro}`);
    console.log(`📅 Data que será usada: 12/02/2025`);
    
    console.log('\n❓ CONFIRMA IMPORTAÇÃO DE FEVEREIRO?');
    console.log('Execute: node importar_fevereiro.js <arquivo.csv>');
    
    db.close();
}

const csvFile = process.argv[2];
if (!csvFile) {
    console.log('❌ Uso: node analisar_fevereiro.js <arquivo.csv>');
    process.exit(1);
}

analisarFevereiro(csvFile);