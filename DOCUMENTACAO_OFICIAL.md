# 📚 Documentação Oficial - Sistema Terra do Bugio

## 🏢 **Sobre o Projeto**

O **Sistema Terra do Bugio** é uma aplicação web completa para gerenciamento de recepção, cadastro de pessoas, controle de frequências e administração de voluntários. Desenvolvido especificamente para a organização Terra do Bugio, oferece uma solução robusta e profissional para gestão administrativa.

### **Informações do Projeto:**
- **Nome**: Sistema de Recepção Terra do Bugio
- **Versão**: 2.0 (PHP)
- **Tecnologia**: PHP 8.0+ | MySQL | HTML5 | CSS3 | JavaScript
- **Licença**: Proprietário
- **Desenvolvido para**: Terra do Bugio
- **Status**: ✅ Produção

---

## 🎯 **Funcionalidades Principais**

### **👥 Gestão de Pessoas**
- **Cadastro público** de pessoas via formulário web
- **Busca avançada** por nome, CPF, cidade
- **Edição completa** de dados pessoais
- **Validações automáticas** (CPF, email, telefone)
- **Controle de duplicatas** com algoritmo inteligente

### **📊 Controle de Frequências**
- **Registro de frequências** para diferentes tipos
- **Frequências gerais** e **específicas para pets**
- **Controle por senhas** (geral, tutor, pet)
- **Prevenção de duplicatas** na mesma data
- **Histórico completo** de frequências

### **🤝 Gestão de Voluntários**
- **Cadastro de voluntários** com dados específicos
- **Controle de frequências** de trabalho voluntário
- **Locais de trabalho** (9 locais disponíveis)
- **Horários de trabalho** (início e fim)
- **Relatórios específicos** de voluntários

### **📈 Relatórios Avançados**
- **Relatório geral** de frequências
- **Relatório mensal** com estatísticas
- **Relatório por cidades** e estados
- **Relatório de contatos** únicos
- **Relatório de cadastros** por período
- **Relatório de voluntários** com métricas
- **Exportação** em PDF, CSV, XLSX

### **👤 Sistema de Usuários**
- **Três tipos** de usuário: Geral, Líder, Administrador
- **Autenticação JWT** com sessões seguras
- **Controle de permissões** granular
- **Gestão de usuários** (criar, editar, ativar/desativar)
- **Troca de senhas** obrigatória e opcional

### **🔍 Análise de Duplicatas**
- **Algoritmo inteligente** de detecção
- **Análise por similaridade** de nomes e dados
- **Mesclagem seletiva** de pessoas duplicadas
- **Transferência automática** de frequências
- **Interface visual** para revisão

### **💾 Backup e Restore**
- **Backup automático** do banco de dados
- **Múltiplos formatos** de backup
- **Restore completo** de dados
- **Histórico de backups** com timestamps
- **Download seguro** de arquivos

---

## 🏗️ **Arquitetura do Sistema**

### **Frontend**
- **HTML5** semântico e acessível
- **CSS3** com design responsivo
- **JavaScript Vanilla** para interatividade
- **Chart.js** para gráficos e estatísticas
- **jsPDF** para geração de PDFs
- **XLSX.js** para exportação Excel

### **Backend**
- **PHP 8.0+** com orientação a objetos
- **PDO** para acesso ao banco de dados
- **JWT** para autenticação segura
- **Composer** para gerenciamento de dependências
- **APIs RESTful** com padrão JSON

### **Banco de Dados**
- **MySQL 8.0+** como SGBD principal
- **4 tabelas principais**: pessoas, usuarios, frequencias, sessoes
- **Índices otimizados** para performance
- **Constraints** para integridade referencial
- **Charset UTF-8** para suporte completo

### **Segurança**
- **Autenticação JWT** com expiração
- **Prepared Statements** contra SQL Injection
- **Validação de entrada** em todas as APIs
- **Controle de sessões** no banco
- **Headers de segurança** configurados

---

## 📁 **Estrutura do Projeto**

