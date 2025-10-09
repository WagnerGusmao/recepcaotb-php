const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('../Setembro_Freq.xlsm');
    
    console.log('📋 Planilhas disponíveis:');
    workbook.SheetNames.forEach((name, index) => {
        console.log(`${index + 1}. ${name}`);
        
        const worksheet = workbook.Sheets[name];
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        console.log(`   Tamanho: ${range.e.r + 1} linhas x ${range.e.c + 1} colunas`);
        
        // Mostrar primeira linha
        const firstRow = XLSX.utils.sheet_to_json(worksheet, {header: 1})[0] || [];
        console.log(`   Primeira linha: ${firstRow.slice(0, 5).join(', ')}...`);
        console.log('');
    });
    
} catch (error) {
    console.error('❌ Erro:', error.message);
}