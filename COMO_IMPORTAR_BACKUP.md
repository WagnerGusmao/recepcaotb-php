# 📥 Como Importar o Backup do Banco de Dados

## 🎯 Objetivo

Restaurar o backup completo do banco de dados que está em `C:\Projetos\BD\recepcaotb_EXPORT_COMPLETO_2025-10-20_22-18-10.sql`

---

## 🚀 Opção 1: Usando o Script Automático (MAIS FÁCIL)

### Passo 1: Execute o arquivo BAT

1. **Dê duplo clique** em: `IMPORTAR_BACKUP.bat`
2. Aguarde a importação (pode levar alguns minutos)
3. Verifique se apareceu ✅ SUCESSO

**Pronto!** Se funcionou, pule para a seção "Testar Login".

---

## 🔧 Opção 2: Importação Manual via MySQL CLI

Se o script BAT não funcionar, use este método:

### Passo 1: Abrir terminal como Administrador

- Pressione `Win + X`
- Escolha "Terminal (Admin)" ou "PowerShell (Admin)"

### Passo 2: Localizar o executável do MySQL

Dependendo da sua instalação:

**XAMPP:**
```cmd
cd C:\xampp\mysql\bin
```

**WAMP:**
```cmd
cd C:\wamp64\bin\mysql\mysql8.0.27\bin
```

**MySQL Standalone:**
```cmd
cd C:\Program Files\MySQL\MySQL Server 8.0\bin
```

### Passo 3: Executar importação

```cmd
mysql.exe -u root recepcaotb_local < "C:\Projetos\BD\recepcaotb_EXPORT_COMPLETO_2025-10-20_22-18-10.sql"
```

**Se tiver senha no MySQL:**
```cmd
mysql.exe -u root -p recepcaotb_local < "C:\Projetos\BD\recepcaotb_EXPORT_COMPLETO_2025-10-20_22-18-10.sql"
```

### Passo 4: Aguardar

A importação pode levar de 1 a 5 minutos dependendo do tamanho do arquivo.

---

## 🌐 Opção 3: Importação via phpMyAdmin (Interface Gráfica)

### Passo 1: Abrir phpMyAdmin

- Se usa XAMPP: http://localhost/phpmyadmin
- Se usa WAMP: http://localhost/phpmyadmin

### Passo 2: Selecionar banco

1. Clique em `recepcaotb_local` na lateral esquerda
2. Clique na aba **"Importar"** no topo

### Passo 3: Importar arquivo

1. Clique em **"Escolher arquivo"**
2. Navegue até: `C:\Projetos\BD\recepcaotb_EXPORT_COMPLETO_2025-10-20_22-18-10.sql`
3. **Importante**: Role até o final da página
4. Clique em **"Executar"** ou **"Go"**
5. Aguarde a importação (pode demorar)

⚠️ **ATENÇÃO**: Se o arquivo for muito grande (>2MB), pode dar timeout. Neste caso, use a Opção 1 ou 2.

---

## ✅ Verificar se a Importação Funcionou

### Via PHP

Execute no terminal (dentro da pasta do projeto):

```cmd
php -r "require 'php/config/database.php'; $db = new Database(); $pdo = $db->connect(); $stmt = $pdo->query('SELECT COUNT(*) as total FROM pessoas'); $result = $stmt->fetch(PDO::FETCH_ASSOC); echo 'Pessoas cadastradas: ' . $result['total'];"
```

Se mostrar um número maior que 0, **funcionou!**

### Via MySQL CLI

```cmd
mysql -u root recepcaotb_local -e "SELECT COUNT(*) FROM pessoas; SELECT COUNT(*) FROM usuarios;"
```

---

## 🔐 Testar Login

Após a importação, você pode fazer login com os usuários que existiam no backup original.

### Listar usuários disponíveis:

```cmd
php test_db.php
```

Ou via MySQL:

```cmd
mysql -u root recepcaotb_local -e "SELECT nome, email, tipo FROM usuarios WHERE ativo = 1;"
```

### Fazer Login

1. Acesse: http://localhost:8000/login.html
2. Use email e senha de um usuário existente
3. Se não lembrar a senha, peça para um admin resetar

---

## ⚠️ Problemas Comuns

### Erro: "MySQL command not found"

**Solução**: O MySQL não está no PATH. Use o caminho completo:

```cmd
"C:\xampp\mysql\bin\mysql.exe" -u root recepcaotb_local < "C:\Projetos\BD\recepcaotb_EXPORT_COMPLETO_2025-10-20_22-18-10.sql"
```

### Erro: "Access denied for user 'root'"

**Solução**: Adicione senha:

```cmd
mysql -u root -p recepcaotb_local < "C:\Projetos\BD\recepcaotb_EXPORT_COMPLETO_2025-10-20_22-18-10.sql"
```

### Erro: "Unknown database 'recepcaotb_local'"

**Solução**: Crie o banco primeiro:

```cmd
mysql -u root -e "CREATE DATABASE recepcaotb_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Depois rode a importação novamente.

### Erro: "MySQL server has gone away"

**Solução**: Aumente os timeouts do MySQL. Edite `my.ini` ou `my.cnf`:

```ini
max_allowed_packet=64M
wait_timeout=600
```

Reinicie o MySQL e tente novamente.

---

## 📞 Ajuda

Se nenhuma opção funcionar:

1. Anote a mensagem de erro completa
2. Verifique se o arquivo existe em `C:\Projetos\BD`
3. Confirme que o MySQL está rodando
4. Tente criar o banco manualmente e depois importar

---

## ✨ Próximos Passos

Após importar com sucesso:

1. ✅ Faça login no sistema
2. ✅ Verifique se os dados estão corretos
3. ✅ Teste cadastrar uma frequência
4. ✅ Sistema está pronto para uso!
