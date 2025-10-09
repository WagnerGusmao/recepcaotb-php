const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'frequencia.db');
const db = new sqlite3.Database(dbPath);

const dados = [
    ['João Silva', '123.456.789-01', '1985-03-15', 'M', 'São Paulo', 'SP', '(11) 99999-1234', 'joao@email.com', 'Amigos/Parentes'],
    ['Maria Santos', null, '1990-07-22', 'F', 'Rio de Janeiro', 'RJ', '(21) 88888-5678', 'maria@email.com', 'Curso Terra do Bugio'],
    ['Pedro Oliveira', '987.654.321-09', '1978-12-10', 'M', 'Belo Horizonte', 'MG', '(31) 77777-9012', 'pedro@email.com', 'Facebook'],
    ['Ana Costa', '456.789.123-45', null, 'F', 'Salvador', 'BA', '(71) 66666-3456', null, 'Instagram'],
    ['Carlos Ferreira', '789.123.456-78', '1995-05-30', 'M', 'Fortaleza', 'CE', '(85) 55555-7890', 'carlos@email.com', 'Mercado Mistico'],
    ['Lucia Pereira', null, '1982-11-18', 'F', 'Recife', 'PE', '(81) 44444-2345', 'lucia@email.com', 'Rádio Atual'],
    ['Roberto Lima', '321.654.987-12', '1988-09-05', 'M', 'Porto Alegre', 'RS', '(51) 33333-6789', 'roberto@email.com', 'TV Astral'],
    ['Fernanda Alves', '654.987.321-56', '1992-01-25', 'F', 'Curitiba', 'PR', null, 'fernanda@email.com', 'Youtube']
];

console.log('Iniciando carga de dados...');

const sql = `INSERT INTO pessoas (nome, cpf, nascimento, sexo, cidade, estado, telefone, email, indicacao)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

dados.forEach((pessoa, index) => {
    db.run(sql, pessoa, function(err) {
        if (err) {
            console.error(`Erro ao inserir ${pessoa[0]}:`, err.message);
        } else {
            console.log(`Inserido: ${pessoa[0]}`);
        }
        
        if (index === dados.length - 1) {
            console.log('Carga de dados concluída');
            db.close();
        }
    });
});