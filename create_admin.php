<?php
require_once __DIR__ . '/php/config/database.php';

echo "👤 Criando usuário administrador...\n\n";

try {
    $db = new Database();
    $pdo = $db->connect();
    
    // Verificar se já existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute(['admin@terradobugio.com']);
    
    if ($stmt->fetch()) {
        echo "ℹ️  Usuário admin já existe!\n";
        echo "   Email: admin@terradobugio.com\n";
        echo "   Senha: (use a senha cadastrada anteriormente)\n\n";
    } else {
        // Criar novo usuário admin
        $senhaHash = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            INSERT INTO usuarios (nome, email, senha, tipo, ativo, deve_trocar_senha) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute(['Administrador', 'admin@terradobugio.com', $senhaHash, 'admin', 1, 0]);
        
        echo "✅ Usuário administrador criado com sucesso!\n\n";
        echo "📧 Email: admin@terradobugio.com\n";
        echo "🔑 Senha: admin123\n\n";
        echo "⚠️  IMPORTANTE: Troque esta senha após o primeiro login!\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
}
