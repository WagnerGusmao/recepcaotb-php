# 🚀 Deploy Rápido - Resumo

## ⚡ 3 Passos para Deploy

### 1️⃣ Preparar Pacote
```bash
preparar_deploy.bat
```
**Resultado**: Arquivo `recepcaotb_hostinger.zip` criado

### 2️⃣ Upload no Hostinger
1. Acesse: https://hpanel.hostinger.com/
2. File Manager → public_html/
3. Upload e extrair `recepcaotb_hostinger.zip`

### 3️⃣ Importar Banco de Dados
1. phpMyAdmin → Banco: `u746854799_tbrecepcao`
2. Importar arquivo `.sql` incluído no ZIP
3. Pronto! ✅

---

## 🔗 Links Rápidos

| Item | Link |
|------|------|
| **Sistema** | https://ivory-worm-865052.hostingersite.com/ |
| **Login Admin** | admin@terradobugio.com / Admin@123 |
| **hPanel** | https://hpanel.hostinger.com/ |
| **Docs Completa** | [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md) |
| **Checklist** | [CHECKLIST_DEPLOY.md](CHECKLIST_DEPLOY.md) |

---

## 🗄️ Credenciais Banco

```
Host: localhost
DB:   u746854799_tbrecepcao
User: u746854799_recepcaotb
Pass: TBrecepcao@1
```

---

## ✅ Teste Rápido

1. Abrir: https://ivory-worm-865052.hostingersite.com/
2. Login com admin@terradobugio.com
3. Verificar se painel carrega
4. Testar cadastro de pessoa
5. Testar registro de frequência

---

## 📞 Ajuda Rápida

**Erro de Conexão?**
→ Verificar credenciais no `.env`

**API 404?**
→ Verificar `.htaccess` presente

**Não faz login?**
→ Verificar se banco foi importado

**Mais ajuda?**
→ Ver [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md)

---

## 🎯 Status

- ✅ Arquivos preparados
- ✅ Credenciais configuradas  
- ✅ Documentação completa
- ⏳ Aguardando upload e teste

**Tempo estimado**: 15-20 minutos
