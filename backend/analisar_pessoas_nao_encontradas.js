const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function analisarPessoasNaoEncontradas(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    
    const pessoasNaoEncontradas = new Set();
    let totalLinhas = 0;
    
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (!nome) continue;
        
        totalLinhas++;
        
        db.get('SELECT id FROM pessoas WHERE nome = ?', [nome], (err, pessoa) => {
            if (!pessoa && !err) {
                pessoasNaoEncontradas.add(nome);
            }
            
            if (pessoasNaoEncontradas.size + (totalLinhas - pessoasNaoEncontradas.size) === totalLinhas) {
                console.log('\n📊 ANÁLISE DE PESSOAS NÃO ENCONTRADAS:');
                console.log(`👥 Total de linhas no CSV: ${totalLinhas}`);
                console.log(`❌ Pessoas não encontradas: ${pessoasNaoEncontradas.size}`);
                console.log(`✅ Pessoas já cadastradas: ${totalLinhas - pessoasNaoEncontradas.size}`);
                
                console.log('\n📋 Primeiras 20 pessoas não encontradas:');
                Array.from(pessoasNaoEncontradas).slice(0, 20).forEach(nome => {
                    console.log(`   - ${nome}`);
                });
                
                if (pessoasNaoEncontradas.size > 20) {
                    console.log(`   ... e mais ${pessoasNaoEncontradas.size - 20} pessoas`);
                }
                
                console.log('\n❓ Para cadastrar automaticamente, execute:');
                console.log('node cadastrar_pessoas_faltantes.js <arquivo.csv>');
                
                db.close();
            }
        });
    }
}

const csvFile = process.argv[2] || './frequencias_completas.csv';
analisarPessoasNaoEncontradas(csvFile);