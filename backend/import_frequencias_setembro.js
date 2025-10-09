const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Conectar ao banco
const db = new sqlite3.Database('./frequencia.db');

// Função para processar CSV de frequências
function processarFrequenciaCSV(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('Arquivo CSV não encontrado. Converta o Setembro_Freq.xlsx para CSV primeiro.');
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    console.log(`Processando ${lines.length} linhas...`);
    
    let processedCount = 0;
    let errorCount = 0;

    // Processar cada linha (pular cabeçalho se existir)
    const dataLines = lines.slice(1); // Assumindo primeira linha é cabeçalho
    
    dataLines.forEach((line, index) => {
        const columns = line.split(';').map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 3) return; // Pular linhas vazias
        
        // Assumindo estrutura: Nome, CPF, Data1, Data2, Data3, ... (colunas de datas do mês)
        const nome = columns[0];
        const cpf = columns[1];
        
        // Processar datas (colunas 2 em diante)
        for (let i = 2; i < columns.length; i++) {
            const dataStr = columns[i];
            if (!dataStr || dataStr === '') continue;
            
            // Converter data para formato YYYY-MM-DD
            let dataFormatada;
            try {
                // Se a data está no formato DD/MM/YYYY
                if (dataStr.includes('/')) {
                    const [dia, mes, ano] = dataStr.split('/');
                    dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                } else {
                    // Se já está em outro formato, tentar usar diretamente
                    dataFormatada = dataStr;
                }
                
                // Buscar pessoa por nome ou CPF
                db.get(
                    'SELECT id FROM pessoas WHERE nome LIKE ? OR cpf = ?',
                    [`%${nome}%`, cpf],
                    (err, pessoa) => {
                        if (err) {
                            console.error('Erro ao buscar pessoa:', err);
                            errorCount++;
                            return;
                        }
                        
                        if (pessoa) {
                            // Registrar frequência
                            db.run(
                                'INSERT INTO frequencias (pessoa_id, tipo, numero_senha, data, created_at) VALUES (?, ?, ?, ?, datetime("now", "localtime"))',
                                [pessoa.id, 'Comum', '000', dataFormatada],
                                function(err) {
                                    if (err) {
                                        console.error('Erro ao inserir frequência:', err);
                                        errorCount++;
                                    } else {
                                        processedCount++;
                                        if (processedCount % 100 === 0) {
                                            console.log(`Processadas ${processedCount} frequências...`);
                                        }
                                    }
                                }
                            );
                        } else {
                            // Pessoa não encontrada - criar cadastro básico
                            db.run(
                                'INSERT INTO pessoas (nome, cpf, created_at) VALUES (?, ?, datetime("now", "localtime"))',
                                [nome, cpf || ''],
                                function(err) {
                                    if (err) {
                                        console.error('Erro ao criar pessoa:', err);
                                        errorCount++;
                                    } else {
                                        const pessoaId = this.lastID;
                                        // Registrar frequência para nova pessoa
                                        db.run(
                                            'INSERT INTO frequencias (pessoa_id, tipo, numero_senha, data, created_at) VALUES (?, ?, ?, ?, datetime("now", "localtime"))',
                                            [pessoaId, 'Comum', '000', dataFormatada],
                                            function(err) {
                                                if (err) {
                                                    console.error('Erro ao inserir frequência para nova pessoa:', err);
                                                    errorCount++;
                                                } else {
                                                    processedCount++;
                                                    console.log(`Nova pessoa criada: ${nome} - Frequência registrada`);
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    }
                );
            } catch (error) {
                console.error(`Erro ao processar data ${dataStr}:`, error);
                errorCount++;
            }
        }
    });
    
    // Aguardar processamento e mostrar resultado
    setTimeout(() => {
        console.log(`\nProcessamento concluído:`);
        console.log(`- Frequências processadas: ${processedCount}`);
        console.log(`- Erros: ${errorCount}`);
        db.close();
    }, 5000);
}

// Verificar se arquivo CSV existe
const csvPath = './setembro_freq.csv';
if (process.argv[2]) {
    processarFrequenciaCSV(process.argv[2]);
} else {
    console.log('Uso: node import_frequencias_setembro.js <caminho_para_csv>');
    console.log('Primeiro converta o arquivo Setembro_Freq.xlsx para CSV');
}