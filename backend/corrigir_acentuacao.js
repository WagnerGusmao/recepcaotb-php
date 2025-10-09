const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

function corrigirAcentuacao() {
    console.log('🔄 Iniciando correção de acentuação...');
    
    db.all('SELECT id, nome FROM pessoas', (err, pessoas) => {
        if (err) {
            console.log('❌ Erro:', err.message);
            return;
        }
        
        let corrigidos = 0;
        let processados = 0;
        
        pessoas.forEach(pessoa => {
            const nomeOriginal = pessoa.nome;
            const nomeCorrigido = nomeOriginal
                .replace(/Ã¡/g, 'á')
                .replace(/Ã /g, 'à')
                .replace(/Ã¢/g, 'â')
                .replace(/Ã£/g, 'ã')
                .replace(/Ã©/g, 'é')
                .replace(/Ãª/g, 'ê')
                .replace(/Ã­/g, 'í')
                .replace(/Ã³/g, 'ó')
                .replace(/Ã´/g, 'ô')
                .replace(/Ãµ/g, 'õ')
                .replace(/Ãº/g, 'ú')
                .replace(/Ã§/g, 'ç')
                .replace(/Ã/g, 'Á')
                .replace(/Ã/g, 'À')
                .replace(/Ã/g, 'Â')
                .replace(/Ã/g, 'Ã')
                .replace(/Ã/g, 'É')
                .replace(/Ã/g, 'Ê')
                .replace(/Ã/g, 'Í')
                .replace(/Ã/g, 'Ó')
                .replace(/Ã/g, 'Ô')
                .replace(/Ã/g, 'Õ')
                .replace(/Ã/g, 'Ú')
                .replace(/Ã/g, 'Ç');
            
            processados++;
            
            if (nomeOriginal !== nomeCorrigido) {
                db.run('UPDATE pessoas SET nome = ? WHERE id = ?', [nomeCorrigido, pessoa.id], (err) => {
                    if (err) {
                        console.log(`❌ Erro ao corrigir ${pessoa.id}:`, err.message);
                    } else {
                        corrigidos++;
                        console.log(`✅ ${nomeOriginal} → ${nomeCorrigido}`);
                    }
                });
            }
            
            if (processados === pessoas.length) {
                setTimeout(() => {
                    console.log('\n📊 CORREÇÃO DE ACENTUAÇÃO CONCLUÍDA:');
                    console.log(`✅ Nomes corrigidos: ${corrigidos}`);
                    console.log(`📋 Total processado: ${processados}`);
                    db.close();
                }, 1000);
            }
        });
    });
}

corrigirAcentuacao();