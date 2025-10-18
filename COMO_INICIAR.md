# 🚀 Como Iniciar o Projeto Sistema de Frequência

## Pré-requisitos
- Node.js 18.x ou superior instalado
- npm (vem com Node.js)

## Passo a Passo para Primeira Execução

### 1. Instalar Dependências
```bash
cd backend
npm install
```

Isso irá instalar:
- express
- bcrypt
- cors
- express-rate-limit
- sqlite3
- csv-parser
- xlsx
- nodemon (dev)

### 2. Executar Migração do Banco
```bash
npm run migrate
```

Este comando irá:
- Criar o arquivo `frequencia.db` (se não existir)
- Criar todas as tabelas necessárias
- Adicionar coluna `observacao` (se já tiver banco antigo)
- Criar usuário administrador inicial

**Credenciais criadas:**
- Email: `admin@terradobugio.com`
- Senha: `admin123`

### 3. Iniciar o Servidor
```bash
npm start
```

O servidor estará rodando em: `http://localhost:8080`

### 4. Acessar o Sistema
Abra o navegador e acesse:
- **Cadastro Público:** `index.html` (abrir diretamente no navegador)
- **Login Voluntários:** `login.html`

## Comandos Disponíveis

### No diretório `backend/`

```bash
# Iniciar servidor (produção)
npm start

# Iniciar com auto-reload (desenvolvimento)
npm run dev

# Executar migração do banco
npm run migrate

# Executar carga inicial (se tiver)
npm run carga-inicial
```

### No diretório raiz

```bash
# Instalar dependências do backend
npm run install-all

# Iniciar servidor
npm start

# Modo desenvolvimento
npm run dev

# Migração
npm run migrate
```

## Estrutura de Pastas

```
Sistema_Frequencia - Copia/
├── backend/
│   ├── server.js           # Servidor Express
│   ├── database.js         # Configuração do banco
│   ├── auth.js            # Autenticação
│   ├── usuarios.js        # Rotas de usuários
│   ├── migrate.js         # Script de migração
│   ├── package.json       # Dependências
│   └── frequencia.db      # Banco SQLite (criado automaticamente)
├── js/
│   └── script.js          # Frontend JavaScript
├── css/
│   └── style.css          # Estilos
├── index.html             # Página de cadastro público
├── login.html             # Página de login
└── package.json           # Scripts raiz
```

## Solução de Problemas

### Erro: MODULE_NOT_FOUND
**Causa:** Dependências não instaladas
**Solução:**
```bash
cd backend
npm install
```

### Erro: Cannot find module 'bcrypt'
**Causa:** bcrypt não foi instalado corretamente
**Solução:**
```bash
cd backend
npm install bcrypt --save
```

### Erro: EADDRINUSE (porta em uso)
**Causa:** Porta 8080 já está sendo usada
**Solução:**
1. Fechar processo que usa a porta 8080, ou
2. Mudar porta no código: `const PORT = 3001;` em `server.js`

### Banco de dados não cria
**Solução:**
```bash
cd backend
node migrate.js
```

### Login não funciona
**Verificar:**
1. Servidor está rodando? (`php -S localhost:8080`)
2. Migração foi executada? (`npm run migrate`)
3. Console do navegador mostra erros?

## Testando o Sistema

### 1. Testar Cadastro Público
1. Abrir `index.html` no navegador
2. Preencher formulário de cadastro
3. Clicar em "Cadastrar"
4. Deve aparecer mensagem de sucesso

### 2. Testar Login
1. Abrir `login.html` no navegador
2. Usar credenciais:
   - Email: `admin@terradobugio.com`
   - Senha: `admin123`
3. Deve redirecionar para `painel-simples.html`

### 3. Testar Frequência
1. Fazer login como voluntário
2. Buscar pessoa cadastrada
3. Selecionar tipo de presença
4. Informar número da senha
5. Marcar frequência

## Desenvolvimento

### Modo Watch (Auto-reload)
```bash
cd backend
npm run dev
```

O servidor reinicia automaticamente quando você salva arquivos.

### Estrutura do Banco
- **pessoas:** Cadastros públicos
- **frequencias:** Registros de presença
- **usuarios:** Voluntários do sistema
- **sessoes:** Tokens de autenticação

### Criar Novo Usuário Voluntário
Use o painel de administrador ou execute SQL direto:
```sql
-- Primeiro, gere o hash da senha usando bcrypt
-- Depois insira:
INSERT INTO usuarios (nome, email, senha, tipo, ativo)
VALUES ('Nome', 'email@example.com', 'hash_bcrypt_aqui', 'geral', 1);
```

Tipos de usuário:
- `geral`: Pode cadastrar e marcar frequência
- `responsavel`: Pode ver relatórios
- `administrador`: Acesso total

## Próximos Passos

Após inicializar com sucesso:

1. **Alterar senha do admin:**
   - Fazer login
   - Ir em configurações/usuários
   - Alterar senha padrão

2. **Criar usuários voluntários:**
   - Login como admin
   - Acessar gestão de usuários
   - Criar contas para voluntários

3. **Testar fluxo completo:**
   - Cadastro público → Busca → Frequência → Relatório

4. **Backup do banco:**
   ```bash
   cp backend/frequencia.db backend/frequencia.db.backup
   ```

## Suporte

Se encontrar problemas:
1. Verificar logs do servidor no terminal
2. Verificar console do navegador (F12)
3. Confirmar que todas as dependências foram instaladas
4. Verificar se a migração foi executada com sucesso
