const XLSX = require('xlsx');
const fs = require('fs');

try {
    console.log('📖 Lendo planilha Cadastro...');
    const workbook = XLSX.readFile('../Setembro_Freq.xlsm');
    const worksheet = workbook.Sheets['Cadastro'];
    
    // Converter para CSV
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    fs.writeFileSync('frequencias_completas.csv', csv, 'utf8');
    
    console.log('✅ Conversão da planilha Cadastro concluída!');
    
    // Mostrar cabeçalho
    const lines = csv.split('\n');
    const header = lines[0].split(',');
    console.log('📋 Cabeçalho:');
    header.slice(0, 15).forEach((col, i) => {
        console.log(`${i}: ${col}`);
    });
    
    console.log(`\n📊 Total de linhas: ${lines.length}`);
    
} catch (error) {
    console.error('❌ Erro:', error.message);
}