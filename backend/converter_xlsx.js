const XLSX = require('xlsx');
const fs = require('fs');

try {
    console.log('📖 Lendo arquivo Excel...');
    const workbook = XLSX.readFile('../Setembro_Freq.xlsm');
    
    const sheetName = workbook.SheetNames[0];
    console.log(`📋 Planilha: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para CSV
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    // Salvar arquivo
    fs.writeFileSync('frequencias_completas.csv', csv, 'utf8');
    
    console.log('✅ Conversão concluída!');
    
    // Mostrar primeiras linhas
    const lines = csv.split('\n').slice(0, 3);
    console.log('📋 Primeiras linhas:');
    lines.forEach((line, i) => {
        console.log(`${i}: ${line.substring(0, 100)}...`);
    });
    
} catch (error) {
    console.error('❌ Erro:', error.message);
}