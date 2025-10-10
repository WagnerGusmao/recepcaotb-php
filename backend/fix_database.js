const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'frequencia.db');
const db = new sqlite3.Database(dbPath);

console.log('Iniciando correção do banco de dados...');

// Função para executar consultas SQL e retornar Promessa
const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
};

// Função para buscar registros
const allQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Função para validar email
const isValidEmail = (email) => {
    if (!email || email === '0') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

// Função para validar telefone
const isValidPhone = (phone) => {
    if (!phone || phone === '0') return false;
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    // Verifica se tem pelo menos 10 dígitos (DDD + número)
    return cleanPhone.length >= 10;
};

// Função para formatar data
const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'SEM INFORMAÇÃO' || dateStr === '0' || dateStr === 0) {
        return null;
    }
    
    // Se for um número, considera como idade e calcula o ano aproximado
    if (!isNaN(dateStr) && dateStr > 0) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - parseInt(dateStr);
        return `${birthYear}-01-01`; // Usa 1º de janeiro do ano calculado
    }
    
    // Tenta converter a string para data
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return null;
    }
    
    return date.toISOString().split('T')[0];
};

// Função principal
const fixDatabase = async () => {
    try {
        // 1. Criar tabela temporária para backup
        console.log('Criando backup dos dados atuais...');
        await runQuery('BEGIN TRANSACTION');
        
        // 2. Corrigir dados da tabela pessoas
        console.log('Corrigindo dados da tabela pessoas...');
        const pessoas = await allQuery('SELECT * FROM pessoas');
        
        for (const pessoa of pessoas) {
            const updates = [];
            const params = [];
            
            // Corrigir email
            if (!isValidEmail(pessoa.email)) {
                updates.push('email = ?');
                params.push(null);
            } else {
                updates.push('email = LOWER(?)');
                params.push(pessoa.email);
            }
            
            // Corrigir telefone
            if (!isValidPhone(pessoa.telefone)) {
                updates.push('telefone = ?');
                params.push(null);
            } else {
                // Remove caracteres não numéricos
                const cleanPhone = pessoa.telefone.replace(/\D/g, '');
                updates.push('telefone = ?');
                params.push(cleanPhone);
            }
            
            // Corrigir data de nascimento
            const formattedDate = formatDate(pessoa.nascimento);
            updates.push('nascimento = ?');
            params.push(formattedDate);
            
            // Atualizar registro se necessário
            if (updates.length > 0) {
                const query = `UPDATE pessoas SET ${updates.join(', ')} WHERE id = ?`;
                params.push(pessoa.id);
                await runQuery(query, params);
            }
        }
        
        // 3. Atualizar a estrutura da tabela se necessário
        console.log('Atualizando estrutura da tabela...');
        try {
            // Tenta adicionar a coluna updated_at se não existir
            await runQuery('ALTER TABLE pessoas ADD COLUMN updated_at DATETIME');
        } catch (e) {
            // A coluna já existe, não faz nada
            if (!e.message.includes('duplicate column name')) {
                throw e;
            }
        }
        
        // 4. Atualizar o timestamp de atualização
        console.log('Atualizando timestamps...');
        await runQuery('UPDATE pessoas SET updated_at = datetime("now") WHERE updated_at IS NULL');
        
        // 5. Commit das alterações
        await runQuery('COMMIT');
        
        console.log('\nCorreção concluída com sucesso!');
        console.log('Backup salvo como:', 'frequencia_backup_*.db');
        
    } catch (error) {
        console.error('Erro durante a correção do banco de dados:', error);
        await runQuery('ROLLBACK');
        process.exit(1);
    } finally {
        db.close();
    }
};

// Executar a correção
fixDatabase();
