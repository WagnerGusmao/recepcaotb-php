# 📊 Exportação COMPLETA com TODOS os Dados - Sistema Terra do Bugio

## 📋 Informações da Exportação Completa

- **📅 Data**: 16 de Outubro de 2025, 12:08:22
- **🔧 Versão**: Sistema Terra do Bugio v1.1.0
- **📊 Database**: recepcaotb
- **🏠 Servidor**: localhost:3306 (MariaDB 10.4.32)
- **📁 Arquivo**: `recepcaotb_FULL_DATA_export_2025-10-16T15-08-21.sql`
- **📦 Tamanho**: 0.88 MB (TODOS os dados incluídos)

## 🎯 **ARQUIVO COMPLETO COM TODOS OS DADOS HISTÓRICOS**

### ✅ **Dados Completos Incluídos:**
- **`pessoas`**: **4.662 registros** completos com todos os cadastros
- **`frequencias`**: **3.000 registros** de frequência históricos
- **`usuarios`**: **9 usuários** do sistema (incluindo administradores)
- **`sessoes`**: **59 sessões** ativas e históricas
- **`knex_migrations`**: **2 registros** de migração
- **`knex_migrations_lock`**: **1 registro** de controle

### 📊 **Estatísticas Importantes:**
- **Total de registros**: **7.733 registros** em 6 tabelas
- **Administradores**: 3 usuários
- **Pessoas com CPF**: 1.629 registros
- **Frequências recentes**: 3.000 registros (últimos 30 dias)

## 🗂️ Estrutura Completa das Tabelas

### 📋 **1. Tabela `pessoas` (4.662 registros)**
```sql
CREATE TABLE `pessoas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `nascimento` date DEFAULT NULL,
  `religiao` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) NOT NULL,
  `estado` varchar(2) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `indicacao` varchar(255) DEFAULT NULL,
  `observacao` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pessoas_nome` (`nome`),
  KEY `idx_pessoas_cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=5516 DEFAULT CHARSET=utf8mb4;
```

### 📊 **2. Tabela `frequencias` (3.000 registros)**
```sql
CREATE TABLE `frequencias` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pessoa_id` int(10) unsigned NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `numero_senha` int(11) NOT NULL,
  `data` date NOT NULL,
  `numero_senha_tutor` int(11) DEFAULT NULL,
  `numero_senha_pet` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_frequencias_data` (`data`),
  KEY `idx_frequencias_pessoa_id` (`pessoa_id`),
  KEY `idx_frequencias_tipo` (`tipo`),
  CONSTRAINT `frequencias_pessoa_id_foreign` FOREIGN KEY (`pessoa_id`) REFERENCES `pessoas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3008 DEFAULT CHARSET=utf8mb4;
```

### 👥 **3. Tabela `usuarios` (9 registros)**
```sql
CREATE TABLE `usuarios` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo` enum('geral','responsavel','administrador') NOT NULL,
  `pessoa_id` int(10) unsigned DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `deve_trocar_senha` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_email_unique` (`email`),
  KEY `usuarios_pessoa_id_foreign` (`pessoa_id`),
  KEY `idx_usuarios_email` (`email`),
  CONSTRAINT `usuarios_pessoa_id_foreign` FOREIGN KEY (`pessoa_id`) REFERENCES `pessoas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;
```

### 🔐 **4. Tabela `sessoes` (59 registros)**
```sql
CREATE TABLE `sessoes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_agent` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessoes_token_unique` (`token`),
  KEY `sessoes_usuario_id_foreign` (`usuario_id`),
  KEY `idx_sessoes_token` (`token`),
  KEY `idx_sessoes_expires` (`expires_at`),
  CONSTRAINT `sessoes_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=177 DEFAULT CHARSET=utf8mb4;