```
recepcaotb-16-10-PHP_MySQL/
├── 📄 Arquivos HTML
│   ├── index.html              # Página principal (cadastro público)
│   ├── login.html              # Página de autenticação
│   ├── painel-simples.html     # Painel administrativo completo
│   └── trocar-senha.html       # Troca de senha obrigatória
│
├── 🎨 Recursos Estáticos
│   ├── css/
│   │   └── style.css           # Estilos principais responsivos
│   ├── js/
│   │   ├── script.js           # JavaScript principal
│   │   └── municipios-completos.js # Dados de cidades/estados
│   ├── imagem/
│   │   └── terrabugio.jpg      # Logo oficial
│   ├── favicon.ico             # Favicon padrão
│   └── favicon.svg             # Favicon vetorial
│
├── 🔧 Sistema PHP
│   ├── php/
│   │   ├── .htaccess           # Configuração Apache
│   │   ├── index.php           # Ponto de entrada principal
│   │   ├── composer.json       # Dependências PHP
│   │   │
│   │   ├── api/                # APIs RESTful
│   │   │   ├── auth.php        # Autenticação e login
│   │   │   ├── pessoas.php     # CRUD de pessoas
│   │   │   ├── usuarios.php    # Gestão de usuários
│   │   │   ├── frequencias.php # Controle de frequências
│   │   │   ├── voluntarios.php # Gestão de voluntários
│   │   │   ├── frequencia_voluntarios.php # Frequências voluntários
│   │   │   ├── duplicatas.php  # Análise e mesclagem
│   │   │   └── backups.php     # Backup e restore
│   │   │
│   │   ├── classes/            # Classes PHP
│   │   │   └── Auth.php        # Classe de autenticação
│   │   │
│   │   ├── config/             # Configurações
│   │   │   ├── database.php    # Conexão MySQL
│   │   │   └── .env            # Variáveis de ambiente
│   │   │
│   │   ├── migrations/         # Migrações do banco
│   │   │   └── create_tables.sql
│   │   │
│   │   └── vendor/             # Dependências Composer
│
├── 📦 Exports e Backups
│   └── exports/
│       ├── recepcaotb_FIXED_FULL_export_*.sql # Export completo
│       └── README_IMPORTACAO_COMPLETA.md      # Guia de importação
│
├── 📚 Documentação
│   ├── README.md               # Visão geral do projeto
│   ├── DOCUMENTACAO_OFICIAL.md # Esta documentação
│   ├── API_REFERENCE.md        # Referência completa das APIs
│   ├── GUIA_INSTALACAO.md      # Guia de instalação
│   ├── GUIA_USUARIO.md         # Manual do usuário
│   ├── COMO_INICIAR.md         # Primeiros passos
│   └── SISTEMA_PRONTO_PARA_USO.md # Status e credenciais
│
└── 🔧 Controle de Versão
    ├── .git/                   # Repositório Git
    └── .gitignore              # Arquivos ignorados
```

---

## 🗄️ **Banco de Dados**

### **Tabela: pessoas**
```sql
CREATE TABLE pessoas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    nascimento DATE,
    religiao VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    telefone VARCHAR(20),
    email VARCHAR(255),
    indicacao VARCHAR(255),
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Tabela: usuarios**
```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('geral', 'lider', 'administrador') DEFAULT 'geral',
    ativo BOOLEAN DEFAULT TRUE,
    pessoa_id INT,
    deve_trocar_senha BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id)
);
```

### **Tabela: frequencias**
```sql
CREATE TABLE frequencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pessoa_id INT NOT NULL,
    tipo ENUM('geral', 'pet') DEFAULT 'geral',
    numero_senha INT,
    data DATE NOT NULL,
    numero_senha_tutor INT,
    numero_senha_pet INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id)
);
```

### **Tabela: sessoes**
```sql
CREATE TABLE sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

---

## 🌐 **APIs RESTful**

### **Autenticação**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/php/api/auth` | Login do usuário |
| DELETE | `/php/api/auth` | Logout do usuário |
| GET | `/php/api/auth/me` | Dados do usuário logado |

### **Pessoas**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/php/api/pessoas` | Listar pessoas |
| POST | `/php/api/pessoas` | Cadastrar pessoa |
| PUT | `/php/api/pessoas/{id}` | Atualizar pessoa |
| GET | `/php/api/pessoas?busca={termo}` | Buscar pessoas |

