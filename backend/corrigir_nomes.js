const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function corrigirNomes(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    
    let corrigidos = 0;
    let naoEncontrados = 0;
    let processados = 0;
    let totalLinhas = 0;
    
    // Contar linhas válidas
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        if (columns.length >= 5 && columns[0] && columns[4]) {
            totalLinhas++;
        }
    }
    
    console.log(`🔄 Iniciando correção de ${totalLinhas} nomes...`);
    
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 5) continue;
        
        const idEntrada = columns[0]; // ID_ENTRADA (nome atual incorreto)
        const nomeCompleto = columns[4]; // NOME COMPLETO (nome correto)
        
        if (!idEntrada || !nomeCompleto) continue;
        
        // Buscar pessoa pelo nome atual (que é o ID_ENTRADA)
        db.get('SELECT id FROM pessoas WHERE nome = ?', [idEntrada], (err, pessoa) => {
            processados++;
            
            if (err) {
                console.log(`❌ Erro ao buscar ${idEntrada}:`, err.message);
            } else if (pessoa) {
                // Atualizar com o nome correto
                db.run('UPDATE pessoas SET nome = ? WHERE id = ?', [nomeCompleto, pessoa.id], (err) => {
                    if (err) {
                        console.log(`❌ Erro ao atualizar ${idEntrada}:`, err.message);
                    } else {
                        corrigidos++;
                        console.log(`✅ ${idEntrada} → ${nomeCompleto}`);
                    }
                });
            } else {
                naoEncontrados++;
                console.log(`⚠️ Não encontrado: ${idEntrada}`);
            }
            
            // Relatório final
            if (processados === totalLinhas) {
                setTimeout(() => {
                    console.log('\n📊 CORREÇÃO CONCLUÍDA:');
                    console.log(`✅ Nomes corrigidos: ${corrigidos}`);
                    console.log(`⚠️ Não encontrados: ${naoEncontrados}`);
                    console.log(`📋 Total processado: ${processados}`);
                    db.close();
                }, 2000);
            }
        });
    }
}

const csvFile = process.argv[2] || './frequencias_completas.csv';
corrigirNomes(csvFile);