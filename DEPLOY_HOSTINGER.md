# 🚀 Guia de Deploy no Hostinger - Sistema recepcaotb

## 📋 Pré-requisitos

### 1. **Conta Hostinger Configurada**
- Plano com suporte a PHP 8.0+
- Banco de dados MySQL disponível
- Acesso ao painel de controle

### 2. **Informações Necessárias**
- **Host do banco**: localhost (geralmente)
- **Nome do banco**: u123456789_recepcaotb
- **Usuário**: u123456789_admin
- **Senha**: (definida no painel)

## 🗂️ Estrutura de Arquivos para Upload

```
public_html/
├── index.html
├── login.html
├── painel-simples.html
├── trocar-senha.html
├── .htaccess (renomear de .htaccess.hostinger)
├── .env (renomear de .env.hostinger e configurar)
├── css/
├── js/
├── imagem/
├── php/
│   ├── api/
│   ├── classes/
│   ├── config/
│   └── vendor/ (após composer install)
└── exports/
```

## 📊 Passo a Passo do Deploy

### **Passo 1: Preparar Banco de Dados**

1. **Acesse o painel Hostinger**
2. **Vá em "Banco de Dados MySQL"**
3. **Crie um novo banco**: `u123456789_recepcaotb`
4. **Crie um usuário**: `u123456789_admin`
5. **Anote as credenciais**

### **Passo 2: Importar Dados**

1. **Acesse phpMyAdmin no Hostinger**
2. **Selecione o banco criado**
3. **Importe o arquivo**: `exports/recepcaotb_EXPORT_COMPLETO_2025-10-18_12-27-48.sql`
4. **Aguarde a importação** (2-5 minutos)

### **Passo 3: Configurar Arquivos**

1. **Renomeie os arquivos**:
   ```bash
   .env.hostinger → .env
   .htaccess.hostinger → .htaccess
   ```

2. **Edite o arquivo .env**:
   ```env
   DB_HOST=localhost
   DB_NAME=u123456789_recepcaotb
   DB_USER=u123456789_admin
   DB_PASS=sua_senha_real
   APP_URL=https://seudominio.com
   ```

### **Passo 4: Upload dos Arquivos**

1. **Conecte via FTP/File Manager**
2. **Navegue para public_html/**
3. **Faça upload de todos os arquivos**
4. **Mantenha a estrutura de pastas**

### **Passo 5: Instalar Dependências**

1. **Acesse Terminal SSH** (se disponível)
2. **Navegue para a pasta do projeto**:
   ```bash
   cd public_html/php
   composer install --no-dev --optimize-autoloader
   ```

3. **Ou faça upload da pasta vendor/** já configurada

### **Passo 6: Configurar Permissões**

1. **Defina permissões**:
   - Pastas: 755
   - Arquivos: 644
   - .env: 600 (mais restritivo)

## 🔧 Configurações Específicas do Hostinger

### **PHP.ini Personalizado** (se necessário)
```ini
memory_limit = 256M
max_execution_time = 300
upload_max_filesize = 50M
post_max_size = 50M
max_input_vars = 3000
date.timezone = "America/Sao_Paulo"
```

### **Extensões PHP Necessárias**
- ✅ PDO
- ✅ pdo_mysql
- ✅ json
- ✅ openssl
- ✅ mbstring
- ✅ xml
- ✅ curl
- ⚠️ zip (verificar se está habilitada)

## 🌐 URLs de Acesso

Após o deploy:
- **Site**: https://seudominio.com
- **Login**: https://seudominio.com/login.html
- **Painel**: https://seudominio.com/painel-simples.html
- **APIs**: https://seudominio.com/api/*

## 🔐 Credenciais de Acesso

- **Email**: admin@terradobugio.com
- **Senha**: admin123
- **Tipo**: Administrador

## ✅ Checklist Final

- [ ] Banco de dados criado e importado
- [ ] Arquivo .env configurado com credenciais corretas
- [ ] Arquivo .htaccess renomeado e no lugar
- [ ] Todos os arquivos enviados via FTP
- [ ] Dependências do Composer instaladas
- [ ] Permissões de arquivos configuradas
- [ ] Site acessível via navegador
- [ ] Login funcionando
- [ ] APIs respondendo corretamente

## 🆘 Solução de Problemas

### **Erro 500 - Internal Server Error**
1. Verifique o arquivo .htaccess
2. Confirme permissões dos arquivos
3. Verifique logs de erro do servidor

### **Erro de Conexão com Banco**
1. Confirme credenciais no .env
2. Verifique se o banco foi importado
3. Teste conexão via phpMyAdmin

### **APIs não funcionam**
1. Verifique se mod_rewrite está habilitado
2. Confirme regras do .htaccess
3. Teste URLs diretamente

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs de erro do Hostinger
2. Teste localmente primeiro
3. Confirme versão PHP (≥ 8.0)
4. Verifique extensões PHP disponíveis

---

**Sistema pronto para produção no Hostinger!** 🎉
