const db = require('./database');
const fs = require('fs');

console.log('Exportando cadastro para CSV...');

db.all('SELECT * FROM pessoas ORDER BY nome', (err, pessoas) => {
    if (err) {
        console.error('Erro:', err);
        return;
    }
    
    console.log(`Encontradas ${pessoas.length} pessoas`);
    
    // Cabeçalho CSV
    let csv = 'ID,Nome,CPF,Nascimento,Religião,Cidade,Estado,Telefone,Email,Indicação,Data Cadastro\n';
    
    // Dados
    pessoas.forEach(pessoa => {
        const linha = [
            pessoa.id,
            `"${pessoa.nome || ''}"`,
            `"${pessoa.cpf || ''}"`,
            `"${pessoa.nascimento || ''}"`,
            `"${pessoa.religiao || ''}"`,
            `"${pessoa.cidade || ''}"`,
            `"${pessoa.estado || ''}"`,
            `"${pessoa.telefone || ''}"`,
            `"${pessoa.email || ''}"`,
            `"${pessoa.indicacao || ''}"`,
            `"${pessoa.created_at || ''}"`
        ].join(',');
        
        csv += linha + '\n';
    });
    
    // Salvar arquivo
    const nomeArquivo = `cadastro_completo_${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(nomeArquivo, csv, 'utf8');
    
    console.log(`✅ Arquivo gerado: ${nomeArquivo}`);
    console.log(`📊 Total de registros: ${pessoas.length}`);
});