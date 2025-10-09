const db = require('./database');
const fs = require('fs');

console.log('Exportando cadastro para XLS...');

db.all('SELECT * FROM pessoas ORDER BY nome', (err, pessoas) => {
    if (err) {
        console.error('Erro:', err);
        return;
    }
    
    console.log(`Encontradas ${pessoas.length} pessoas`);
    
    // Criar XML do Excel
    let xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="Cadastro">
<Table>
<Row>
<Cell><Data ss:Type="String">ID</Data></Cell>
<Cell><Data ss:Type="String">Nome</Data></Cell>
<Cell><Data ss:Type="String">CPF</Data></Cell>
<Cell><Data ss:Type="String">Nascimento</Data></Cell>
<Cell><Data ss:Type="String">Religião</Data></Cell>
<Cell><Data ss:Type="String">Cidade</Data></Cell>
<Cell><Data ss:Type="String">Estado</Data></Cell>
<Cell><Data ss:Type="String">Telefone</Data></Cell>
<Cell><Data ss:Type="String">Email</Data></Cell>
<Cell><Data ss:Type="String">Indicação</Data></Cell>
<Cell><Data ss:Type="String">Data Cadastro</Data></Cell>
</Row>`;
    
    // Dados
    pessoas.forEach(pessoa => {
        xml += `
<Row>
<Cell><Data ss:Type="Number">${pessoa.id}</Data></Cell>
<Cell><Data ss:Type="String">${pessoa.nome || ''}</Data></Cell>
<Cell><Data ss:Type="String">${pessoa.cpf || ''}</Data></Cell>
<Cell><Data ss:Type="String">${pessoa.nascimento || ''}</Data></Cell>
<Cell><Data ss:Type="String">${pessoa.religiao || ''}</Data></Cell>
<Cell><Data ss:Type="String">${pessoa.cidade || ''}</Data></Cell>
<Cell><Data ss:Type="String">${pessoa.estado || ''}</Data></Cell>
<Cell><Data ss:Type="String">${pessoa.telefone || ''}</Data></Cell>
<Cell><Data ss:Type="String">${pessoa.email || ''}</Data></Cell>
<Cell><Data ss:Type="String">${pessoa.indicacao || ''}</Data></Cell>
<Cell><Data ss:Type="String">${pessoa.created_at || ''}</Data></Cell>
</Row>`;
    });
    
    xml += `
</Table>
</Worksheet>
</Workbook>`;
    
    // Salvar arquivo
    const nomeArquivo = `cadastro_completo_${new Date().toISOString().split('T')[0]}.xls`;
    fs.writeFileSync(nomeArquivo, xml, 'utf8');
    
    console.log(`✅ Arquivo XLS gerado: ${nomeArquivo}`);
    console.log(`📊 Total de registros: ${pessoas.length}`);
});