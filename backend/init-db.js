const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'frequencia.db');
const db = new sqlite3.Database(dbPath);

console.log('Conectando ao banco de dados...');

// Configurações iniciais
db.serialize(() => {
    // Habilitar chaves estrangeiras
db.run('PRAGMA foreign_keys = ON');
    
    // Criar tabelas
    const tables = [
        `CREATE TABLE IF NOT EXISTS pessoas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT,
            nascimento DATE,
            religiao TEXT,
            cidade TEXT,
            estado TEXT,
            telefone TEXT,
            email TEXT,
            indicacao TEXT,
            observacao TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS frequencias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pessoa_id INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            numero_senha INTEGER NOT NULL,
            data DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pessoa_id) REFERENCES pessoas (id)
        )`,
        
        `CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('geral', 'responsavel', 'administrador')),
            pessoa_id INTEGER,
            ativo INTEGER DEFAULT 1,
            deve_trocar_senha INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pessoa_id) REFERENCES pessoas (id)
        )`,
        
        `CREATE TABLE IF NOT EXISTS sessoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            token TEXT NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        )`
    ];

    // Executar cada comando de criação de tabela
    tables.forEach((sql, index) => {
        db.run(sql, (err) => {
            if (err) {
                console.error(`Erro ao criar tabela ${index + 1}:`, err.message);
            } else {
                console.log(`Tabela ${index + 1} verificada/criada com sucesso`);
            }
        });
    });

    // Verificar se existe um usuário administrador
    db.get("SELECT * FROM usuarios WHERE tipo = 'administrador' LIMIT 1", (err, row) => {
        if (err) {
            console.error('Erro ao verificar usuário administrador:', err.message);
        } else if (!row) {
            const bcrypt = require('bcrypt');
            const senhaPadrao = 'admin123';
            
            bcrypt.hash(senhaPadrao, 10, (err, hash) => {
                if (err) {
                    console.error('Erro ao criar hash da senha:', err);
                    return;
                }
                
                const adminUser = {
                    nome: 'Administrador',
                    email: 'admin@terradobugio.com.br',
                    senha: hash,
                    tipo: 'administrador',
                    ativo: 1
                };
                
                db.run(
                    'INSERT INTO usuarios (nome, email, senha, tipo, ativo) VALUES (?, ?, ?, ?, ?)',
                    [adminUser.nome, adminUser.email, adminUser.senha, adminUser.tipo, adminUser.ativo],
                    function(err) {
                        if (err) {
                            console.error('Erro ao criar usuário administrador:', err.message);
                        } else {
                            console.log('Usuário administrador criado com sucesso!');
                            console.log('Email: admin@terradobugio.com.br');
                            console.log('Senha: admin123');
                            console.log('Por favor, altere esta senha no primeiro acesso!');
                        }
                        
                        // Fechar a conexão com o banco de dados
                        db.close((err) => {
                            if (err) {
                                console.error('Erro ao fechar conexão com o banco de dados:', err.message);
                            } else {
                                console.log('Conexão com o banco de dados fechada com sucesso!');
                            }
                        });
                    }
                );
            });
        } else {
            console.log('Usuário administrador já existe no banco de dados.');
            // Fechar a conexão com o banco de dados
            db.close((err) => {
                if (err) {
                    console.error('Erro ao fechar conexão com o banco de dados:', err.message);
                } else {
                    console.log('Conexão com o banco de dados fechada com sucesso!');
                }
            });
        }
    });
});
