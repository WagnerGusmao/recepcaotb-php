<?php
/**
 * Resetar senha do usuário admin
 */

require_once __DIR__ . '/php/config/database.php';

echo "🔑 Resetando senha do administrador...\n\n";

$email = 'admin@terradobugio.com';
$novaSenha = 'Admin@123';

try {
    $db = new Database();
    $pdo = $db->connect();
    
    // Verificar se usuário existe
    $stmt = $pdo->prepare("SELECT id, nome FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "❌ Usuário não encontrado: $email\n";
        exit(1);
    }
    
    echo "👤 Usuário: {$user['nome']}\n";
    echo "📧 Email: $email\n";
    echo "🔑 Nova senha: $novaSenha\n\n";
    
    // Atualizar senha
    $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        UPDATE usuarios 
        SET senha = ?, deve_trocar_senha = 0 
        WHERE email = ?
    ");
    $stmt->execute([$senhaHash, $email]);
    
    echo "✅ Senha resetada com sucesso!\n\n";
    echo "👉 Agora você pode fazer login com:\n";
    echo "   Email: $email\n";
    echo "   Senha: $novaSenha\n\n";
    echo "⚠️  IMPORTANTE: Troque esta senha após o login!\n";
    
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
}
