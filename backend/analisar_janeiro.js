const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function analisarJaneiro(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    console.log('📋 Cabeçalho:', header.slice(0, 10), '...');
    
    // Encontrar coluna de janeiro
    let janeiroCol = -1;
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (colLower.includes('janeiro') || colLower.includes('jan')) {
            janeiroCol = index;
            console.log(`📅 Coluna Janeiro encontrada: ${index} (${col})`);
        }
    });
    
    if (janeiroCol === -1) {
        console.log('❌ Coluna de Janeiro não encontrada');
        return;
    }
    
    let totalPessoas = 0;
    let pessoasComFrequencia = 0;
    let frequenciasJaneiro = 0;
    
    // Analisar cada linha
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (!nome) continue;
        
        totalPessoas++;
        
        const valorJaneiro = columns[janeiroCol];
        if (valorJaneiro && valorJaneiro !== '' && valorJaneiro !== '0') {
            pessoasComFrequencia++;
            frequenciasJaneiro++;
        }
    }
    
    console.log('\n📊 ANÁLISE JANEIRO:');
    console.log(`👥 Total de pessoas: ${totalPessoas}`);
    console.log(`📅 Pessoas com frequência em Janeiro: ${pessoasComFrequencia}`);
    console.log(`✅ Frequências de Janeiro a criar: ${frequenciasJaneiro}`);
    console.log(`📅 Data que será usada: 12/01/2025`);
    
    console.log('\n❓ CONFIRMA IMPORTAÇÃO DE JANEIRO?');
    console.log('Execute: node importar_janeiro.js <arquivo.csv>');
    
    db.close();
}

const csvFile = process.argv[2];
if (!csvFile) {
    console.log('❌ Uso: node analisar_janeiro.js <arquivo.csv>');
    process.exit(1);
}

analisarJaneiro(csvFile);