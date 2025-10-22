# 🚀 Guia de Deploy - Hostinger

**Data**: 22/10/2025  
**Destino**: Hostinger  
**URL**: https://ivory-worm-865052.hostingersite.com/

---

## 📋 Pré-requisitos

### Credenciais do Banco de Dados
- **Host**: localhost
- **Database**: u746854799_tbrecepcao
- **Usuário**: u746854799_recepcaotb
- **Senha**: TBrecepcao@1

### Acesso Hostinger
- Painel de Controle: hPanel
- FTP ou File Manager disponível

---

## 🔧 Preparação Local

### 1. Criar Arquivo .env de Produção

Copie o arquivo `.env.production` para `.env` no servidor:

```bash
# Este arquivo já foi criado com as configurações corretas
# Arquivo: .env.production
```

### 2. Verificar Estrutura de Arquivos

Estrutura que será enviada ao Hostinger:
```
public_html/
├── index.html
├── login.html
├── trocar-senha.html
├── painel-simples.html
├── .htaccess
├── .env (renomeado de .env.production)
├── favicon.ico
├── css/
├── js/
├── imagem/
└── php/
    ├── .htaccess
    ├── index.php
    ├── api/
    ├── classes/
    ├── config/
    ├── migrations/
    ├── backups/
    └── logs/
```

---

## 📤 Passo a Passo do Deploy

### Método 1: Via File Manager (Recomendado)

#### Passo 1: Preparar os Arquivos

1. **Criar arquivo .env para produção**:
   ```bash
   # No Windows (PowerShell)
   Copy-Item .env.production .env
   ```

2. **Criar arquivo ZIP do projeto**:
   ```powershell
   # Excluir arquivos desnecessários e criar ZIP
   Compress-Archive -Path * -DestinationPath recepcaotb_deploy.zip -Force
   ```

#### Passo 2: Upload para Hostinger

