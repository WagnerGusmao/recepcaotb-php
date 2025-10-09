const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./frequencia.db');

const meses = [
    { nome: 'março', data: '2025-03-02', colunas: ['março', 'mar'] },
    { nome: 'abril', data: '2025-04-06', colunas: ['abril', 'abr'] },
    { nome: 'maio', data: '2025-05-04', colunas: ['maio', 'mai'] },
    { nome: 'junho', data: '2025-06-01', colunas: ['junho', 'jun'] },
    { nome: 'julho', data: '2025-07-06', colunas: ['julho', 'jul'] },
    { nome: 'agosto', data: '2025-08-03', colunas: ['agosto', 'ago'] },
    { nome: 'setembro', data: '2025-09-07', colunas: ['setembro', 'set'] }
];

function executarTodosMeses(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log('❌ Arquivo CSV não encontrado:', csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const separator = lines[0].includes(',') ? ',' : ';';
    const header = lines[0].split(separator).map(col => col.trim().replace(/"/g, ''));
    
    console.log('📋 Processando arquivo:', csvPath);
    
    let mesIndex = 0;
    
    function processarProximoMes() {
        if (mesIndex >= meses.length) {
            console.log('\n🎉 TODOS OS MESES PROCESSADOS!');
            db.close();
            return;
        }
        
        const mes = meses[mesIndex];
        console.log(`\n📅 Processando ${mes.nome.toUpperCase()}...`);
        
        let mesCol = -1;
        header.forEach((col, index) => {
            const colLower = col.toLowerCase();
            if (mes.colunas.some(termo => colLower.includes(termo))) {
                mesCol = index;
            }
        });
        
        if (mesCol === -1) {
            console.log(`❌ Coluna de ${mes.nome} não encontrada`);
            mesIndex++;
            processarProximoMes();
            return;
        }
        
        let importados = 0;
        let processados = 0;
        let totalLinhas = 0;
        
        for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
            const columns = lines[lineIndex].split(separator).map(col => col.trim().replace(/"/g, ''));
            
            if (columns.length < 2) continue;
            
            const nome = columns[0];
            if (!nome) continue;
            
            totalLinhas++;
            
            const valor = columns[mesCol];
            if (valor && valor !== '' && valor !== '0') {
                db.get('SELECT id FROM pessoas WHERE nome = ?', [nome], (err, pessoa) => {
                    processados++;
                    
                    if (err) {
                        console.log(`❌ Erro ao buscar ${nome}:`, err.message);
                    } else if (pessoa) {
                        db.run(
                            'INSERT INTO frequencias (pessoa_id, tipo, numero_senha, data, created_at) VALUES (?, ?, ?, ?, ?)',
                            [pessoa.id, 'comum', valor, mes.data, new Date().toISOString()],
                            function(err) {
                                if (!err) {
                                    importados++;
                                    console.log(`✅ ${nome} - ${mes.nome}: ${valor}`);
                                }
                            }
                        );
                    } else {
                        console.log(`⚠️ Pessoa não encontrada: ${nome}`);
                    }
                    
                    if (processados === totalLinhas) {
                        setTimeout(() => {
                            console.log(`📊 ${mes.nome.toUpperCase()}: ${importados} importados`);
                            mesIndex++;
                            processarProximoMes();
                        }, 1000);
                    }
                });
            }
        }
        
        if (totalLinhas === 0) {
            console.log(`📊 ${mes.nome.toUpperCase()}: 0 registros`);
            mesIndex++;
            processarProximoMes();
        }
    }
    
    processarProximoMes();
}

const csvFile = process.argv[2] || './frequencias_completas.csv';
executarTodosMeses(csvFile);