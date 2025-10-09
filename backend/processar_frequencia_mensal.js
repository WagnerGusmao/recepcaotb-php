const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function processarFrequenciaMensal(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        console.log('📋 Converta o Setembro_Freq.xlsx para CSV primeiro');
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        console.log('❌ Arquivo CSV vazio');
        return;
    }

    console.log(`📊 Processando ${lines.length} linhas...`);
    
    // Detectar separador (vírgula ou ponto e vírgula)
    const separator = lines[0].includes(',') ? ',' : ';';
    console.log(`📋 Separador detectado: '${separator}'`);
    
    // Analisar cabeçalho para identificar colunas de datas
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    console.log('📋 Cabeçalho:', header);
    
    // Identificar colunas de dados (nome, cpf) e colunas de datas
    const nomeCol = 4; // Quinta coluna = NOME COMPLETO
    const cpfCol = 3;  // Quarta coluna = CPF
    const dataCols = []; // Colunas com datas
    
    // Identificar colunas que podem ser datas (números ou datas)
    for (let i = 2; i < header.length; i++) {
        const colName = header[i].toLowerCase();
        if (colName.includes('dia') || colName.match(/^\d+$/) || colName.includes('/')) {
            dataCols.push(i);
        }
    }
    
    console.log(`📅 Colunas de data identificadas: ${dataCols.length}`);
    
    let processedCount = 0;
    let errorCount = 0;
    let newPersonCount = 0;
    
    // Processar cada linha de dados
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const nome = columns[nomeCol];
        const cpf = columns[cpfCol] || '';
        
        if (!nome) continue;
        
        console.log(`👤 Processando: ${nome}`);
        
        // Buscar pessoa no banco
        db.get(
            'SELECT id FROM pessoas WHERE nome LIKE ? OR (cpf != "" AND cpf = ?)',
            [`%${nome}%`, cpf],
            (err, pessoa) => {
                if (err) {
                    console.error('❌ Erro ao buscar pessoa:', err);
                    errorCount++;
                    return;
                }
                
                const processarFrequencias = (pessoaId) => {
                    // Processar cada coluna de data
                    dataCols.forEach(colIndex => {
                        const dataValue = columns[colIndex];
                        if (!dataValue || dataValue === '' || dataValue === '0') return;
                        
                        // Determinar data baseada no cabeçalho e valor
                        let dataFinal;
                        const headerValue = header[colIndex];
                        
                        if (dataValue.includes('/')) {
                            // Valor já é uma data
                            const [dia, mes, ano] = dataValue.split('/');
                            dataFinal = `${ano || '2024'}-${(mes || '09').padStart(2, '0')}-${dia.padStart(2, '0')}`;
                        } else if (headerValue.match(/^\d+$/)) {
                            // Cabeçalho é dia do mês
                            const dia = headerValue.padStart(2, '0');
                            dataFinal = `2024-09-${dia}`; // Setembro 2024
                        } else {
                            // Tentar extrair dia do valor
                            const dia = dataValue.padStart(2, '0');
                            dataFinal = `2024-09-${dia}`;
                        }
                        
                        // Inserir frequência
                        db.run(
                            'INSERT INTO frequencias (pessoa_id, tipo, numero_senha, data, created_at) VALUES (?, ?, ?, ?, datetime("now", "localtime"))',
                            [pessoaId, 'Comum', '000', dataFinal],
                            function(err) {
                                if (err) {
                                    console.error('❌ Erro ao inserir frequência:', err);
                                    errorCount++;
                                } else {
                                    processedCount++;
                                }
                            }
                        );
                    });
                };
                
                if (pessoa) {
                    processarFrequencias(pessoa.id);
                } else {
                    // Criar nova pessoa
                    db.run(
                        'INSERT INTO pessoas (nome, cpf, created_at) VALUES (?, ?, datetime("now", "localtime"))',
                        [nome, cpf],
                        function(err) {
                            if (err) {
                                console.error('❌ Erro ao criar pessoa:', err);
                                errorCount++;
                            } else {
                                newPersonCount++;
                                console.log(`✅ Nova pessoa criada: ${nome}`);
                                processarFrequencias(this.lastID);
                            }
                        }
                    );
                }
            }
        );
    }
    
    // Mostrar resultado após processamento
    setTimeout(() => {
        console.log('\n📊 RESULTADO DO PROCESSAMENTO:');
        console.log(`✅ Frequências registradas: ${processedCount}`);
        console.log(`👤 Novas pessoas criadas: ${newPersonCount}`);
        console.log(`❌ Erros: ${errorCount}`);
        db.close();
    }, 3000);
}

// Executar
const csvFile = process.argv[2] || 'setembro_freq.csv';
processarFrequenciaMensal(csvFile);