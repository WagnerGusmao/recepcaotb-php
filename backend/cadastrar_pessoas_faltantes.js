const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function cadastrarPessoasFaltantes(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    
    let cadastrados = 0;
    let jaExistiam = 0;
    let processados = 0;
    let totalLinhas = 0;
    
    // Contar total de linhas válidas
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        if (columns.length >= 2 && columns[0]) {
            totalLinhas++;
        }
    }
    
    console.log(`📋 Processando ${totalLinhas} pessoas do CSV...`);
    
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[0];
        if (!nome) continue;
        
        db.get('SELECT id FROM pessoas WHERE nome = ?', [nome], (err, pessoa) => {
            processados++;
            
            if (err) {
                console.log(`❌ Erro ao verificar ${nome}:`, err.message);
            } else if (pessoa) {
                jaExistiam++;
            } else {
                // Cadastrar pessoa com dados mínimos
                db.run(`
                    INSERT INTO pessoas (nome, cpf, nascimento, sexo, created_at) 
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    nome,
                    `000.000.000-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`, // CPF temporário
                    '1990-01-01', // Data padrão
                    'Não informado', // Sexo padrão
                    new Date().toISOString()
                ], function(err) {
                    if (err) {
                        console.log(`❌ Erro ao cadastrar ${nome}:`, err.message);
                    } else {
                        cadastrados++;
                        console.log(`✅ Cadastrado: ${nome} (ID: ${this.lastID})`);
                    }
                });
            }
            
            if (processados === totalLinhas) {
                setTimeout(() => {
                    console.log('\n📊 RESULTADO DO CADASTRO:');
                    console.log(`✅ Pessoas cadastradas: ${cadastrados}`);
                    console.log(`👥 Já existiam: ${jaExistiam}`);
                    console.log(`📋 Total processado: ${processados}`);
                    
                    console.log('\n🎉 Agora você pode executar novamente a importação das frequências!');
                    db.close();
                }, 2000);
            }
        });
    }
}

const csvFile = process.argv[2] || './frequencias_completas.csv';
cadastrarPessoasFaltantes(csvFile);