// Este arquivo é apenas um redirecionador para o servidor principal no diretório backend
const { exec } = require('child_process');
const path = require('path');

console.log('Iniciando servidor backend...');

// Carrega as variáveis de ambiente do arquivo .env, se existir
require('dotenv').config();

// Executa o servidor backend
const backendProcess = exec('node backend/server.js', {
  cwd: __dirname,
  env: {
    ...process.env,
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});

// Encaminha a saída do processo filho
backendProcess.stdout.pipe(process.stdout);
backendProcess.stderr.pipe(process.stderr);

// Trata eventos de encerramento
process.on('SIGINT', () => {
  console.log('Encerrando servidor...');
  backendProcess.kill();
  process.exit();
});
