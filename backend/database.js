const knex = require('knex');
const config = require('./config/database');

// Cria a conexão com o banco de dados
const db = knex(config.development);

// Testa a conexão com o banco de dados
const testConnection = async () => {
    try {
        await db.raw('SELECT 1');
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        process.exit(1);
    }
};

// Executa o teste de conexão
testConnection();

// Exporta a instância do Knex para ser usada em outros arquivos
module.exports = db;