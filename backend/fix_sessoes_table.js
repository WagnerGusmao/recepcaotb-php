const db = require('./database');

async function fixSessoesTable() {
    try {
        console.log('Verificando estrutura da tabela sessoes...');
        
        // Verificar se as colunas existem
        const hasUserAgent = await db.schema.hasColumn('sessoes', 'user_agent');
        const hasIpAddress = await db.schema.hasColumn('sessoes', 'ip_address');
        
        console.log('user_agent existe:', hasUserAgent);
        console.log('ip_address existe:', hasIpAddress);
        
        if (!hasUserAgent || !hasIpAddress) {
            console.log('Adicionando colunas faltantes...');
            
            await db.schema.alterTable('sessoes', (table) => {
                if (!hasUserAgent) {
                    table.text('user_agent').nullable();
                }
                if (!hasIpAddress) {
                    table.string('ip_address', 45).nullable();
                }
            });
            
            console.log('✅ Colunas adicionadas com sucesso!');
        } else {
            console.log('✅ Tabela sessoes já possui todas as colunas necessárias');
        }
        
    } catch (error) {
        console.error('❌ Erro ao corrigir tabela sessoes:', error);
    } finally {
        process.exit();
    }
}

fixSessoesTable();
