const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function contarPessoasFaltantes(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    
    const todasPessoas = new Set();
    
    // Coletar todos os nomes do CSV
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (nome) {
            todasPessoas.add(nome);
        }
    }
    
    console.log(`📋 Total de pessoas únicas no CSV: ${todasPessoas.size}`);
    
    // Verificar quantas já existem no banco
    db.all('SELECT nome FROM pessoas', (err, rows) => {
        if (err) {
            console.log('❌ Erro:', err.message);
            return;
        }
        
        const pessoasExistentes = new Set(rows.map(row => row.nome));
        const pessoasFaltantes = new Set();
        
        todasPessoas.forEach(nome => {
            if (!pessoasExistentes.has(nome)) {
                pessoasFaltantes.add(nome);
            }
        });
        
        console.log(`✅ Pessoas já cadastradas: ${pessoasExistentes.size}`);
        console.log(`❌ Pessoas não encontradas: ${pessoasFaltantes.size}`);
        
        console.log('\n📋 Primeiras 20 pessoas não encontradas:');
        Array.from(pessoasFaltantes).slice(0, 20).forEach(nome => {
            console.log(`   - ${nome}`);
        });
        
        if (pessoasFaltantes.size > 20) {
            console.log(`   ... e mais ${pessoasFaltantes.size - 20} pessoas`);
        }
        
        console.log('\n❓ Para cadastrar automaticamente, execute:');
        console.log('node cadastrar_pessoas_faltantes.js');
        
        db.close();
    });
}

const csvFile = process.argv[2] || './frequencias_completas.csv';
contarPessoasFaltantes(csvFile);