const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

function simularEnvioEmails(mes, ano) {
    const mesNome = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ][mes - 1];
    
    console.log(`📧 SIMULANDO envio de emails para ${mesNome}/${ano}...\n`);
    
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
    
    db.all(sql, [mesFormatado, ano.toString()], (err, pessoas) => {
        if (err) {
            console.error('❌ Erro:', err.message);
            return;
        }
        
        console.log(`👥 ${pessoas.length} pessoas receberiam emails:\n`);
        
        pessoas.forEach((pessoa, index) => {
            console.log(`${index + 1}. 📧 ${pessoa.nome}`);
            console.log(`   📩 Para: ${pessoa.email}`);
            console.log(`   📊 Presenças: ${pessoa.total_frequencias}`);
            console.log(`   📝 Assunto: Confirmação de Frequência - ${mesNome}/${ano}`);
            console.log(`   ✅ Email simulado enviado!\n`);
        });
        
        console.log(`📊 RESUMO DA SIMULAÇÃO:`);
        console.log(`📧 Total de emails que seriam enviados: ${pessoas.length}`);
        console.log(`📅 Mês/Ano: ${mesNome}/${ano}`);
        console.log(`\n💡 Para envio real, instale: npm install nodemailer`);
        console.log(`💡 Configure suas credenciais em config_email.js`);
        console.log(`💡 Execute: node enviar_emails.js ${mes} ${ano}`);
        
        db.close();
    });
}

const mes = parseInt(process.argv[2]);
const ano = parseInt(process.argv[3]) || new Date().getFullYear();

if (!mes || mes < 1 || mes > 12) {
    console.log('❌ Uso: node simular_envio_emails.js <mes> [ano]');
    console.log('Exemplo: node simular_envio_emails.js 1 2025');
    process.exit(1);
}

simularEnvioEmails(mes, ano);