1. Acesse o **hPanel** do Hostinger
2. Vá em **File Manager**
3. Navegue até **public_html/**
4. Faça upload do arquivo **recepcaotb_deploy.zip**
5. Clique com botão direito no arquivo e selecione **Extract**
6. Após extrair, delete o arquivo ZIP

#### Passo 3: Configurar Permissões

No File Manager, configure as permissões:

```
php/logs/         → 755 (pasta)
php/backups/      → 755 (pasta)
php/config/       → 755 (pasta)
.env              → 644 (apenas leitura)
.htaccess         → 644 (apenas leitura)
php/.htaccess     → 644 (apenas leitura)
```

### Método 2: Via FTP (FileZilla)

#### Passo 1: Conectar via FTP

```
Host: ftp.ivory-worm-865052.hostingersite.com
Usuário: [seu_usuario_ftp]
Senha: [sua_senha_ftp]
Porta: 21
```

#### Passo 2: Upload dos Arquivos

1. Navegue até a pasta `public_html/`
2. Faça upload de todos os arquivos do projeto
3. Certifique-se de enviar:
   - Todos os arquivos HTML
   - Pasta `php/` completa
   - Pasta `css/`, `js/`, `imagem/`
   - Arquivo `.htaccess` (raiz e php/)
   - Arquivo `.env` (renomeado de `.env.production`)

---

## 🗄️ Configuração do Banco de Dados

### Passo 1: Importar Estrutura do Banco

1. Acesse **phpMyAdmin** no hPanel
2. Selecione o banco `u746854799_tbrecepcao`
3. Clique em **Importar**
4. Selecione o arquivo mais recente:
   - `backups/recepcaotb_backup_2025-10-22_202736.sql`

### Passo 2: Verificar Tabelas Criadas

Verifique se as seguintes tabelas foram criadas:
- ✅ `usuarios`
- ✅ `pessoas`
- ✅ `frequencias`
- ✅ `voluntarios`
- ✅ `frequencia_voluntarios`
- ✅ `sessoes`
- ✅ `rate_limits`

### Passo 3: Criar Usuário Admin (se necessário)

Se o backup não incluir usuário admin, acesse via navegador:

```
https://ivory-worm-865052.hostingersite.com/create_admin.php
```

Ou execute via SSH/Terminal:
```bash
php public_html/create_admin.php
```

---

## ✅ Verificação Pós-Deploy

### 1. Testar Conectividade

Acesse o arquivo de teste do banco:
```
https://ivory-worm-865052.hostingersite.com/php/config/database.php
```

### 2. Testar Login

1. Acesse: https://ivory-worm-865052.hostingersite.com/login.html
2. Tente fazer login com:
   - **Email**: admin@terradobugio.com
   - **Senha**: Admin@123

### 3. Testar APIs

Teste cada endpoint principal:

```bash
# Auth
curl https://ivory-worm-865052.hostingersite.com/api/auth

# Pessoas
curl https://ivory-worm-865052.hostingersite.com/api/pessoas

# Voluntários
curl https://ivory-worm-865052.hostingersite.com/api/voluntarios
```

### 4. Verificar Logs

Verifique se os logs estão sendo criados:
```
php/logs/app.log
```

---

## 🔒 Segurança Pós-Deploy

### 1. Proteger Arquivos Sensíveis

Certifique-se que o `.htaccess` está protegendo:
- ✅ `.env` - Não acessível via web
- ✅ `*.log` - Logs protegidos
- ✅ `php/config/` - Configurações protegidas

### 2. Alterar JWT Secret

No arquivo `.env`, altere o `JWT_SECRET` para uma chave forte:
```bash
JWT_SECRET=sua_chave_muito_segura_e_aleatoria_aqui
```

### 3. Remover Arquivos de Setup (Opcional)

Após confirmar que tudo funciona, considere remover:
- `create_admin.php`
- `setup_tables.php`
- `create_database.php`

---

## 🐛 Troubleshooting

### Erro: "Connection refused"

**Solução**: Verifique as credenciais no `.env`

### Erro: "Table doesn't exist"

**Solução**: Reimporte o backup SQL via phpMyAdmin

### Erro: "Permission denied"

**Solução**: Ajuste permissões das pastas:
```bash
chmod 755 php/logs
chmod 755 php/backups
```

### Erro 500 - Internal Server Error

**Possíveis causas**:
1. Arquivo `.htaccess` com diretivas não suportadas
2. Permissões incorretas
3. Erro no PHP (verificar logs)

**Solução**: 
1. Verifique os logs de erro do Hostinger
2. Teste desabilitando o `.htaccess` temporariamente
3. Verifique a versão do PHP (recomendado: PHP 8.0+)

### APIs retornando 404

**Solução**: Certifique-se que o `mod_rewrite` está ativo no `.htaccess`

---

## 📞 Checklist Final

- [ ] Arquivos enviados para `public_html/`
- [ ] Arquivo `.env` configurado com credenciais do Hostinger
- [ ] Banco de dados importado via phpMyAdmin
- [ ] Permissões das pastas ajustadas (755)
- [ ] Login testado com usuário admin
- [ ] APIs testando e respondendo
- [ ] Logs sendo gerados corretamente
- [ ] JWT Secret alterado para produção
- [ ] Arquivos sensíveis protegidos pelo .htaccess

---

## 🎉 Deploy Concluído!

Seu sistema está agora rodando em:
**https://ivory-worm-865052.hostingersite.com/**

### Próximos Passos:

1. ✅ Testar todas as funcionalidades
2. ✅ Configurar backups automáticos
3. ✅ Monitorar logs de erro
4. ✅ Configurar email (se necessário)
5. ✅ Configurar domínio customizado (opcional)

---

## 📝 Notas Importantes

- **Backups**: Configure backups periódicos no hPanel
- **SSL**: Hostinger fornece SSL gratuito - ative no painel
- **Monitoramento**: Verifique logs regularmente em `php/logs/`
- **Atualizações**: Mantenha uma cópia local sempre atualizada