```

## 🚀 Instruções para Importação no phpMyAdmin

### **⚠️ CONFIGURAÇÕES OBRIGATÓRIAS ANTES DA IMPORTAÇÃO**

Devido ao volume de dados (7.733 registros), é **ESSENCIAL** configurar os limites adequados:

#### **1. Configurar Limites no PHP (php.ini):**
```ini
max_execution_time = 600        ; 10 minutos
memory_limit = 512M             ; 512MB de memória
upload_max_filesize = 100M      ; Upload até 100MB
post_max_size = 100M            ; POST até 100MB
max_input_time = 600            ; 10 minutos para input
```

#### **2. Configurar Limites no MySQL:**
```sql
SET SESSION max_allowed_packet = 67108864;  -- 64MB
SET SESSION wait_timeout = 600;             -- 10 minutos
```

### **📋 Passo a Passo da Importação:**

#### **Passo 1: Preparar o Ambiente**
1. **Reinicie o Apache/Nginx** após alterar o php.ini
2. **Acesse o phpMyAdmin**
3. **Verifique os limites** em "Variáveis" → Procure por `upload_max_filesize`

#### **Passo 2: Criar a Base de Dados**
1. Clique em **"Nova"** no painel esquerdo
2. Digite o nome: **`recepcaotb`**
3. Selecione **Collation**: `utf8mb4_general_ci`
4. Clique em **"Criar"**

#### **Passo 3: Importar o Arquivo SQL**
1. Selecione a base **`recepcaotb`** criada
2. Clique na aba **"Importar"**
3. Clique em **"Escolher arquivo"**
4. Selecione: `recepcaotb_FULL_DATA_export_2025-10-16T15-08-21.sql`
5. **Configurações OBRIGATÓRIAS:**
   - **Formato**: SQL
   - **Charset**: utf8mb4
   - **Permitir interrupção**: ✅ Marcado
   - **Executar consultas parciais**: ✅ Marcado
   - **Número de consultas a pular**: 0
6. Clique em **"Executar"**

#### **Passo 4: Monitorar a Importação**
- **Tempo estimado**: 2-5 minutos
- **Progresso**: Acompanhe a barra de progresso
- **Não feche** a aba durante a importação

### **✅ Verificação Pós-Importação**

#### **1. Verificar Tabelas Criadas:**
```sql
SHOW TABLES;
```
**Resultado esperado:**
```
frequencias          (3.000 registros)
knex_migrations      (2 registros)
knex_migrations_lock (1 registro)
pessoas              (4.662 registros)
sessoes              (59 registros)
usuarios             (9 registros)
```

#### **2. Verificar Contagem de Registros:**
```sql
SELECT 
    'pessoas' as tabela, COUNT(*) as registros FROM pessoas
UNION ALL
SELECT 'frequencias', COUNT(*) FROM frequencias
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'sessoes', COUNT(*) FROM sessoes;
```

#### **3. Verificar Usuários Administradores:**
```sql
SELECT id, nome, email, tipo, ativo 
FROM usuarios 
WHERE tipo = 'administrador';
```

## 🔒 Credenciais de Acesso

### **Credenciais Principais:**
- **📧 Email**: `admin@terradobugio.com`
- **🔑 Senha**: `admin123`
- **👤 Tipo**: Administrador
- **🌐 Acesso**: `http://localhost/seu-projeto/painel-simples.html`

### **Outros Usuários Disponíveis:**
O sistema contém **9 usuários** com diferentes níveis de acesso:
- **3 Administradores** (acesso completo)
- **Responsáveis** (acesso limitado)
- **Usuários gerais** (acesso básico)

## ⚙️ Configuração do Sistema

### **1. Arquivo `.env`**
Configure o arquivo `.env` do projeto:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=recepcaotb
```

### **2. Instalar Dependências:**
```bash
npm install
```

### **3. Iniciar o Servidor:**
```bash
npm start
```

## 🎯 Sistema Completo e Funcional

### **✅ Após a Importação, o Sistema Terá:**
- **4.662 pessoas** cadastradas com dados completos
- **3.000 frequências** registradas historicamente
- **9 usuários** com diferentes níveis de acesso
- **Todas as funcionalidades** 100% operacionais
- **Relatórios** com dados reais
- **Sistema de duplicatas** com dados para análise
- **Backup automático** configurado

### **🎉 Funcionalidades Disponíveis:**
- ✅ **Cadastro de pessoas** (página pública e painel)
- ✅ **Registro de frequências** (5 tipos diferentes)
- ✅ **Relatórios avançados** (PDF, CSV, XLSX)
- ✅ **Gerenciamento de usuários** (3 níveis)
- ✅ **Análise de duplicatas** (com dados reais)
- ✅ **Sistema de backup** (automático)
- ✅ **Busca avançada** (nome, CPF, cidade)

## 🆘 Solução de Problemas

### **Erro: "Script timeout"**
```ini
; Aumentar no php.ini:
max_execution_time = 900
max_input_time = 900
```

### **Erro: "Memory limit exceeded"**
```ini
; Aumentar no php.ini:
memory_limit = 1024M
```

### **Erro: "File too large"**
```ini
; Aumentar no php.ini:
upload_max_filesize = 200M
post_max_size = 200M
```

### **Erro de Charset/Acentos:**
```sql
ALTER DATABASE recepcaotb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

## 📞 Suporte

Para dúvidas sobre a importação:
1. Consulte a **[Documentação Completa](../DOCUMENTACAO_COMPLETA.md)**
2. Verifique o **[Guia de Instalação](../GUIA_INSTALACAO.md)**
3. Leia as **[Perguntas Frequentes](../GUIA_USUARIO.md)**

---

## 🎊 **ARQUIVO COMPLETO COM TODOS OS DADOS HISTÓRICOS!**

**✅ 7.733 registros incluídos**  
**✅ Sistema 100% funcional após importação**  
**✅ Todos os dados históricos preservados**  
**🎯 Sistema Terra do Bugio v1.1.0 - Dados Completos**
