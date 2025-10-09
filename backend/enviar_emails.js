const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const config = require('./config_email');

const db = new sqlite3.Database('./frequencia.db');

// Configuração do email
const emailConfig = config[config.ativo];
const transporter = nodemailer.createTransport(emailConfig);

function enviarEmails(mes, ano) {
    const mesNome = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ][mes - 1];
    
    console.log(`📧 Buscando pessoas com frequência em ${mesNome}/${ano}...`);
    
    const sql = `
        SELECT DISTINCT p.nome, p.email, COUNT(f.id) as total_frequencias
        FROM pessoas p
        JOIN frequencias f ON p.id = f.pessoa_id
        WHERE strftime('%m', f.data) = ? 
        AND strftime('%Y', f.data) = ?
        AND p.email IS NOT NULL 
        AND p.email != ''
        GROUP BY p.id, p.nome, p.email
        ORDER BY p.nome
    `;
    
    const mesFormatado = mes.toString().padStart(2, '0');
    
    db.all(sql, [mesFormatado, ano.toString()], async (err, pessoas) => {
        if (err) {
            console.error('❌ Erro ao buscar pessoas:', err.message);
            return;
        }
        
        console.log(`👥 Encontradas ${pessoas.length} pessoas com email e frequência no mês`);
        
        if (pessoas.length === 0) {
            console.log('❌ Nenhuma pessoa encontrada para envio');
            db.close();
            return;
        }
        
        let enviados = 0;
        let erros = 0;
        
        for (const pessoa of pessoas) {
            try {
                const assunto = config.template.assunto
                    .replace('{mes}', mesNome)
                    .replace('{ano}', ano);
                    
                const corpo = config.template.corpo
                    .replace('{nome}', pessoa.nome)
                    .replace('{mes}', mesNome)
                    .replace('{ano}', ano)
                    .replace('{total}', pessoa.total_frequencias);
                
                const mailOptions = {
                    from: config.remetente,
                    to: pessoa.email,
                    subject: assunto,
                    html: corpo
                };
                
                await transporter.sendMail(mailOptions);
                console.log(`✅ Email enviado para: ${pessoa.nome} (${pessoa.email})`);
                enviados++;
                
                // Delay entre emails para evitar spam
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ Erro ao enviar para ${pessoa.nome}: ${error.message}`);
                erros++;
            }
        }
        
        console.log(`\n📊 RESUMO DO ENVIO:`);
        console.log(`✅ Emails enviados: ${enviados}`);
        console.log(`❌ Erros: ${erros}`);
        console.log(`📧 Total processado: ${pessoas.length}`);
        
        db.close();
    });
}

// Parâmetros da linha de comando
const mes = parseInt(process.argv[2]);
const ano = parseInt(process.argv[3]) || new Date().getFullYear();

if (!mes || mes < 1 || mes > 12) {
    console.log('❌ Uso: node enviar_emails.js <mes> [ano]');
    console.log('Exemplo: node enviar_emails.js 1 2025 (para Janeiro/2025)');
    process.exit(1);
}

enviarEmails(mes, ano);