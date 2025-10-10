<<<<<<< Updated upstream
// Este arquivo é apenas um redirecionador para o servidor principal no diretório backend
const { exec } = require('child_process');
const path = require('path');

console.log('Iniciando servidor backend...');

// Executa o servidor backend
const backendProcess = exec('node backend/server.js', {
  cwd: __dirname,
  env: {
    ...process.env,
    PORT: process.env.PORT || 10000,
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});

// Encaminha a saída do processo filho
backendProcess.stdout.pipe(process.stdout);
backendProcess.stderr.pipe(process.stderr);

// Trata o encerramento do processo
process.on('SIGINT', () => {
  console.log('Encerrando servidor...');
  backendProcess.kill();
  process.exit();
=======
// Carrega as variáveis de ambiente do arquivo .env, se existir
require('dotenv').config();

// Importa o express e configura o servidor
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configurações básicas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta raiz
app.use(express.static(path.join(__dirname)));

// Rota principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Acesse: http://localhost:${PORT}`);
>>>>>>> Stashed changes
});
