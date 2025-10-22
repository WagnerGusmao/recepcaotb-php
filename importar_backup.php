<?php
/**
 * Script para importar backup SQL para o banco de dados
 */

require_once __DIR__ . '/php/config/database.php';

echo "📥 Importando backup do banco de dados...\n\n";

// Arquivo de backup mais recente
$backupFile = __DIR__ . '/exports/recepcaotb_EXPORT_COMPLETO_2025-10-20_22-18-10.sql';

if (!file_exists($backupFile)) {
    echo "❌ ERRO: Arquivo de backup não encontrado!\n";
    echo "   Procurado em: $backupFile\n";
    exit(1);
}

echo "📄 Arquivo: " . basename($backupFile) . "\n";
echo "📊 Tamanho: " . number_format(filesize($backupFile) / 1024, 2) . " KB\n\n";

try {
    $db = new Database();
    $pdo = $db->connect();
    
    // Desabilitar verificações temporariamente para importação mais rápida
    echo "⚙️  Configurando banco para importação...\n";
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("SET UNIQUE_CHECKS = 0");
    $pdo->exec("SET AUTOCOMMIT = 0");
    
    // Ler arquivo SQL
    echo "📖 Lendo arquivo SQL...\n";
    $sql = file_get_contents($backupFile);
    
    if (empty($sql)) {
        throw new Exception("Arquivo SQL está vazio!");
    }
    
    // Dividir em statements individuais
    echo "🔄 Executando SQL...\n";
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && 
                   !preg_match('/^(--|\/\*)/', $stmt) &&
                   trim($stmt) !== '';
        }
    );
    
    $total = count($statements);
    $executed = 0;
    $errors = 0;
    
    echo "📋 Total de comandos: $total\n\n";
    
    foreach ($statements as $index => $statement) {
        try {
            $pdo->exec($statement);
            $executed++;
            
            // Mostrar progresso a cada 50 comandos
            if (($executed % 50) === 0) {
                $percent = round(($executed / $total) * 100);
                echo "   Progresso: $executed/$total ($percent%)\n";
            }
        } catch (PDOException $e) {
            $errors++;
            // Mostrar apenas erros críticos (não duplicatas)
            if (strpos($e->getMessage(), 'Duplicate entry') === false) {
                echo "⚠️  Erro no comando " . ($index + 1) . ": " . substr($e->getMessage(), 0, 100) . "...\n";
            }
        }
    }
    
    // Commit das transações
    echo "\n💾 Salvando alterações...\n";
    $pdo->exec("COMMIT");
    
    // Reabilitar verificações
    echo "🔧 Reativando verificações...\n";
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    $pdo->exec("SET UNIQUE_CHECKS = 1");
    $pdo->exec("SET AUTOCOMMIT = 1");
    
    echo "\n✅ IMPORTAÇÃO CONCLUÍDA!\n\n";
    echo "📊 Estatísticas:\n";
    echo "   • Comandos executados: $executed/$total\n";
    echo "   • Erros: $errors\n\n";
    
    // Mostrar contagem de registros
    echo "📈 Registros importados:\n";
    $tables = ['usuarios', 'pessoas', 'frequencias', 'voluntarios', 'frequencia_voluntarios'];
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM $table");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "   • $table: " . $result['total'] . " registros\n";
        } catch (PDOException $e) {
            echo "   • $table: (erro ao contar)\n";
        }
    }
    
    echo "\n🎉 Banco de dados restaurado com sucesso!\n";
    
} catch (Exception $e) {
    echo "\n❌ ERRO: " . $e->getMessage() . "\n";
    echo "\n📋 Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
}
