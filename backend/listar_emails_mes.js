const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

function listarEmailsMes(mes, ano) {
    const mesNome = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ][mes - 1];
    
    console.log(`📋 Listando pessoas com frequência em ${mesNome}/${ano}...\n`);
    
    const sql = `
        SELECT DISTINCT p.nome, p.email, COUNT(f.id) as total_frequencias
        FROM pessoas p
        JOIN frequencias f ON p.id = f.pessoa_id
        WHERE strftime('%m', f.data) = ? 
        AND strftime('%Y', f.data) = ?
        GROUP BY p.id, p.nome, p.email
        ORDER BY p.nome
    `;
    
    const mesFormatado = mes.toString().padStart(2, '0');
    
    db.all(sql, [mesFormatado, ano.toString()], (err, pessoas) => {
        if (err) {
            console.error('❌ Erro:', err.message);
            return;
        }
        
        console.log(`👥 Total: ${pessoas.length} pessoas\n`);
        
        let comEmail = 0;
        let semEmail = 0;
        
        pessoas.forEach((pessoa, index) => {
            const temEmail = pessoa.email && pessoa.email.trim() !== '';
            const status = temEmail ? '✅' : '❌';
            const email = temEmail ? pessoa.email : 'SEM EMAIL';
            
            console.log(`${index + 1}. ${status} ${pessoa.nome} - ${email} (${pessoa.total_frequencias} presenças)`);
            
            if (temEmail) comEmail++;
            else semEmail++;
        });
        
        console.log(`\n📊 RESUMO:`);
        console.log(`✅ Com email: ${comEmail}`);
        console.log(`❌ Sem email: ${semEmail}`);
        console.log(`📧 Emails que receberão: ${comEmail}`);
        
        db.close();
    });
}

const mes = parseInt(process.argv[2]);
const ano = parseInt(process.argv[3]) || new Date().getFullYear();

if (!mes || mes < 1 || mes > 12) {
    console.log('❌ Uso: node listar_emails_mes.js <mes> [ano]');
    console.log('Exemplo: node listar_emails_mes.js 1 2025 (para Janeiro/2025)');
    process.exit(1);
}

listarEmailsMes(mes, ano);