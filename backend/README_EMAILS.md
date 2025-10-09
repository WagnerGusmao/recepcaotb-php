# Sistema de Envio de Emails

## 📧 Configuração

### 1. Instalar dependência
```bash
npm install nodemailer
```

### 2. Configurar email
Edite o arquivo `config_email.js`:
- Escolha o provedor (gmail, outlook, yahoo)
- Configure seu email e senha
- Para Gmail: use senha de app (não a senha normal)

### 3. Como obter senha de app do Gmail
1. Acesse: https://myaccount.google.com/security
2. Ative a verificação em 2 etapas
3. Vá em "Senhas de app"
4. Gere uma senha para "Email"
5. Use essa senha no config_email.js

## 🚀 Como usar

### Listar emails do mês (antes de enviar)
```bash
node listar_emails_mes.js 1 2025    # Janeiro 2025
node listar_emails_mes.js 12         # Dezembro ano atual
```

### Enviar emails
```bash
node enviar_emails.js 1 2025        # Janeiro 2025
node enviar_emails.js 12             # Dezembro ano atual
```

## 📊 O que faz

1. **Busca pessoas** com frequência no mês especificado
2. **Filtra apenas** quem tem email cadastrado
3. **Envia email** personalizado com:
   - Nome da pessoa
   - Mês/ano da frequência
   - Total de presenças no mês
4. **Relatório** de envios (sucessos e erros)

## ⚠️ Importante

- Teste primeiro com poucos emails
- Respeite limites do provedor (Gmail: 500/dia)
- Use delay entre envios (já configurado: 1 segundo)
- Verifique se emails não vão para spam

## 📝 Template do Email

O email enviado contém:
- Saudação personalizada
- Confirmação da frequência do mês
- Total de presenças
- Assinatura do sistema

Personalize o template em `config_email.js`.