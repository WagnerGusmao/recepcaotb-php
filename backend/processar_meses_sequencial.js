const { execSync } = require('child_process');

const meses = [
    'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro'
];

console.log('🚀 Iniciando processamento sequencial dos meses...\n');

meses.forEach((mes, index) => {
    console.log(`📅 Processando ${mes.toUpperCase()} (${index + 1}/${meses.length})`);
    
    try {
        const resultado = execSync(`node importar_${mes}.js frequencias_completas.csv`, { 
            encoding: 'utf8',
            timeout: 30000
        });
        console.log(resultado);
    } catch (error) {
        console.log(`❌ Erro ao processar ${mes}:`, error.message);
    }
    
    console.log(`✅ ${mes.toUpperCase()} concluído\n`);
});

console.log('🎉 Processamento de todos os meses finalizado!');