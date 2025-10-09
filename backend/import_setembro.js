const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'frequencia.db');
const csvPath = path.join(__dirname, '..', 'setembro.csv');

console.log('Importando dados do setembro.csv...');

// Conectar ao banco
const db = new sqlite3.Database(dbPath);

// Verificar se arquivo existe
if (!fs.existsSync(csvPath)) {
    console.log('❌ Arquivo setembro.csv não encontrado na pasta raiz');
    console.log('Por favor, converta o Excel para CSV e salve como setembro.csv');
    process.exit(1);
}

// Ler arquivo CSV
const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.split('\n');
const headers = lines[0].split(';').map(h => h.trim().replace(/"/g, '').replace(/\r/g, ''));

console.log(`Encontradas ${lines.length - 1} linhas no CSV`);
console.log('Colunas:', headers);

// Função para limpar CPF
function formatarCPF(cpf) {
    if (!cpf) return null;
    const limpo = cpf.toString().replace(/[^\d]/g, '');
    if (limpo.length !== 11) return null;
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

const importarDados = async () => {
    let importados = 0;
    let erros = 0;

    const stmt = db.prepare(`INSERT INTO pessoas 
        (nome, cpf, nascimento, sexo, cidade, estado, telefone, email, indicacao) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
            const values = line.split(';').map(v => v.trim().replace(/"/g, '').replace(/\r/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });

            const nome = row.Nome || row.NOME || row.nome || '';
            const cpf = formatarCPF(row.CPF || row.Cpf || row.cpf || '');
            const nascimento = row.Nascimento || row.NASCIMENTO || row.nascimento || null;
            const sexo = (row.Sexo || row.SEXO || row.sexo || '').toString().toUpperCase().charAt(0) || null;
            const cidade = row.Cidade || row.CIDADE || row.cidade || null;
            const estado = (row.Estado || row.ESTADO || row.estado || row.UF || '').toString().toUpperCase().substring(0, 2) || null;
            const telefone = row.Telefone || row.TELEFONE || row.telefone || row.Celular || null;
            const email = row.Email || row.EMAIL || row.email || null;
            const indicacao = row.Indicacao || row.INDICACAO || row.indicacao || null;

            if (nome.trim()) {
                stmt.run([nome, cpf, nascimento, sexo, cidade, estado, telefone, email, indicacao], function(err) {
                    if (err) {
                        console.log(`Erro linha ${i}: ${err.message}`);
                        erros++;
                    } else {
                        importados++;
                    }
                });
            } else {
                console.log(`Linha ${i} ignorada: nome vazio`);
                erros++;
            }
        } catch (error) {
            console.log(`Erro linha ${i}: ${error.message}`);
            erros++;
        }
    }

    stmt.finalize(() => {
        console.log(`\n✅ Importação concluída:`);
        console.log(`- Registros importados: ${importados}`);
        console.log(`- Erros/ignorados: ${erros}`);
        db.close();
    });
};

importarDados();