### **Usuários**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/php/api/usuarios` | Listar usuários (admin) |
| POST | `/php/api/usuarios` | Criar usuário (admin) |
| PUT | `/php/api/usuarios/{id}` | Atualizar usuário (admin) |
| DELETE | `/php/api/usuarios/{id}` | Excluir usuário (admin) |
| PUT | `/php/api/usuarios/perfil` | Editar próprio perfil |
| PUT | `/php/api/usuarios/trocar-senha-obrigatoria` | Trocar senha |
| PUT | `/php/api/usuarios/{id}/reset-senha` | Reset senha (admin) |

### **Frequências**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/php/api/frequencias` | Listar frequências |
| POST | `/php/api/frequencias` | Registrar frequência |

### **Voluntários**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/php/api/voluntarios` | Listar voluntários |
| POST | `/php/api/voluntarios` | Cadastrar voluntário |
| PUT | `/php/api/voluntarios/{id}` | Atualizar voluntário |
| GET | `/php/api/frequencia_voluntarios` | Frequências voluntários |
| POST | `/php/api/frequencia_voluntarios` | Registrar frequência voluntário |

### **Duplicatas**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/php/api/duplicatas` | Analisar duplicatas |
| POST | `/php/api/duplicatas/mesclar` | Mesclar pessoas |
| POST | `/php/api/duplicatas/mesclar-lote` | Mesclar em lote |

### **Backups**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/php/api/backups` | Listar backups |
| POST | `/php/api/backups` | Criar backup |
| POST | `/php/api/backups/restore` | Restaurar backup |
| GET | `/php/api/backups/{filename}` | Download backup |

---

## 👥 **Tipos de Usuário**

### **👤 Usuário Geral**
- ✅ Lançar frequências
- ✅ Atualizar dados de pessoas
- ✅ Cadastrar novas pessoas
- ❌ Não acessa relatórios
- ❌ Não gerencia usuários
- ❌ Não acessa duplicatas

### **👨‍💼 Líder**
- ✅ Todas as permissões do usuário geral
- ✅ **Acessar relatórios** completos
- ✅ **Gerenciar voluntários**
- ✅ **Frequências de voluntários**
- ✅ **Relatório de voluntários**
- ❌ Não gerencia usuários
- ❌ Não acessa backups

### **👑 Administrador**
- ✅ **Acesso completo** ao sistema
- ✅ **Gerenciar usuários** (CRUD completo)
- ✅ **Alterar tipos** de usuário
- ✅ **Análise de duplicatas**
- ✅ **Backup e restore**
- ✅ **Todas as funcionalidades**

---

## 🚀 **Instalação e Configuração**

### **Requisitos do Sistema**
- **PHP**: 8.0 ou superior
- **MySQL**: 8.0 ou superior
- **Apache**: 2.4 ou superior (com mod_rewrite)
- **Composer**: Para dependências PHP
- **Extensões PHP**: PDO, PDO_MySQL, JSON, OpenSSL

### **Passo a Passo**

#### **1. Preparação do Ambiente**
```bash
# Verificar versão do PHP
php -v

# Verificar extensões necessárias
php -m | grep -E "(pdo|mysql|json|openssl)"

# Instalar Composer (se necessário)
curl -sS https://getcomposer.org/installer | php
```

#### **2. Configuração do Banco**
```sql
-- Criar banco de dados
CREATE DATABASE recepcaotb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Criar usuário (opcional)
CREATE USER 'recepcaotb_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON recepcaotb.* TO 'recepcaotb_user'@'localhost';
FLUSH PRIVILEGES;
```

#### **3. Configuração do Projeto**
```bash
# Clonar/extrair projeto
cd /var/www/html/
# Extrair arquivos do projeto

# Instalar dependências PHP
cd php/
composer install

# Configurar permissões
chmod 755 -R ../
chmod 644 ../*.html
```

#### **4. Configuração de Ambiente**
```bash
# Criar arquivo .env na pasta php/config/
cp .env.example .env

# Editar configurações
nano .env
```

**Exemplo .env:**
```env
DB_HOST=localhost
DB_NAME=recepcaotb
DB_USER=recepcaotb_user
DB_PASS=senha_segura
JWT_SECRET=sua_chave_jwt_muito_segura_aqui
```

