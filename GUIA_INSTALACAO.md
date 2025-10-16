# 🚀 Guia de Instalação - Sistema Terra do Bugio

Guia completo para instalação e configuração do Sistema de Recepção Terra do Bugio.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação do MySQL](#instalação-do-mysql)
- [Instalação do Node.js](#instalação-do-nodejs)
- [Configuração do Projeto](#configuração-do-projeto)
- [Configuração do Banco](#configuração-do-banco)
- [Primeiro Acesso](#primeiro-acesso)
- [Verificação da Instalação](#verificação-da-instalação)
- [Troubleshooting](#troubleshooting)
- [Configurações Avançadas](#configurações-avançadas)

## 🛠️ Pré-requisitos

### Requisitos Mínimos do Sistema
- **Sistema Operacional**: Windows 10+, Linux Ubuntu 18+, macOS 10.15+
- **RAM**: 4GB mínimo (8GB recomendado)
- **Espaço em Disco**: 2GB livres
- **Rede**: Conexão com internet para download de dependências

### Software Necessário
- **Node.js** 14.0 ou superior
- **MySQL** 8.0 ou superior
- **Git** (opcional, para clonagem)
- **Editor de texto** (VS Code recomendado)

## 🗄️ Instalação do MySQL

### Windows

#### Opção 1: MySQL Installer (Recomendado)
1. **Download**: Acesse [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
2. **Escolha**: MySQL Installer for Windows
3. **Execute** o instalador como administrador
4. **Configuração**:
   - Escolha "Developer Default"
   - Defina senha para root (anote a senha!)
   - Porta padrão: 3306
   - Configure como Windows Service

#### Opção 2: MySQL ZIP Archive
1. **Download**: MySQL Community Server ZIP
2. **Extrair** para `C:\mysql`
3. **Configurar** variável de ambiente PATH
4. **Inicializar** banco: `mysqld --initialize-insecure`
5. **Iniciar** serviço: `mysqld --install` e `net start mysql`

### Linux (Ubuntu/Debian)
```bash
# Atualizar repositórios
sudo apt update

# Instalar MySQL Server
sudo apt install mysql-server

# Configurar instalação segura
sudo mysql_secure_installation

# Iniciar serviço
sudo systemctl start mysql
sudo systemctl enable mysql
```

### macOS
```bash
# Usando Homebrew
brew install mysql

# Iniciar serviço
brew services start mysql

# Configurar senha root
mysql_secure_installation
```

### Verificar Instalação MySQL
```bash
# Verificar versão
mysql --version

# Conectar ao MySQL
mysql -u root -p

# No prompt MySQL, testar:
SELECT VERSION();
SHOW DATABASES;
EXIT;
```

## 🟢 Instalação do Node.js

### Windows
1. **Download**: Acesse [nodejs.org](https://nodejs.org/)
2. **Escolha**: LTS (Long Term Support)
3. **Execute** o instalador (.msi)
4. **Siga** o assistente (aceite todas as opções padrão)
5. **Reinicie** o computador

### Linux (Ubuntu/Debian)
```bash
# Método 1: Repositório oficial
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Método 2: Snap
sudo snap install node --classic

# Método 3: NVM (recomendado para desenvolvedores)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### macOS
```bash
# Método 1: Download direto do site
# Baixar e instalar o .pkg do nodejs.org

# Método 2: Homebrew
brew install node

# Método 3: NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bash_profile
nvm install --lts
nvm use --lts
```

### Verificar Instalação Node.js
```bash
# Verificar versões
node --version    # Deve mostrar v14.0.0 ou superior
npm --version     # Deve mostrar versão do npm

# Testar npm
npm list -g --depth=0
```

## 📁 Configuração do Projeto

### 1. Obter o Código Fonte

#### Opção A: Download ZIP
1. Baixe o arquivo ZIP do projeto
2. Extraia para uma pasta (ex: `C:\Projetos\recepcaotb`)
3. Navegue até a pasta extraída

#### Opção B: Git Clone
```bash
# Clonar repositório
git clone <url-do-repositorio>
cd recepcaotb
```

### 2. Instalar Dependências
```bash
# Navegar para a pasta do projeto
cd C:\Projetos\recepcaotb

# Instalar dependências do Node.js
npm install

# Verificar se instalação foi bem-sucedida
npm list --depth=0
```

### 3. Configurar Variáveis de Ambiente
Criar arquivo `.env` na raiz do projeto:

```bash
# Windows
copy .env.local .env

# Linux/macOS
cp .env.local .env
```

Editar o arquivo `.env`:
```env
# Configurações do Sistema
NODE_ENV=development
PORT=3000

# JWT Secret (OBRIGATÓRIO - ALTERE!)
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_123456789_ALTERE_ISSO

# Configurações do Banco MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SUA_SENHA_MYSQL_AQUI
DB_NAME=recepcaotb

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**⚠️ IMPORTANTE**: 
- Substitua `SUA_SENHA_MYSQL_AQUI` pela senha do MySQL
- Altere o `JWT_SECRET` para uma chave única e segura

## 🗄️ Configuração do Banco

### 1. Criar Banco de Dados
```sql
-- Conectar ao MySQL
mysql -u root -p

-- Criar banco de dados
CREATE DATABASE recepcaotb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar criação
SHOW DATABASES;

-- Usar o banco
USE recepcaotb;

-- Sair do MySQL
EXIT;
```

### 2. Executar Migrações (se necessário)
```bash
# Verificar se há migrações pendentes
npm run knex:migrate:status

# Executar migrações
npm run knex:migrate:latest

# Verificar tabelas criadas
npm run knex:migrate:status
```

### 3. Verificar Estrutura do Banco
```sql
-- Conectar ao banco
mysql -u root -p recepcaotb

-- Listar tabelas
SHOW TABLES;

-- Verificar estrutura das tabelas principais
DESCRIBE pessoas;
DESCRIBE frequencias;
DESCRIBE usuarios;
DESCRIBE sessoes;

-- Verificar se usuário admin existe
SELECT * FROM usuarios WHERE email = 'admin@terradobugio.com';
```

## 🚀 Primeiro Acesso

### 1. Iniciar o Servidor
```bash
# Navegar para pasta do projeto
cd C:\Projetos\recepcaotb

# Iniciar servidor
npm start
```

**Saída esperada**:
```
> sistema-frequencia-terra-bugio@1.0.0 start
> node backend/server.js

Servidor rodando na porta 3000
Ambiente: development
JWT Secret: *** (definido)
Conexão com o banco de dados estabelecida com sucesso!
```

### 2. Acessar o Sistema
1. **Abra o navegador**
2. **Acesse**: http://localhost:3000
3. **Clique**: "Entrar no Sistema"
4. **Faça login** com:
   - **Email**: admin@terradobugio.com
   - **Senha**: admin123

### 3. Primeiro Login
1. **Login bem-sucedido**: Você será redirecionado para o painel
2. **Troca de senha**: Se solicitado, altere a senha padrão
3. **Explorar**: Navegue pelas funcionalidades do sistema

## ✅ Verificação da Instalação

### 1. Teste de Conectividade
```bash
# Testar se servidor está rodando
curl http://localhost:3000/api/health

# Ou no navegador
# http://localhost:3000/api/health
```

**Resposta esperada**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "database": {
    "status": "connected",
    "type": "mysql"
  }
}
```

### 2. Teste de Funcionalidades

#### Cadastro de Pessoa
1. Acesse: http://localhost:3000
2. Preencha o formulário de cadastro
3. Clique em "Cadastrar"
4. Verifique se aparece mensagem de sucesso

#### Login no Painel
1. Acesse: http://localhost:3000/painel-simples.html
2. Faça login com credenciais admin
3. Verifique se carrega o painel administrativo

#### Registro de Frequência
1. No painel, clique em "Frequência"
2. Busque uma pessoa cadastrada
3. Registre uma frequência
4. Verifique se aparece confirmação

### 3. Verificação do Banco de Dados
```sql
-- Conectar ao banco
mysql -u root -p recepcaotb

-- Verificar dados de teste
SELECT COUNT(*) as total_pessoas FROM pessoas;
SELECT COUNT(*) as total_frequencias FROM frequencias;
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Verificar usuário admin
SELECT nome, email, tipo, ativo FROM usuarios 
WHERE email = 'admin@terradobugio.com';
```

## 🔧 Troubleshooting

### Problema: "npm install" falha

#### Erro: EACCES permissions
```bash
# Linux/macOS - Corrigir permissões npm
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Ou usar nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

#### Erro: Network timeout
```bash
# Configurar timeout do npm
npm config set registry https://registry.npmjs.org/
npm config set timeout 60000

# Limpar cache
npm cache clean --force

# Tentar novamente
npm install
```

### Problema: MySQL não conecta

#### Erro: ECONNREFUSED
```bash
# Windows - Verificar se MySQL está rodando
net start mysql

# Linux - Iniciar MySQL
sudo systemctl start mysql
sudo systemctl status mysql

# macOS - Iniciar MySQL
brew services start mysql
```

#### Erro: Access denied
```sql
-- Resetar senha do root (se necessário)
-- 1. Parar MySQL
-- 2. Iniciar em modo seguro
-- 3. Conectar sem senha
-- 4. Alterar senha

ALTER USER 'root'@'localhost' IDENTIFIED BY 'nova_senha';
FLUSH PRIVILEGES;
```

### Problema: Porta 3000 em uso

#### Erro: EADDRINUSE
```bash
# Windows - Encontrar processo na porta 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS - Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou alterar porta no .env
PORT=3001
```

### Problema: JWT_SECRET não definido

#### Aviso no console
```
AVISO: JWT_SECRET não está definido
```

**Solução**: Verificar arquivo `.env`
```env
# Adicionar linha no .env
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_123456789
```

### Problema: Banco de dados não existe

#### Erro: Unknown database
```sql
-- Conectar ao MySQL e criar banco
mysql -u root -p
CREATE DATABASE recepcaotb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recepcaotb;
```

## ⚙️ Configurações Avançadas

### 1. Configuração de Produção

#### Arquivo .env para produção
```env
NODE_ENV=production
PORT=80
JWT_SECRET=chave_super_segura_producao_128_caracteres_minimo
DB_HOST=servidor_mysql_producao
DB_USER=usuario_producao
DB_PASSWORD=senha_muito_segura_producao
DB_NAME=recepcaotb_prod
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=50
```

#### SSL/HTTPS (Recomendado para produção)
```javascript
// No server.js, adicionar:
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443);
```

### 2. Configuração de Backup Automático

#### Script de backup (Linux/macOS)
```bash
#!/bin/bash
# backup_daily.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/recepcaotb"
DB_NAME="recepcaotb"
DB_USER="root"
DB_PASS="sua_senha"

mkdir -p $BACKUP_DIR

mysqldump -u$DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

#### Cron job para backup automático
```bash
# Editar crontab
crontab -e

# Adicionar linha para backup diário às 2h
0 2 * * * /path/to/backup_daily.sh
```

### 3. Monitoramento e Logs

#### PM2 para produção (Linux/macOS)
```bash
# Instalar PM2
npm install -g pm2

# Criar arquivo ecosystem.config.js
module.exports = {
  apps: [{
    name: 'recepcao-tb',
    script: 'backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save
pm2 startup
```

#### Logs do sistema
```bash
# Ver logs em tempo real
pm2 logs recepcao-tb

# Logs do MySQL
tail -f /var/log/mysql/error.log

# Logs do sistema (Linux)
journalctl -u mysql -f
```

### 4. Otimizações de Performance

#### Configuração MySQL (my.cnf)
```ini
[mysqld]
# Otimizações básicas
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 64M
query_cache_type = 1

# Para sistemas com muitas inserções
innodb_flush_log_at_trx_commit = 2
sync_binlog = 0
```

#### Índices recomendados
```sql
-- Otimizar consultas frequentes
CREATE INDEX idx_pessoas_nome ON pessoas(nome);
CREATE INDEX idx_pessoas_cpf ON pessoas(cpf);
CREATE INDEX idx_pessoas_cidade ON pessoas(cidade);
CREATE INDEX idx_frequencias_data ON frequencias(data);
CREATE INDEX idx_frequencias_tipo ON frequencias(tipo);
CREATE INDEX idx_frequencias_pessoa_data ON frequencias(pessoa_id, data);
```

## 📞 Suporte

### Logs Importantes
- **Servidor**: Console onde rodou `npm start`
- **MySQL**: `/var/log/mysql/error.log` (Linux)
- **Sistema**: Event Viewer (Windows) ou `journalctl` (Linux)

### Comandos Úteis de Diagnóstico
```bash
# Verificar status dos serviços
systemctl status mysql    # Linux
net start | findstr MySQL # Windows

# Verificar portas em uso
netstat -tlnp | grep :3000  # Linux
netstat -ano | findstr :3000 # Windows

# Verificar logs do Node.js
npm start 2>&1 | tee server.log

# Testar conectividade MySQL
telnet localhost 3306
```

### Informações para Suporte
Ao reportar problemas, inclua:
1. **Sistema operacional** e versão
2. **Versão do Node.js**: `node --version`
3. **Versão do MySQL**: `mysql --version`
4. **Logs de erro** completos
5. **Arquivo .env** (sem senhas!)
6. **Passos para reproduzir** o problema

---

**© 2024 Sistema de Recepção Terra do Bugio - Guia de Instalação v1.0.0**
