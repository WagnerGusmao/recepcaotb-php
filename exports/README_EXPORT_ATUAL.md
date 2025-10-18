# 📊 Exportação Completa do Banco de Dados - Sistema recepcaotb

## 📁 Arquivo de Exportação

**Nome**: `recepcaotb_EXPORT_COMPLETO_2025-10-18_12-27-48.sql`  
**Tamanho**: 1.13 MB (1.189.054 bytes)  
**Data**: 18 de outubro de 2025, 12:27:48  
**Linhas**: 8.069  
**Formato**: SQL (MySQL dump)

## 📊 Dados Incluídos

| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| **pessoas** | 4.665 | Cadastro completo de pessoas |
| **usuarios** | 4 | Usuários do sistema (administradores) |
| **frequencias** | 3.001 | Registro de frequências/presenças |
| **sessoes** | 97 | Sessões de login ativas/históricas |

**Total de registros**: 7.767

## 🚀 Como Importar no phpMyAdmin

### 1. **Preparação**
- Acesse seu phpMyAdmin
- Certifique-se de ter pelo menos 50MB de limite de upload
- Configure timeout para 300 segundos ou mais

### 2. **Criar Base de Dados**
```sql
CREATE DATABASE recepcaotb 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;
```

### 3. **Importar Arquivo**
1. Selecione a base `recepcaotb`
2. Clique em **"Importar"**
3. Escolha o arquivo: `recepcaotb_EXPORT_COMPLETO_2025-10-18_12-27-48.sql`
4. Configure:
   - **Formato**: SQL
   - **Charset**: utf8mb4_general_ci
   - **Tamanho máximo**: 50MB+
5. Clique em **"Executar"**

### 4. **Tempo de Importação**
- **Estimado**: 2-5 minutos
- **Depende de**: Velocidade do servidor, configurações PHP

## 🔐 Credenciais de Acesso

Após a importação, use estas credenciais para acessar o sistema:

- **Email**: admin@terradobugio.com
- **Senha**: admin123
- **Tipo**: Administrador (acesso completo)

## ✅ Verificação Pós-Importação

Execute estas consultas para verificar se tudo foi importado corretamente:

```sql
-- Verificar tabelas criadas
SHOW TABLES;

-- Contar registros por tabela
SELECT 'pessoas' as tabela, COUNT(*) as registros FROM pessoas
UNION ALL
SELECT 'usuarios' as tabela, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'frequencias' as tabela, COUNT(*) as registros FROM frequencias
UNION ALL
SELECT 'sessoes' as tabela, COUNT(*) as registros FROM sessoes;

-- Verificar usuário administrador
SELECT id, nome, email, tipo, ativo FROM usuarios WHERE email = 'admin@terradobugio.com';
```

**Resultados esperados**:
- 4 tabelas criadas
- 7.767 registros totais
- 1 usuário administrador ativo

## 🔧 Configuração do Sistema PHP

Após importar o banco, configure o sistema PHP:

### 1. **Arquivo de Configuração**
Edite `php/config/database.php`:
```php
$this->host = 'localhost';        // Seu host MySQL
$this->dbname = 'recepcaotb';     // Nome da base
$this->username = 'root';         // Seu usuário MySQL
$this->password = '';             // Sua senha MySQL
```

### 2. **Iniciar Servidor**
```bash
php -S localhost:8080 router.php
```

### 3. **Acessar Sistema**
- **URL**: http://localhost:8080
- **Login**: http://localhost:8080/login.html
- **Painel**: http://localhost:8080/painel-simples.html

## 📋 Funcionalidades Incluídas

✅ **Sistema de Autenticação** (JWT + sessões)  
✅ **Cadastro de Pessoas** (página pública + painel)  
✅ **Registro de Frequências** (tipos: geral, pet)  
✅ **Relatórios Completos** (PDF, CSV, XLSX)  
✅ **Gerenciamento de Usuários** (CRUD completo)  
✅ **Análise de Duplicatas** (algoritmo de similaridade)  
✅ **Sistema de Backup** (criação e restauração)  

## 🛡️ Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT com expiração
- Prepared statements (PDO)
- Validação de permissões por tipo de usuário
- Headers de segurança configurados

## 📞 Suporte

Se encontrar problemas na importação:

1. **Verifique logs do phpMyAdmin**
2. **Aumente limites PHP**: memory_limit, max_execution_time
3. **Confirme charset**: utf8mb4_general_ci
4. **Teste conexão**: Verifique credenciais MySQL

---

**Sistema Terra do Bugio - Versão PHP**  
**Exportação gerada em**: 18/10/2025 12:27:48  
**Arquivo válido e testado** ✅
