const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function analisarFrequenciasMensais(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        console.log('❌ Arquivo CSV vazio');
        return;
    }

    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    console.log('📋 Cabeçalho detectado:', header);
    
    // Mapear meses por colunas
    const meses = {
        'janeiro': [], 'jan': [],
        'fevereiro': [], 'fev': [],
        'março': [], 'mar': [],
        'abril': [], 'abr': [],
        'maio': [], 'mai': [],
        'junho': [], 'jun': [],
        'julho': [], 'jul': [],
        'agosto': [], 'ago': [],
        'setembro': [], 'set': []
    };
    
    // Identificar colunas de cada mês
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        Object.keys(meses).forEach(mes => {
            if (colLower.includes(mes)) {
                meses[mes].push(index);
            }
        });
    });
    
    console.log('\n📅 MESES IDENTIFICADOS:');
    Object.keys(meses).forEach(mes => {
        if (meses[mes].length > 0) {
            console.log(`${mes.toUpperCase()}: ${meses[mes].length} colunas`);
        }
    });
    
    let totalFrequencias = 0;
    let pessoasProcessadas = 0;
    let novasPessoas = 0;
    
    const analiseDetalhada = {
        janeiro: 0, fevereiro: 0, março: 0, abril: 0, maio: 0,
        junho: 0, julho: 0, agosto: 0, setembro: 0
    };
    
    // Analisar cada linha
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (!nome) continue;
        
        pessoasProcessadas++;
        
        // Verificar cada mês
        Object.keys(meses).forEach(mes => {
            if (meses[mes].length === 0) return;
            
            meses[mes].forEach(colIndex => {
                const valor = columns[colIndex];
                if (valor && valor !== '' && valor !== '0') {
                    // Extrair data do valor
                    let data = null;
                    if (valor.includes('/')) {
                        const [dia, mesNum, ano] = valor.split('/');
                        data = `${ano || '2024'}-${(mesNum || getMesNumero(mes)).padStart(2, '0')}-${dia.padStart(2, '0')}`;
                    } else if (valor.match(/^\d{1,2}$/)) {
                        // Apenas dia
                        data = `2024-${getMesNumero(mes).padStart(2, '0')}-${valor.padStart(2, '0')}`;
                    }
                    
                    if (data) {
                        totalFrequencias++;
                        const mesKey = getMesNome(mes);
                        if (analiseDetalhada[mesKey] !== undefined) {
                            analiseDetalhada[mesKey]++;
                        }
                    }
                }
            });
        });
    }
    
    console.log('\n📊 ANÁLISE COMPLETA:');
    console.log(`👥 Pessoas no arquivo: ${pessoasProcessadas}`);
    console.log(`📅 Total de frequências a criar: ${totalFrequencias}`);
    
    console.log('\n📅 FREQUÊNCIAS POR MÊS:');
    Object.keys(analiseDetalhada).forEach(mes => {
        if (analiseDetalhada[mes] > 0) {
            console.log(`${mes.toUpperCase()}: ${analiseDetalhada[mes]} frequências`);
        }
    });
    
    // Verificar pessoas existentes no banco
    db.all('SELECT nome FROM pessoas', (err, pessoas) => {
        if (err) {
            console.error('Erro ao consultar banco:', err);
            return;
        }
        
        const nomesExistentes = pessoas.map(p => p.nome.toLowerCase());
        let pessoasExistentes = 0;
        
        for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
            const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
            const nome = columns[0];
            if (nome && nomesExistentes.some(n => n.includes(nome.toLowerCase()) || nome.toLowerCase().includes(n))) {
                pessoasExistentes++;
            }
        }
        
        novasPessoas = pessoasProcessadas - pessoasExistentes;
        
        console.log(`\n👤 PESSOAS:`);
        console.log(`✅ Já cadastradas: ${pessoasExistentes}`);
        console.log(`🆕 Novas a criar: ${novasPessoas}`);
        
        console.log('\n❓ DESEJA CONTINUAR COM A IMPORTAÇÃO?');
        console.log('Execute: node importar_frequencias_mensais.js <arquivo.csv>');
        
        db.close();
    });
}

function getMesNumero(mes) {
    const meses = {
        'janeiro': '01', 'jan': '01',
        'fevereiro': '02', 'fev': '02',
        'março': '03', 'mar': '03',
        'abril': '04', 'abr': '04',
        'maio': '05', 'mai': '05',
        'junho': '06', 'jun': '06',
        'julho': '07', 'jul': '07',
        'agosto': '08', 'ago': '08',
        'setembro': '09', 'set': '09'
    };
    return meses[mes.toLowerCase()] || '01';
}

function getMesNome(mes) {
    const nomes = {
        'jan': 'janeiro', 'janeiro': 'janeiro',
        'fev': 'fevereiro', 'fevereiro': 'fevereiro',
        'mar': 'março', 'março': 'março',
        'abr': 'abril', 'abril': 'abril',
        'mai': 'maio', 'maio': 'maio',
        'jun': 'junho', 'junho': 'junho',
        'jul': 'julho', 'julho': 'julho',
        'ago': 'agosto', 'agosto': 'agosto',
        'set': 'setembro', 'setembro': 'setembro'
    };
    return nomes[mes.toLowerCase()] || mes;
}

const csvFile = process.argv[2] || 'setembro_freq.csv';
analisarFrequenciasMensais(csvFile);