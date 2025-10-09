// Configurações de email - EDITE ESTE ARQUIVO
module.exports = {
    // Gmail
    gmail: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'seu-email@gmail.com',
            pass: 'sua-senha-de-app' // Use senha de app, não a senha normal
        }
    },
    
    // Outlook/Hotmail
    outlook: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
            user: 'seu-email@outlook.com',
            pass: 'sua-senha'
        }
    },
    
    // Yahoo
    yahoo: {
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        auth: {
            user: 'seu-email@yahoo.com',
            pass: 'sua-senha-de-app'
        }
    },
    
    // Configuração ativa (mude para gmail, outlook ou yahoo)
    ativo: 'gmail',
    
    // Email remetente
    remetente: 'seu-email@gmail.com',
    
    // Template do email
    template: {
        assunto: 'Confirmação de Frequência - {mes}/{ano}',
        corpo: `
            <h2>Olá, {nome}!</h2>
            <p>Confirmamos sua frequência no mês de <strong>{mes}/{ano}</strong>.</p>
            <p><strong>Total de presenças:</strong> {total}</p>
            <br>
            <p>Obrigado por sua participação!</p>
            <p><em>Sistema de Frequência</em></p>
        `
    }
};