#### **5. Importação dos Dados**
```bash
# Importar estrutura e dados
mysql -u root -p recepcaotb < exports/recepcaotb_FIXED_FULL_export_*.sql
```

#### **6. Configuração do Apache**
```apache
# Adicionar ao VirtualHost ou .htaccess
<Directory "/var/www/html/recepcaotb">
    AllowOverride All
    Require all granted
</Directory>

# Habilitar mod_rewrite
a2enmod rewrite
systemctl restart apache2
```

### **Credenciais Padrão**
- **Email**: admin@terradobugio.com
- **Senha**: admin123
- **Tipo**: Administrador

---

## 🔧 **Configuração Avançada**

### **Configuração de Segurança**
```php
// php/config/security.php
<?php
// Headers de segurança
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000');

// Configuração de sessão
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_strict_mode', 1);
?>
```

### **Configuração de Performance**
```apache
# .htaccess para cache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>

# Compressão GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### **Configuração de Backup Automático**
```bash
#!/bin/bash
# Script de backup automático
# Salvar como: /opt/scripts/backup_terrabugio.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/terrabugio"
DB_NAME="recepcaotb"
DB_USER="recepcaotb_user"
DB_PASS="senha_segura"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/html/recepcaotb

# Manter apenas últimos 30 backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "files_*.tar.gz" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

**Configurar no crontab:**
```bash
# Executar backup diário às 2:00
0 2 * * * /opt/scripts/backup_terrabugio.sh >> /var/log/backup_terrabugio.log 2>&1
```

---

## 🐛 **Troubleshooting**

### **Problemas Comuns**

#### **Erro 500 - Internal Server Error**
```bash
# Verificar logs do Apache
tail -f /var/log/apache2/error.log

# Verificar permissões
ls -la /var/www/html/recepcaotb/

# Verificar .htaccess
cat /var/www/html/recepcaotb/php/.htaccess
```

#### **Erro de Conexão com Banco**
```bash
# Testar conexão MySQL
mysql -u recepcaotb_user -p recepcaotb

# Verificar configurações
cat /var/www/html/recepcaotb/php/config/.env

# Verificar se o banco existe
mysql -u root -p -e "SHOW DATABASES;"
```

#### **Erro de Autenticação JWT**
```bash
# Verificar se a chave JWT está configurada
grep JWT_SECRET /var/www/html/recepcaotb/php/config/.env

# Limpar sessões antigas
mysql -u root -p recepcaotb -e "DELETE FROM sessoes WHERE expires_at < NOW();"
```

#### **Problemas de Permissão**
```bash
# Corrigir permissões dos arquivos
find /var/www/html/recepcaotb -type f -exec chmod 644 {} \;
find /var/www/html/recepcaotb -type d -exec chmod 755 {} \;

# Verificar proprietário
chown -R www-data:www-data /var/www/html/recepcaotb/
```

### **Logs e Monitoramento**
```bash
# Logs do Apache
tail -f /var/log/apache2/access.log
tail -f /var/log/apache2/error.log

# Logs do MySQL
tail -f /var/log/mysql/error.log

# Logs do PHP
tail -f /var/log/php/error.log

# Monitorar uso de recursos
htop
df -h
free -m
```

---

## 📊 **Monitoramento e Métricas**

### **Métricas do Sistema**
- **Pessoas cadastradas**: Total de registros na tabela pessoas
- **Frequências registradas**: Total de registros na tabela frequencias
- **Usuários ativos**: Usuários com status ativo
- **Sessões ativas**: Sessões não expiradas
- **Backups realizados**: Arquivos na pasta de backup

### **Consultas Úteis**
```sql
-- Estatísticas gerais
SELECT 
    (SELECT COUNT(*) FROM pessoas) as total_pessoas,
    (SELECT COUNT(*) FROM frequencias) as total_frequencias,
    (SELECT COUNT(*) FROM usuarios WHERE ativo = 1) as usuarios_ativos,
    (SELECT COUNT(*) FROM sessoes WHERE expires_at > NOW()) as sessoes_ativas;

-- Pessoas cadastradas por mês
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as mes,
    COUNT(*) as total
FROM pessoas 
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY mes DESC;

-- Frequências por tipo
SELECT 
    tipo,
    COUNT(*) as total,
    DATE(MIN(created_at)) as primeira,
    DATE(MAX(created_at)) as ultima
FROM frequencias 
GROUP BY tipo;

-- Usuários por tipo
SELECT 
    tipo,
    COUNT(*) as total,
    SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as ativos
FROM usuarios 
GROUP BY tipo;
```

