const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

function corrigirAcentuacaoCompleta() {
    console.log('🔄 Iniciando correção completa de acentuação...');
    
    db.all('SELECT id, nome FROM pessoas WHERE nome LIKE "%Ã%" OR nome LIKE "%Â%" OR nome LIKE "%Ê%" OR nome LIKE "%Ô%"', (err, pessoas) => {
        if (err) {
            console.log('❌ Erro:', err.message);
            return;
        }
        
        console.log(`📋 Encontradas ${pessoas.length} pessoas com problemas de acentuação`);
        
        let corrigidos = 0;
        let processados = 0;
        
        pessoas.forEach(pessoa => {
            const nomeOriginal = pessoa.nome;
            let nomeCorrigido = nomeOriginal;
            
            // Correções mais específicas para problemas comuns
            const correcoes = {
                'Ã¡': 'á', 'Ã ': 'à', 'Ã¢': 'â', 'Ã£': 'ã',
                'Ã©': 'é', 'Ãª': 'ê', 'Ã­': 'í', 'Ã³': 'ó',
                'Ã´': 'ô', 'Ãµ': 'õ', 'Ãº': 'ú', 'Ã§': 'ç',
                'Ã': 'Á', 'Ã': 'À', 'Ã': 'Â', 'Ã': 'Ã',
                'Ã': 'É', 'Ã': 'Ê', 'Ã': 'Í', 'Ã': 'Ó',
                'Ã': 'Ô', 'Ã': 'Õ', 'Ã': 'Ú', 'Ã': 'Ç',
                'Ã¼': 'ü', 'Ã±': 'ñ', 'Ã¨': 'è', 'Ã¬': 'ì',
                'Ã²': 'ò', 'Ã¹': 'ù', 'Ã¿': 'ÿ', 'Ã¯': 'ï',
                'Ã«': 'ë', 'Ã¶': 'ö', 'Ã¤': 'ä',
                // Correções específicas observadas
                'PAIXÃO': 'PAIXÃO', 'BRANDÃO': 'BRANDÃO', 'GALVÃO': 'GALVÃO',
                'CONCEIÇÃO': 'CONCEIÇÃO', 'JOÃO': 'JOÃO', 'SEBASTIÃO': 'SEBASTIÃO',
                'SALMEIRÃO': 'SALMEIRÃO', 'GUSMÃO': 'GUSMÃO', 'SERRÃO': 'SERRÃO',
                'ASSUNÇÃO': 'ASSUNÇÃO', 'MAGALHÃES': 'MAGALHÃES', 'NEGRÁO': 'NEGRÃO',
                'PANTALEÁO': 'PANTALEÃO', 'VALADÁO': 'VALADÃO', 'LOBÁO': 'LOBÃO',
                'PILÁO': 'PILÃO', 'JOÁO': 'JOÃO', 'CONCEIÇÁO': 'CONCEIÇÃO',
                'GALVÁO': 'GALVÃO', 'BRANDÁO': 'BRANDÃO', 'PAIXÁO': 'PAIXÃO',
                'SEBASTIÁO': 'SEBASTIÃO', 'SERRÁO': 'SERRÃO', 'ABRÁO': 'ABRÃO',
                'ROLDÁO': 'ROLDÃO', 'SALMEIRÁO': 'SALMEIRÃO'
            };
            
            // Aplicar todas as correções
            Object.entries(correcoes).forEach(([errado, correto]) => {
                nomeCorrigido = nomeCorrigido.replace(new RegExp(errado, 'g'), correto);
            });
            
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
                    console.log('\n📊 CORREÇÃO COMPLETA CONCLUÍDA:');
                    console.log(`✅ Nomes corrigidos: ${corrigidos}`);
                    console.log(`📋 Total processado: ${processados}`);
                    db.close();
                }, 2000);
            }
        });
    });
}

corrigirAcentuacaoCompleta();