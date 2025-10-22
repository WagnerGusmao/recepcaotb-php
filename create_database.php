<?php
/**
 * Script para criar o banco de dados
 */

echo "🔧 Criando banco de dados recepcaotb_local...\n\n";

// Conectar sem especificar banco de dados
$host = 'localhost';
$user = 'root';
$pass = '';  // ⚠️ AJUSTE SE SEU MYSQL TIVER SENHA

try {
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Criar banco de dados
    $pdo->exec("CREATE DATABASE IF NOT EXISTS recepcaotb_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    echo "✅ Banco de dados 'recepcaotb_local' criado com sucesso!\n\n";
    
    // Verificar se foi criado
    $stmt = $pdo->query("SHOW DATABASES LIKE 'recepcaotb_local'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Confirmado: banco de dados existe!\n\n";
        
        // Agora testar a conexão completa
        echo "🔍 Testando conexão completa...\n";
        require_once __DIR__ . '/php/config/database.php';
        $db = new Database();
        $dbConn = $db->connect();
        echo "✅ Conexão funcionando perfeitamente!\n\n";
        
        echo "👉 Próximo passo: Execute as migrations para criar as tabelas\n";
        echo "   Procure por arquivos .sql em php/migrations/\n";
    }
    
} catch (PDOException $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n\n";
    echo "👉 Possíveis causas:\n";
    echo "   1. MySQL não está rodando\n";
    echo "   2. Usuário ou senha incorretos (ajuste no topo deste arquivo)\n";
    echo "   3. Permissões insuficientes\n";
}
