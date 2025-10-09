const fs = require('fs');
const db = require('./database');

function carregarDados() {
    const csvPath = '../data/setembro.csv';
    
    try {
        const csvData = fs.readFileSync(csvPath, 'utf8');
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        
        console.log('Iniciando carga de dados...');
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(',');
            const row = {};
            
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : null;
            });
            
            const sql = `INSERT INTO pessoas (nome, cpf, nascimento, sexo, cidade, estado, telefone, email, indicacao)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const params = [
                row.nome || null,
                row.cpf || null,
                row.nascimento || null,
                row.sexo || null,
                row.cidade || null,
                row.estado || null,
                row.telefone || null,
                row.email || null,
                row.indicacao || null
            ];
            
            db.run(sql, params, function(err) {
                if (err) {
                    console.error('Erro ao inserir:', row.nome, err.message);
                } else {
                    console.log('Inserido:', row.nome);
                }
            });
        }
        
        console.log('Carga de dados concluída');
        
    } catch (error) {
        console.error('Erro ao ler arquivo CSV:', error.message);
    }
}

carregarDados();