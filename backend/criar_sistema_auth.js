const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./frequencia.db');

function criarSistemaAuth() {
    console.log('🔐 Criando sistema de autenticação...\n');
    
    // Criar tabela de usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo TEXT NOT NULL CHECK(tipo IN ('geral', 'responsavel', 'administrador')),
        ativo BOOLEAN DEFAULT 1,
        pessoa_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pessoa_id) REFERENCES pessoas (id)
    )`, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela usuarios:', err.message);
            return;
        }
        console.log('✅ Tabela usuarios criada');
        
        // Criar usuário administrador padrão (senha simples para demo)
        db.run(`INSERT OR IGNORE INTO usuarios (nome, email, senha, tipo) 
                VALUES (?, ?, ?, ?)`, 
                ['Wagner Gusmão', 'wagner@admin.com', 'admin123', 'administrador'], 
                function(err) {
                    if (err) {
                        console.error('❌ Erro ao criar admin:', err.message);
                        return;
                    }
                    console.log('✅ Usuário administrador criado');
                    console.log('📧 Email: wagner@admin.com');
                    console.log('🔑 Senha: admin123');
                });
    });
    
    // Criar tabela de sessões
    db.run(`CREATE TABLE IF NOT EXISTS sessoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )`, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela sessoes:', err.message);
            return;
        }
        console.log('✅ Tabela sessoes criada');
        
        console.log('\n🎉 Sistema de autenticação criado com sucesso!');
        console.log('\n📋 Níveis de acesso:');
        console.log('• Geral: Lançar frequência');
        console.log('• Responsável: Lançar frequência + Relatórios');
        console.log('• Administrador: Acesso completo + Gerenciar usuários');
        
        db.close();
    });
}

criarSistemaAuth();