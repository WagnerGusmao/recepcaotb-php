const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

function importarFevereiro(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    // Encontrar coluna de fevereiro
    let fevereiroCol = -1;
    header.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (colLower.includes('fevereiro') || colLower.includes('fev')) {
            fevereiroCol = index;
        }
    });
    
    if (fevereiroCol === -1) {
        console.log('❌ Coluna de Fevereiro não encontrada');
        return;
    }
    
    console.log(`📅 Processando coluna: ${header[fevereiroCol]}`);
    console.log('🚀 INICIANDO IMPORTAÇÃO DE FEVEREIRO...\n');
    
    let senhaSequencial = 1;
    let totalProcessadas = 0;
    let novasPessoas = 0;
    let pessoasProcessadas = 0;
    
    const dataFevereiro = '2025-02-12'; // Data fixa: 12/02/2025
    
    const processarProximaPessoa = (lineIndex) => {
        if (lineIndex >= lines.length) {
            setTimeout(() => {
                console.log('\n📊 IMPORTAÇÃO FEVEREIRO CONCLUÍDA:');
                console.log(`✅ Frequências criadas: ${totalProcessadas}`);
                console.log(`👤 Novas pessoas: ${novasPessoas}`);
                console.log(`🔢 Senhas usadas: 001 a ${senhaSequencial.toString().padStart(3, '0')}`);
                console.log(`📅 Data usada: ${dataFevereiro}`);
                db.close();
            }, 1000);
            return;
        }
        
        const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2 || !columns[4]) { // NOME COMPLETO na posição 4
            processarProximaPessoa(lineIndex + 1);
            return;
        }
        
        const nome = columns[4]; // NOME COMPLETO
        const cpf = columns[3] || ''; // CPF
        const valorFevereiro = columns[fevereiroCol];
        
        // Só processar se tem frequência em fevereiro
        if (!valorFevereiro || valorFevereiro === '' || valorFevereiro === '0') {
            processarProximaPessoa(lineIndex + 1);
            return;
        }
        
        pessoasProcessadas++;
        console.log(`👤 ${pessoasProcessadas}: ${nome}`);
        
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
                
                const criarFrequencia = (pessoaId) => {
                    db.run(
                        'INSERT INTO frequencias (pessoa_id, tipo, numero_senha, data, created_at) VALUES (?, ?, ?, ?, datetime("now", "localtime"))',
                        [pessoaId, 'Comum', senhaSequencial.toString().padStart(3, '0'), dataFevereiro],
                        function(err) {
                            if (err) {
                                console.error('❌ Erro ao inserir frequência:', err);
                            } else {
                                totalProcessadas++;
                                senhaSequencial++;
                                console.log(`  ✅ Frequência criada - Senha: ${(senhaSequencial-1).toString().padStart(3, '0')}`);
                            }
                            processarProximaPessoa(lineIndex + 1);
                        }
                    );
                };
                
                if (pessoa) {
                    criarFrequencia(pessoa.id);
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
                                criarFrequencia(this.lastID);
                            }
                        }
                    );
                }
            }
        );
    };
    
    processarProximaPessoa(1);
}

const csvFile = process.argv[2];
if (!csvFile) {
    console.log('❌ Uso: node importar_fevereiro.js <arquivo.csv>');
    process.exit(1);
}

importarFevereiro(csvFile);