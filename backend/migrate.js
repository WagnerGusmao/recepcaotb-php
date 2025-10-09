const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'frequencia.db');
const db = new sqlite3.Database(dbPath);

console.log('Iniciando migração do banco de dados...');

db.serialize(async () => {
    // Adicionar coluna observacao se não existir
    db.run(`ALTER TABLE pessoas ADD COLUMN observacao TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Erro ao adicionar coluna observacao:', err.message);
        } else if (!err) {
            console.log('✓ Coluna observacao adicionada à tabela pessoas');
        } else {
            console.log('✓ Coluna observacao já existe');
        }
    });

    // Verificar se já existe usuário admin
    db.get('SELECT * FROM usuarios WHERE email = ?', ['admin@terradobugio.com'], async (err, user) => {
        if (err) {
            console.error('Erro ao verificar usuário admin:', err);
            return;
        }

        if (!user) {
            try {
                // Criar senha hash para admin
                const senhaHash = await bcrypt.hash('admin123', 10);
                
                db.run(`INSERT INTO usuarios (nome, email, senha, tipo, ativo) 
                        VALUES (?, ?, ?, ?, ?)`,
                    ['Administrador', 'admin@terradobugio.com', senhaHash, 'administrador', 1],
                    function(err) {
                        if (err) {
                            console.error('Erro ao criar usuário admin:', err.message);
                        } else {
                            console.log('✓ Usuário administrador criado com sucesso!');
                            console.log('  Email: admin@terradobugio.com');
                            console.log('  Senha: admin123');
                            console.log('  IMPORTANTE: Altere esta senha após o primeiro login!');
                        }
                        db.close();
                    }
                );
            } catch (error) {
                console.error('Erro ao criar hash da senha:', error);
                db.close();
            }
        } else {
            console.log('✓ Usuário administrador já existe');
            db.close();
        }
    });
});

console.log('\nMigração concluída!');
