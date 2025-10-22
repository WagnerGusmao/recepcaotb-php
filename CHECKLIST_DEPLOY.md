# ✅ Checklist de Deploy - Hostinger

**URL Destino**: https://ivory-worm-865052.hostingersite.com/  
**Data**: ___/___/2025

---

## 📋 Preparação Local

- [ ] **1. Executar limpeza do projeto**
  - Script executado: `LIMPEZA_PROJETO.md`
  - Arquivos desnecessários removidos ✓

- [ ] **2. Verificar configurações**
  - Arquivo `.env.production` criado com credenciais Hostinger
  - Credenciais do banco verificadas
  - JWT Secret configurado

- [ ] **3. Gerar pacote de deploy**
  - Executar: `preparar_deploy.bat`
  - Arquivo ZIP criado: `recepcaotb_hostinger.zip`

- [ ] **4. Testar localmente antes do deploy**
  - Sistema funciona localmente
  - Login funciona
  - APIs respondem corretamente

---

## 📤 Upload para Hostinger

- [ ] **1. Acesso ao painel**
  - Login no hPanel do Hostinger realizado
  - File Manager acessado

- [ ] **2. Upload dos arquivos**
  - Navegado até `public_html/`
  - Upload do arquivo ZIP realizado
  - Arquivo extraído com sucesso
  - Arquivo ZIP deletado após extração

- [ ] **3. Verificar estrutura de arquivos**
  - ✓ index.html na raiz
  - ✓ login.html na raiz
  - ✓ Pasta `php/` presente
  - ✓ Pasta `css/` presente
  - ✓ Pasta `js/` presente
  - ✓ Arquivo `.env` na raiz
  - ✓ Arquivo `.htaccess` na raiz
  - ✓ Arquivo `php/.htaccess` presente

---

## 🗄️ Configuração do Banco de Dados

- [ ] **1. Acesso ao phpMyAdmin**
  - phpMyAdmin acessado via hPanel
  - Banco `u746854799_tbrecepcao` selecionado

- [ ] **2. Importar backup**
  - Arquivo SQL localizado (mais recente)
  - Import iniciado
  - Import concluído sem erros

- [ ] **3. Verificar tabelas criadas**
  - [ ] Tabela `usuarios` existe
  - [ ] Tabela `pessoas` existe
  - [ ] Tabela `frequencias` existe
  - [ ] Tabela `voluntarios` existe
  - [ ] Tabela `frequencia_voluntarios` existe
  - [ ] Tabela `sessoes` existe
  - [ ] Tabela `rate_limits` existe

- [ ] **4. Verificar usuário admin**
  - Usuário `admin@terradobugio.com` existe
  - Senha: `Admin@123`

---

## 🔧 Configuração de Permissões

- [ ] **Ajustar permissões no File Manager**
  - `php/logs/` → 755
  - `php/backups/` → 755
  - `.env` → 644
  - `.htaccess` → 644
  - `php/.htaccess` → 644

---

## ✅ Testes Pós-Deploy

### 1. Testes Básicos

- [ ] **Acessar página principal**
  - URL: https://ivory-worm-865052.hostingersite.com/
  - Página carrega corretamente
  - Sem erros no console

- [ ] **Testar página de login**
  - URL: https://ivory-worm-865052.hostingersite.com/login.html
  - Formulário exibido corretamente
  - CSS carregado

### 2. Teste de Login

- [ ] **Login com usuário admin**
  - Email: admin@terradobugio.com
  - Senha: Admin@123
  - Login bem-sucedido
  - Redirecionado para painel

- [ ] **Verificar sessão**
  - Token JWT gerado
  - Sessão mantida após reload

### 3. Testes de APIs

- [ ] **API de Autenticação**
  - Endpoint: `/api/auth`
  - Responde corretamente

- [ ] **API de Pessoas**
  - Endpoint: `/api/pessoas`
  - Lista de pessoas carrega
  - Pode adicionar nova pessoa

- [ ] **API de Frequências**
  - Endpoint: `/api/frequencias`
  - Lista de frequências carrega
  - Pode registrar nova frequência

- [ ] **API de Voluntários**
  - Endpoint: `/api/voluntarios`
  - Lista de voluntários carrega
  - Pode adicionar/editar voluntário

- [ ] **API de Usuários**
  - Endpoint: `/api/usuarios`
  - Lista de usuários carrega (admin/líder)
  - Permissões funcionando

### 4. Funcionalidades Principais

- [ ] **Registro de Frequência**
  - Busca de pessoas funciona
  - Registra frequência com sucesso
  - QR Code gera corretamente

- [ ] **Gestão de Voluntários**
  - Lista voluntários
  - Adiciona voluntário
  - Edita voluntário
  - Busca automática de pessoas funciona

- [ ] **Gestão de Usuários (Admin)**
  - Lista usuários
  - Cria novo usuário
  - Edita permissões
  - Deleta usuário

- [ ] **Trocar Senha**
  - Página de trocar senha funciona
  - Senha alterada com sucesso

---

## 🔒 Segurança

- [ ] **Proteção de arquivos**
  - `.env` não acessível via web
  - Arquivos `.log` protegidos
  - Pasta `php/config/` protegida

- [ ] **SSL/HTTPS**
  - Certificado SSL ativo
  - Site redireciona para HTTPS

- [ ] **JWT Secret**
  - JWT_SECRET alterado para produção
  - Chave forte e única

- [ ] **Remover arquivos de setup (opcional)**
  - `create_admin.php` removido ou protegido
  - `setup_tables.php` removido ou protegido

---

## 📊 Monitoramento

- [ ] **Verificar logs**
  - Arquivo `php/logs/app.log` existe
  - Logs sendo escritos corretamente
  - Sem erros críticos

- [ ] **Configurar backups automáticos**
  - Backup diário configurado no hPanel
  - Retenção de backups definida

---

## 🐛 Troubleshooting (se necessário)

### Problemas Encontrados:

| Problema | Solução Aplicada | Status |
|----------|------------------|--------|
|          |                  |        |
|          |                  |        |
|          |                  |        |

---

## 📝 Notas Finais

### Informações de Acesso:

**Produção**
- URL: https://ivory-worm-865052.hostingersite.com/
- Admin: admin@terradobugio.com
- Senha: Admin@123

**Banco de Dados**
- Host: localhost
- Database: u746854799_tbrecepcao
- Usuário: u746854799_recepcaotb

### Observações:
```
[Adicione aqui quaisquer observações relevantes do deploy]
```

---

## ✅ Deploy Concluído

- [ ] **Todos os testes passaram**
- [ ] **Sistema funcionando em produção**
- [ ] **Documentação atualizada**
- [ ] **Cliente notificado**

**Data de Conclusão**: ___/___/2025  
**Responsável**: _________________  
**Status**: 🟢 Operacional

---

## 📞 Suporte

Para problemas ou dúvidas:
- Documentação completa: `DEPLOY_HOSTINGER.md`
- Guia do usuário: `GUIA_USUARIO.md`
- API Reference: `API_REFERENCE.md`
