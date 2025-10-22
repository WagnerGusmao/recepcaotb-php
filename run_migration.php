<?php
/**
 * Script para executar migrations do banco de dados
 */

require_once __DIR__ . '/php/config/database.php';

echo "=== Sistema de Migrations - Terra do Bugio ===\n\n";

// Conectar ao banco
try {
    $db = db()->connect();
    echo "✓ Conectado ao banco de dados\n\n";
} catch (Exception $e) {
    echo "✗ Erro ao conectar ao banco: " . $e->getMessage() . "\n";
    exit(1);
}

// Migration: Rate Limits
echo "Executando migration: 004_create_rate_limits_table.sql\n";

$sql = file_get_contents(__DIR__ . '/php/migrations/004_create_rate_limits_table.sql');

try {
    // Separar comandos SQL por ponto-e-vírgula
    $commands = array_filter(
        array_map('trim', explode(';', $sql)),
        function($cmd) {
            // Remover comentários e linhas vazias
            $cmd = preg_replace('/--.*$/m', '', $cmd);
            return !empty(trim($cmd));
        }
    );
    
    foreach ($commands as $command) {
        if (!empty(trim($command))) {
            $db->exec($command);
            echo "  ✓ Comando executado com sucesso\n";
        }
    }
    
    echo "\n✓ Migration 004 executada com sucesso!\n\n";
    
    // Verificar se a tabela foi criada
    $stmt = $db->query("SHOW TABLES LIKE 'rate_limits'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Tabela 'rate_limits' criada com sucesso!\n";
        
        // Mostrar estrutura da tabela
        $stmt = $db->query("DESCRIBE rate_limits");
        echo "\nEstrutura da tabela:\n";
        echo str_repeat("-", 80) . "\n";
        printf("%-20s %-15s %-10s %-10s\n", "Campo", "Tipo", "Null", "Key");
        echo str_repeat("-", 80) . "\n";
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            printf("%-20s %-15s %-10s %-10s\n", 
                $row['Field'], 
                $row['Type'], 
                $row['Null'], 
                $row['Key']
            );
        }
        echo str_repeat("-", 80) . "\n";
    }
    
    echo "\n✓ Todas as migrations foram executadas com sucesso!\n";
    
} catch (PDOException $e) {
    echo "✗ Erro ao executar migration: " . $e->getMessage() . "\n";
    exit(1);
}
