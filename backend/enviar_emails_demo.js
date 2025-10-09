const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

// Simulador de nodemailer para demonstração
const nodemailer = {
    createTransport: (config) => ({
        sendMail: async (options) => {
            // Simula envio de email
            console.log(`📧 ENVIANDO EMAIL:`);
            console.log(`   De: ${options.from}`);
            console.log(`   Para: ${options.to}`);
            console.log(`   Assunto: ${options.subject}`);
            console.log(`   ✅ Email enviado com sucesso!\n`);
            
            // Simula delay de envio
            await new Promise(resolve => setTimeout(resolve, 100));
            return { messageId: 'demo-' + Date.now() };
        }
    })
};

function enviarEmails(mes, ano) {
    const mesNome = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ][mes - 1];
    
    console.log(`📧 ENVIANDO emails para ${mesNome}/${ano}...\n`);
    
    // Configuração demo do email
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'sistema@exemplo.com',
            pass: 'senha-demo'
        }
    });
    
    const sql = `
        SELECT DISTINCT p.nome, p.email, COUNT(f.id) as total_frequencias
        FROM pessoas p
        JOIN frequencias f ON p.id = f.pessoa_id
        WHERE strftime('%m', f.data) = ? 
        AND strftime('%Y', f.data) = ?
        AND p.email IS NOT NULL 
        AND p.email != ''
        AND p.email != '0'
        GROUP BY p.id, p.nome, p.email
        ORDER BY p.nome
        LIMIT 5
    `;
    
    const mesFormatado = mes.toString().padStart(2, '0');
    
    db.all(sql, [mesFormatado, ano.toString()], async (err, pessoas) => {
        if (err) {
            console.error('❌ Erro:', err.message);
            return;
        }
        
        console.log(`👥 Enviando para ${pessoas.length} pessoas (demo - primeiras 5):\n`);
        
        let enviados = 0;
        let erros = 0;
        
        for (const pessoa of pessoas) {
            try {
                const mailOptions = {
                    from: 'sistema@exemplo.com',
                    to: pessoa.email,
                    subject: `Confirmação de Frequência - ${mesNome}/${ano}`,
                    html: `
                        <h2>Olá, ${pessoa.nome}!</h2>
                        <p>Confirmamos sua frequência no mês de <strong>${mesNome}/${ano}</strong>.</p>
                        <p><strong>Total de presenças:</strong> ${pessoa.total_frequencias}</p>
                        <br>
                        <p>Obrigado por sua participação!</p>
                        <p><em>Sistema de Frequência</em></p>
                    `
                };
                
                await transporter.sendMail(mailOptions);
                enviados++;
                
            } catch (error) {
                console.error(`❌ Erro ao enviar para ${pessoa.nome}: ${error.message}`);
                erros++;
            }
        }
        
        console.log(`📊 RESUMO DO ENVIO:`);
        console.log(`✅ Emails enviados: ${enviados}`);
        console.log(`❌ Erros: ${erros}`);
        console.log(`📧 Total processado: ${pessoas.length}`);
        console.log(`\n💡 Esta foi uma demonstração com as primeiras 5 pessoas`);
        console.log(`💡 Para envio real completo, configure nodemailer e execute enviar_emails.js`);
        
        db.close();
    });
}

const mes = parseInt(process.argv[2]);
const ano = parseInt(process.argv[3]) || new Date().getFullYear();

if (!mes || mes < 1 || mes > 12) {
    console.log('❌ Uso: node enviar_emails_demo.js <mes> [ano]');
    console.log('Exemplo: node enviar_emails_demo.js 1 2025');
    process.exit(1);
}

enviarEmails(mes, ano);