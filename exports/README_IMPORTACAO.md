# 📊 Exportação Completa da Base de Dados - Sistema Terra do Bugio

## 📋 Informações da Exportação

- **📅 Data**: 16 de Outubro de 2025, 11:56:55
- **🔧 Versão**: Sistema Terra do Bugio v1.1.0
- **📊 Database**: recepcaotb
- **🏠 Servidor**: localhost:3306 (MariaDB 10.4.32)
- **📁 Arquivo**: `recepcaotb_complete_export_2025-10-16T14-56-55.sql`
- **📦 Tamanho**: 0.01 MB (sistema limpo)

## 🗂️ Conteúdo Incluído

### ✅ **Estrutura Completa:**
- **6 tabelas** com estrutura completa
- **Índices** e chaves primárias
- **Chaves estrangeiras** e relacionamentos
- **Configurações de charset** (UTF8MB4)
- **Auto-increment** configurado

### 📊 **Dados Atuais:**
- **`frequencias`**: 0 registros (tabela limpa)
- **`pessoas`**: 1 registro (pessoa de teste)
- **`usuarios`**: 1 registro (administrador)
- **`sessoes`**: 1 registro (sessão ativa)
- **`knex_migrations`**: 2 registros (migrações)
- **`knex_migrations_lock`**: 1 registro (controle)

### 🔧 **Tabelas Incluídas:**

#### 1. **`pessoas`** - Cadastro de Pessoas
```sql
- id (PK, AUTO_INCREMENT)
- nome (VARCHAR 255, NOT NULL)
- cpf (VARCHAR 14)
- nascimento (DATE)
- religiao (VARCHAR 100)
- cidade (VARCHAR 100, NOT NULL)
- estado (VARCHAR 2, NOT NULL)
- telefone (VARCHAR 20)
- email (VARCHAR 255)
- indicacao (VARCHAR 255)
- observacao (TEXT)
- created_at (TIMESTAMP)
```

#### 2. **`frequencias`** - Registro de Frequências
```sql
- id (PK, AUTO_INCREMENT)
- pessoa_id (FK para pessoas)
- tipo (VARCHAR 50, NOT NULL)
- numero_senha (INT, NOT NULL)
- data (DATE, NOT NULL)
- numero_senha_tutor (INT)
- numero_senha_pet (INT)
- created_at (TIMESTAMP)
```

#### 3. **`usuarios`** - Usuários do Sistema
```sql
- id (PK, AUTO_INCREMENT)
- nome (VARCHAR 255, NOT NULL)
- email (VARCHAR 255, NOT NULL, UNIQUE)
- senha (VARCHAR 255, NOT NULL) - Hash bcrypt
- tipo (ENUM: geral, responsavel, administrador)
- pessoa_id (FK para pessoas)
- ativo (BOOLEAN, DEFAULT 1)
- deve_trocar_senha (BOOLEAN, DEFAULT 0)
- created_at (TIMESTAMP)
```

#### 4. **`sessoes`** - Controle de Sessões
```sql
- id (PK, AUTO_INCREMENT)
- usuario_id (FK para usuarios)
- token (VARCHAR 255, NOT NULL, UNIQUE) - JWT
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
- user_agent (TEXT)
- ip_address (VARCHAR 45)
```

#### 5. **`knex_migrations`** - Controle de Migrações
```sql
- id (PK, AUTO_INCREMENT)
- name (VARCHAR 255)
- batch (INT)
- migration_time (TIMESTAMP)
```

#### 6. **`knex_migrations_lock`** - Lock de Migrações
```sql
- index (PK, AUTO_INCREMENT)
- is_locked (INT)
```

## 🚀 Instruções para Importação no phpMyAdmin

### **Passo 1: Preparar o Ambiente**
1. Acesse o **phpMyAdmin**
2. Certifique-se de ter privilégios de administrador
3. Verifique se o MySQL/MariaDB está rodando

### **Passo 2: Criar a Base de Dados**
1. Clique em **"Nova"** no painel esquerdo
2. Digite o nome: **`recepcaotb`**
3. Selecione **Collation**: `utf8mb4_general_ci`
4. Clique em **"Criar"**

### **Passo 3: Importar o Arquivo SQL**
1. Selecione a base **`recepcaotb`** criada
2. Clique na aba **"Importar"**
3. Clique em **"Escolher arquivo"**
4. Selecione: `recepcaotb_complete_export_2025-10-16T14-56-55.sql`
5. **Configurações recomendadas:**
   - Formato: **SQL**
   - Charset: **utf8mb4**
   - Permitir interrupção: **Marcado**
6. Clique em **"Executar"**

### **Passo 4: Verificar a Importação**
Após a importação, verifique se as tabelas foram criadas:
```sql
SHOW TABLES;
```
Resultado esperado:
```
frequencias
knex_migrations
knex_migrations_lock
pessoas
sessoes
usuarios
```

## 🔒 Credenciais Padrão

Após a importação, use estas credenciais para acessar o sistema:

- **📧 Email**: `admin@terradobugio.com`
- **🔑 Senha**: `admin123`
- **👤 Tipo**: Administrador
- **🌐 Acesso**: `http://localhost/seu-projeto/painel-simples.html`

## ⚙️ Configurações Necessárias

### **1. Arquivo `.env`**
Configure o arquivo `.env` do projeto com as credenciais do seu banco:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=recepcaotb
```

### **2. Dependências do Node.js**
Instale as dependências:
```bash
npm install
```

### **3. Iniciar o Servidor**
```bash
npm start
```

## 🔍 Verificação de Integridade

### **Contagem de Registros Esperada:**
```sql
SELECT 'frequencias' as tabela, COUNT(*) as registros FROM frequencias
UNION ALL
SELECT 'pessoas', COUNT(*) FROM pessoas
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'sessoes', COUNT(*) FROM sessoes;
```

**Resultado esperado:**
- frequencias: 0
- pessoas: 1
- usuarios: 1
- sessoes: 1

### **Verificar Usuário Administrador:**
```sql
SELECT id, nome, email, tipo, ativo FROM usuarios WHERE tipo = 'administrador';
```

## 🆘 Solução de Problemas

### **Erro de Charset:**
Se houver problemas com acentos, execute:
```sql
ALTER DATABASE recepcaotb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

### **Erro de Chaves Estrangeiras:**
Se houver erro de FK, desabilite temporariamente:
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Importar arquivo
SET FOREIGN_KEY_CHECKS = 1;
```

### **Erro de Memória:**
Para arquivos grandes, aumente os limites no phpMyAdmin:
- `upload_max_filesize = 64M`
- `post_max_size = 64M`
- `max_execution_time = 300`

## 📞 Suporte

Para dúvidas sobre a importação:
1. Consulte a **[Documentação Completa](../DOCUMENTACAO_COMPLETA.md)**
2. Verifique o **[Guia de Instalação](../GUIA_INSTALACAO.md)**
3. Leia as **[Perguntas Frequentes](../GUIA_USUARIO.md)**

---

**✅ Arquivo pronto para importação no phpMyAdmin!**  
**🎯 Sistema Terra do Bugio v1.1.0 - Base Limpa e Otimizada**
