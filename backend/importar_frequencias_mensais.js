const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function importarFrequenciasMensais(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    // Mapear meses
    const meses = {
        'janeiro': [], 'jan': [], 'fevereiro': [], 'fev': [],
        'março': [], 'mar': [], 'abril': [], 'abr': [],
        'maio': [], 'mai': [], 'junho': [], 'jun': [],
        'julho': [], 'jul': [], 'agosto': [], 'ago': [],
        'setembro': [], 'set': []
    };
    
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        Object.keys(meses).forEach(mes => {
            if (colLower.includes(mes)) {
                meses[mes].push(index);
            }
        });
    });
    
    let senhaSequencial = 1;
    let totalProcessadas = 0;
    let novasPessoas = 0;
    let pessoasProcessadas = 0;
    
    console.log('🚀 INICIANDO IMPORTAÇÃO...\n');
    
    // Processar cada pessoa
    const processarProximaPessoa = (lineIndex) => {
        if (lineIndex >= lines.length) {
            // Finalizar
            setTimeout(() => {
                console.log('\n📊 IMPORTAÇÃO CONCLUÍDA:');
                console.log(`✅ Frequências criadas: ${totalProcessadas}`);
                console.log(`👤 Novas pessoas: ${novasPessoas}`);
                console.log(`🔢 Última senha: ${senhaSequencial - 1}`);
                db.close();
            }, 1000);
            return;
        }
        
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2 || !columns[0]) {
            processarProximaPessoa(lineIndex + 1);
            return;
        }
        
        const nome = columns[0];
        const cpf = columns[1] || '';
        
        console.log(`👤 Processando: ${nome}`);
        pessoasProcessadas++;
        
        // Buscar pessoa no banco
        db.get(
            'SELECT id FROM pessoas WHERE nome LIKE ? OR (cpf != "" AND cpf = ?)',
            [`%${nome}%`, cpf],
            (err, pessoa) => {
                if (err) {
                    console.error('❌ Erro ao buscar pessoa:', err);
                    processarProximaPessoa(lineIndex + 1);
                    return;
                }
                
                const processarFrequenciasPessoa = (pessoaId) => {
                    let frequenciasAdicionadas = 0;
                    
                    // Processar cada mês
                    Object.keys(meses).forEach(mes => {
                        if (meses[mes].length === 0) return;
                        
                        meses[mes].forEach(colIndex => {
                            const valor = columns[colIndex];
                            if (!valor || valor === '' || valor === '0') return;
                            
                            let data = null;
                            if (valor.includes('/')) {
                                const [dia, mesNum, ano] = valor.split('/');
                                data = `${ano || '2024'}-${(mesNum || getMesNumero(mes)).padStart(2, '0')}-${dia.padStart(2, '0')}`;
                            } else if (valor.match(/^\d{1,2}$/)) {
                                data = `2024-${getMesNumero(mes).padStart(2, '0')}-${valor.padStart(2, '0')}`;
                            }
                            
                            if (data) {
                                db.run(
                                    'INSERT INTO frequencias (pessoa_id, tipo, numero_senha, data, created_at) VALUES (?, ?, ?, ?, datetime("now", "localtime"))',
                                    [pessoaId, 'Comum', senhaSequencial.toString().padStart(3, '0'), data],
                                    function(err) {
                                        if (!err) {
                                            totalProcessadas++;
                                            senhaSequencial++;
                                            frequenciasAdicionadas++;
                                        }
                                    }
                                );
                            }
                        });
                    });
                    
                    if (frequenciasAdicionadas > 0) {
                        console.log(`  ✅ ${frequenciasAdicionadas} frequências adicionadas`);
                    }
                    
                    // Processar próxima pessoa
                    setTimeout(() => processarProximaPessoa(lineIndex + 1), 100);
                };
                
                if (pessoa) {
                    processarFrequenciasPessoa(pessoa.id);
                } else {
                    // Criar nova pessoa
                    db.run(
                        'INSERT INTO pessoas (nome, cpf, created_at) VALUES (?, ?, datetime("now", "localtime"))',
                        [nome, cpf],
                        function(err) {
                            if (err) {
                                console.error('❌ Erro ao criar pessoa:', err);
                                processarProximaPessoa(lineIndex + 1);
                            } else {
                                novasPessoas++;
                                console.log(`  🆕 Nova pessoa criada: ${nome}`);
                                processarFrequenciasPessoa(this.lastID);
                            }
                        }
                    );
                }
            }
        );
    };
    
    // Iniciar processamento
    processarProximaPessoa(1);
}

function getMesNumero(mes) {
    const meses = {
        'janeiro': '01', 'jan': '01', 'fevereiro': '02', 'fev': '02',
        'março': '03', 'mar': '03', 'abril': '04', 'abr': '04',
        'maio': '05', 'mai': '05', 'junho': '06', 'jun': '06',
        'julho': '07', 'jul': '07', 'agosto': '08', 'ago': '08',
        'setembro': '09', 'set': '09'
    };
    return meses[mes.toLowerCase()] || '01';
}

const csvFile = process.argv[2];
if (!csvFile) {
    console.log('❌ Uso: node importar_frequencias_mensais.js <arquivo.csv>');
    process.exit(1);
}

importarFrequenciasMensais(csvFile);