---

## 🔄 **Atualizações e Manutenção**

### **Processo de Atualização**
1. **Backup completo** antes de qualquer atualização
2. **Testar em ambiente** de desenvolvimento
3. **Aplicar migrações** de banco se necessário
4. **Atualizar dependências** PHP via Composer
5. **Verificar compatibilidade** de versões
6. **Testar funcionalidades** críticas

### **Manutenção Preventiva**
```bash
# Limpeza de sessões expiradas (semanal)
mysql -u root -p recepcaotb -e "DELETE FROM sessoes WHERE expires_at < NOW();"

# Otimização de tabelas (mensal)
mysql -u root -p recepcaotb -e "OPTIMIZE TABLE pessoas, usuarios, frequencias, sessoes;"

# Análise de logs (diário)
grep -i error /var/log/apache2/error.log | tail -20

# Verificação de espaço em disco
df -h
du -sh /var/www/html/recepcaotb/
```

### **Backup e Restore**
```bash
# Backup completo
mysqldump -u root -p --single-transaction recepcaotb > backup_$(date +%Y%m%d).sql
tar -czf backup_files_$(date +%Y%m%d).tar.gz /var/www/html/recepcaotb/

# Restore de emergência
mysql -u root -p recepcaotb < backup_YYYYMMDD.sql
tar -xzf backup_files_YYYYMMDD.tar.gz -C /
```

---

## 📞 **Suporte e Contato**

### **Documentação Adicional**
- **README.md**: Visão geral e início rápido
- **API_REFERENCE.md**: Documentação completa das APIs
- **GUIA_INSTALACAO.md**: Guia detalhado de instalação
- **GUIA_USUARIO.md**: Manual completo do usuário

### **Estrutura de Suporte**
1. **Consultar documentação** oficial
2. **Verificar logs** do sistema
3. **Testar em ambiente** de desenvolvimento
4. **Criar backup** antes de alterações
5. **Documentar soluções** encontradas

### **Informações Técnicas**
- **Versão atual**: 2.0 (PHP)
- **Última atualização**: Outubro 2025
- **Compatibilidade**: PHP 8.0+, MySQL 8.0+
- **Status**: ✅ Produção estável

---

## 📝 **Changelog**

### **Versão 2.0 (Outubro 2025)**
- ✅ **Migração completa** para PHP
- ✅ **Sistema de voluntários** implementado
- ✅ **Relatórios avançados** com exportação
- ✅ **Análise de duplicatas** inteligente
- ✅ **Backup e restore** automático
- ✅ **Interface modernizada** e responsiva
- ✅ **Segurança aprimorada** com JWT
- ✅ **Documentação completa**

### **Versão 1.0 (Inicial)**
- ✅ Sistema básico em Node.js
- ✅ Cadastro de pessoas
- ✅ Controle de frequências
- ✅ Sistema de usuários básico

---

## 🎯 **Roadmap Futuro**

### **Próximas Funcionalidades**
- 📱 **App mobile** para registro de frequências
- 📧 **Sistema de notificações** por email
- 📊 **Dashboard** com métricas em tempo real
- 🔔 **Alertas automáticos** para administradores
- 📋 **Formulários dinâmicos** configuráveis
- 🌐 **API pública** para integrações
- 🔐 **Autenticação 2FA** para administradores

### **Melhorias Planejadas**
- ⚡ **Cache Redis** para performance
- 🔍 **Busca full-text** avançada
- 📈 **Relatórios personalizáveis**
- 🎨 **Temas customizáveis**
- 📱 **PWA** (Progressive Web App)
- 🔄 **Sincronização offline**

---

**© 2025 Sistema Terra do Bugio - Documentação Oficial v2.0**

*Esta documentação é mantida atualizada com todas as funcionalidades e configurações do sistema. Para dúvidas ou sugestões, consulte os arquivos de documentação específicos ou entre em contato com a equipe de desenvolvimento.*
