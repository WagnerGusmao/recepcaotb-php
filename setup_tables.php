<?php
/**
 * Script para criar todas as tabelas necessárias
 */

require_once __DIR__ . '/php/config/database.php';

echo "🔧 Configurando tabelas do banco de dados...\n\n";

try {
    $db = new Database();
    $pdo = $db->connect();
    
    // 1. Criar tabela de usuários
    echo "📋 Criando tabela 'usuarios'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL,
            tipo ENUM('admin', 'lider', 'geral') DEFAULT 'geral',
            ativo TINYINT(1) DEFAULT 1,
            deve_trocar_senha TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY idx_email (email),
            KEY idx_tipo (tipo),
            KEY idx_ativo (ativo)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabela 'usuarios' criada\n\n";
    
    // 2. Criar tabela de sessões
    echo "📋 Criando tabela 'sessoes'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS sessoes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(255) NOT NULL,
            usuario_id INT NOT NULL,
            token TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            user_agent VARCHAR(500),
            ip_address VARCHAR(45),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            KEY idx_session_id (session_id),
            KEY idx_token_expires (expires_at),
            KEY idx_usuario (usuario_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabela 'sessoes' criada\n\n";
    
    // 3. Criar tabela de pessoas
    echo "📋 Criando tabela 'pessoas'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pessoas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            cpf VARCHAR(14) UNIQUE,
            nascimento DATE,
            religiao VARCHAR(100),
            endereco TEXT,
            cidade VARCHAR(100),
            estado VARCHAR(2),
            telefone VARCHAR(20),
            email VARCHAR(255),
            observacoes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY idx_cpf (cpf),
            KEY idx_nome (nome),
            KEY idx_cidade (cidade)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabela 'pessoas' criada\n\n";
    
    // 4. Criar tabela de frequências
    echo "📋 Criando tabela 'frequencias'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS frequencias (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pessoa_id INT NOT NULL,
            data DATE NOT NULL,
            tipo ENUM('comum', 'hospital', 'hospital_acompanhante', 'evento', 'assembleia') DEFAULT 'comum',
            observacoes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by INT,
            FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
            KEY idx_pessoa (pessoa_id),
            KEY idx_data (data),
            KEY idx_tipo (tipo),
            UNIQUE KEY unique_pessoa_data_tipo (pessoa_id, data, tipo)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabela 'frequencias' criada\n\n";
    
    // 5. Criar tabela de voluntários
    echo "📋 Criando tabela 'voluntarios'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS voluntarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            cpf VARCHAR(14) UNIQUE,
            data_nascimento DATE,
            religiao VARCHAR(100),
            endereco TEXT,
            cidade VARCHAR(100),
            estado VARCHAR(2),
            telefone VARCHAR(20),
            email VARCHAR(255),
            observacoes TEXT,
            ativo TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY idx_cpf (cpf),
            KEY idx_nome (nome),
            KEY idx_email (email),
            KEY idx_ativo (ativo)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabela 'voluntarios' criada\n\n";
    
    // 6. Executar migration de rate_limits
    echo "📋 Criando tabela 'rate_limits'...\n";
    $sql = file_get_contents(__DIR__ . '/php/migrations/004_create_rate_limits_table.sql');
    $pdo->exec($sql);
    echo "✅ Tabela 'rate_limits' criada\n\n";
    
    // 7. Executar migration de frequencia_voluntarios
    echo "📋 Criando tabela 'frequencia_voluntarios'...\n";
    $sql = file_get_contents(__DIR__ . '/php/migrations/create_frequencia_voluntarios.sql');
    $pdo->exec($sql);
    echo "✅ Tabela 'frequencia_voluntarios' criada\n\n";
    
    // 8. Criar usuário admin padrão
    echo "👤 Criando usuário administrador padrão...\n";
    $senhaHash = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        INSERT IGNORE INTO usuarios (nome, email, senha, tipo, ativo) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute(['Administrador', 'admin@terradobugio.com', $senhaHash, 'admin', 1]);
    
    if ($stmt->rowCount() > 0) {
        echo "✅ Usuário admin criado: admin@terradobugio.com / admin123\n\n";
    } else {
        echo "ℹ️  Usuário admin já existe\n\n";
    }
    
    // Listar todas as tabelas criadas
    echo "📊 Tabelas no banco de dados:\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        echo "   ✓ $table\n";
    }
    
    echo "\n🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!\n\n";
    echo "👉 Agora você pode fazer login com:\n";
    echo "   Email: admin@terradobugio.com\n";
    echo "   Senha: admin123\n";
    
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
}
