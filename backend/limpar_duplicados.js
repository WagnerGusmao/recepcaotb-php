const db = require('./database');

async function analisarDuplicados() {
    return new Promise((resolve, reject) => {
        // Buscar duplicados por CPF
        const sql = `
            SELECT cpf, COUNT(*) as total, GROUP_CONCAT(id) as ids
            FROM pessoas 
            WHERE cpf IS NOT NULL AND cpf != ''
            GROUP BY cpf 
            HAVING COUNT(*) > 1
            ORDER BY total DESC
        `;
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log(`\n📊 ANÁLISE DE DUPLICADOS`);
            console.log(`Total de CPFs duplicados: ${rows.length}`);
            
            if (rows.length > 0) {
                console.log(`\nCPFs com mais duplicatas:`);
                rows.slice(0, 10).forEach(row => {
                    console.log(`CPF: ${row.cpf} - ${row.total} registros (IDs: ${row.ids})`);
                });
            }
            
            resolve(rows);
        });
    });
}

async function limparDuplicados() {
    return new Promise((resolve, reject) => {
        // Buscar todos os grupos de duplicados
        const sql = `
            SELECT cpf, GROUP_CONCAT(id) as ids
            FROM pessoas 
            WHERE cpf IS NOT NULL AND cpf != ''
            GROUP BY cpf 
            HAVING COUNT(*) > 1
        `;
        
        db.all(sql, [], async (err, grupos) => {
            if (err) {
                reject(err);
                return;
            }
            
            let totalRemovidos = 0;
            
            for (const grupo of grupos) {
                const ids = grupo.ids.split(',').map(id => parseInt(id));
                
                // Buscar detalhes de cada registro
                const detalhes = await new Promise((res, rej) => {
                    const placeholders = ids.map(() => '?').join(',');
                    db.all(`SELECT * FROM pessoas WHERE id IN (${placeholders})`, ids, (err, rows) => {
                        if (err) rej(err);
                        else res(rows);
                    });
                });
                
                // Encontrar o registro mais completo
                let melhorRegistro = detalhes[0];
                let pontuacaoMelhor = calcularCompletude(melhorRegistro);
                
                for (const registro of detalhes) {
                    const pontuacao = calcularCompletude(registro);
                    if (pontuacao > pontuacaoMelhor) {
                        melhorRegistro = registro;
                        pontuacaoMelhor = pontuacao;
                    }
                }
                
                // Mesclar dados dos outros registros no melhor
                const dadosMesclados = mesclarDados(detalhes, melhorRegistro);
                
                // Atualizar o melhor registro com dados mesclados
                await atualizarRegistro(melhorRegistro.id, dadosMesclados);
                
                // Transferir frequências para o registro mantido
                const idsParaRemover = ids.filter(id => id !== melhorRegistro.id);
                for (const idRemover of idsParaRemover) {
                    await transferirFrequencias(idRemover, melhorRegistro.id);
                }
                
                // Remover registros duplicados
                for (const idRemover of idsParaRemover) {
                    await removerRegistro(idRemover);
                    totalRemovidos++;
                }
                
                console.log(`✅ CPF ${grupo.cpf}: mantido ID ${melhorRegistro.id}, removidos ${idsParaRemover.length} duplicados`);
            }
            
            console.log(`\n🎯 LIMPEZA CONCLUÍDA: ${totalRemovidos} registros duplicados removidos`);
            resolve(totalRemovidos);
        });
    });
}

function calcularCompletude(registro) {
    let pontos = 0;
    const campos = ['nome', 'cpf', 'nascimento', 'religiao', 'cidade', 'estado', 'telefone', 'email'];
    
    campos.forEach(campo => {
        if (registro[campo] && registro[campo].toString().trim() !== '') {
            pontos++;
        }
    });
    
    return pontos;
}

function mesclarDados(registros, base) {
    const mesclado = { ...base };
    
    registros.forEach(registro => {
        Object.keys(registro).forEach(campo => {
            if ((!mesclado[campo] || mesclado[campo].toString().trim() === '') && 
                registro[campo] && registro[campo].toString().trim() !== '') {
                mesclado[campo] = registro[campo];
            }
        });
    });
    
    return mesclado;
}

async function atualizarRegistro(id, dados) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE pessoas SET 
                nome=?, cpf=?, nascimento=?, religiao=?, 
                cidade=?, estado=?, telefone=?, email=?
            WHERE id=?
        `;
        
        db.run(sql, [
            dados.nome, dados.cpf, dados.nascimento, dados.religiao,
            dados.cidade, dados.estado, dados.telefone, dados.email, id
        ], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function transferirFrequencias(idOrigem, idDestino) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE frequencias SET pessoa_id=? WHERE pessoa_id=?', [idDestino, idOrigem], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function removerRegistro(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM pessoas WHERE id=?', [id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function executar() {
    try {
        console.log('🔍 Iniciando análise de duplicados...');
        
        const duplicados = await analisarDuplicados();
        
        if (duplicados.length === 0) {
            console.log('✅ Nenhum duplicado encontrado!');
            return;
        }
        
        console.log('\n🧹 Iniciando limpeza...');
        await limparDuplicados();
        
        console.log('\n📊 Análise final...');
        await analisarDuplicados();
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

if (require.main === module) {
    executar();
}

module.exports = { analisarDuplicados, limparDuplicados };