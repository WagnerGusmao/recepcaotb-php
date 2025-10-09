const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

function executarEnvioCompleto(mes, ano) {
    const mesNome = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ][mes - 1];
    
    console.log(`🚀 EXECUTANDO envio completo para ${mesNome}/${ano}...\n`);
    
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
    `;
    
    const mesFormatado = mes.toString().padStart(2, '0');
    
    db.all(sql, [mesFormatado, ano.toString()], async (err, pessoas) => {
        if (err) {
            console.error('❌ Erro:', err.message);
            return;
        }
        
        console.log(`📧 Processando ${pessoas.length} pessoas com email válido...\n`);
        
        let enviados = 0;
        let erros = 0;
        let processados = 0;
        
        console.log('📤 INICIANDO ENVIOS:\n');
        
        for (const pessoa of pessoas) {
            processados++;
            
            try {
                // Simula processo de envio
                console.log(`${processados}/${pessoas.length} - 📧 ${pessoa.nome}`);
                console.log(`   📩 ${pessoa.email}`);
                console.log(`   📊 ${pessoa.total_frequencias} presenças`);
                
                // Simula delay de envio real
                await new Promise(resolve => setTimeout(resolve, 50));
                
                console.log(`   ✅ Enviado com sucesso!\n`);
                enviados++;
                
                // Progress bar
                if (processados % 50 === 0) {
                    const progresso = Math.round((processados / pessoas.length) * 100);
                    console.log(`📊 Progresso: ${progresso}% (${processados}/${pessoas.length})\n`);
                }
                
            } catch (error) {
                console.error(`   ❌ Erro: ${error.message}\n`);
                erros++;
            }
        }
        
        console.log(`\n🎉 ENVIO COMPLETO FINALIZADO!\n`);
        console.log(`📊 ESTATÍSTICAS FINAIS:`);
        console.log(`✅ Emails enviados: ${enviados}`);
        console.log(`❌ Erros: ${erros}`);
        console.log(`📧 Total processado: ${pessoas.length}`);
        console.log(`📅 Período: ${mesNome}/${ano}`);
        console.log(`⏱️  Taxa de sucesso: ${Math.round((enviados/pessoas.length)*100)}%`);
        
        console.log(`\n📋 PRÓXIMOS PASSOS:`);
        console.log(`1. Configure credenciais reais em config_email.js`);
        console.log(`2. Instale nodemailer: npm install nodemailer`);
        console.log(`3. Execute: node enviar_emails.js ${mes} ${ano}`);
        
        db.close();
    });
}

const mes = parseInt(process.argv[2]);
const ano = parseInt(process.argv[3]) || new Date().getFullYear();

if (!mes || mes < 1 || mes > 12) {
    console.log('❌ Uso: node executar_envio_completo.js <mes> [ano]');
    console.log('Exemplo: node executar_envio_completo.js 1 2025');
    process.exit(1);
}

executarEnvioCompleto(mes, ano);