<?php
/**
 * Script para gerar exportação completa do banco de dados
 * Sistema de Recepção Terra do Bugio - Versão PHP
 */

// Configurações do banco de dados
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'recepcaotb';

// Nome do arquivo de exportação com timestamp
$timestamp = date('Y-m-d_H-i-s');
$filename = "recepcaotb_EXPORT_COMPLETO_{$timestamp}.sql";
$filepath = __DIR__ . "/exports/{$filename}";

// Criar diretório exports se não existir
if (!is_dir(__DIR__ . '/exports')) {
    mkdir(__DIR__ . '/exports', 0755, true);
}

echo "========================================\n";
echo "  EXPORTAÇÃO COMPLETA DO BANCO DE DADOS\n";
echo "========================================\n\n";

echo "Banco: {$database}\n";
echo "Host: {$host}\n";
echo "Arquivo: {$filename}\n\n";

// Comando mysqldump otimizado para phpMyAdmin
$command = sprintf(
    'mysqldump --host=%s --user=%s %s --single-transaction --routines --triggers --events --add-drop-table --create-options --disable-keys --extended-insert=FALSE --set-charset --default-character-set=utf8mb4 --comments --dump-date --lock-tables=FALSE %s > "%s"',
    escapeshellarg($host),
    escapeshellarg($username),
    $password ? '--password=' . escapeshellarg($password) : '',
    escapeshellarg($database),
    $filepath
);

echo "Executando mysqldump...\n";
echo "Comando: " . str_replace($password, '***', $command) . "\n\n";

// Executar o comando
$output = [];
$return_code = 0;
exec($command . ' 2>&1', $output, $return_code);

if ($return_code === 0) {
    // Verificar se o arquivo foi criado e tem conteúdo
    if (file_exists($filepath)) {
        $filesize = filesize($filepath);
        $filesize_mb = round($filesize / 1024 / 1024, 2);
        
        echo "✅ EXPORTAÇÃO CONCLUÍDA COM SUCESSO!\n\n";
        echo "📁 Arquivo: {$filename}\n";
        echo "📊 Tamanho: {$filesize_mb} MB ({$filesize} bytes)\n";
        echo "📍 Localização: {$filepath}\n\n";
        
        // Verificar integridade do arquivo
        $content = file_get_contents($filepath, false, null, 0, 1000);
        if (strpos($content, '-- MySQL dump') !== false) {
            echo "✅ Integridade: Arquivo válido (cabeçalho MySQL encontrado)\n";
        } else {
            echo "⚠️ Integridade: Possível problema no arquivo\n";
        }
        
        // Contar linhas aproximadamente
        $lines = 0;
        $handle = fopen($filepath, 'r');
        if ($handle) {
            while (!feof($handle)) {
                fgets($handle);
                $lines++;
            }
            fclose($handle);
            echo "📄 Linhas: {$lines}\n";
        }
        
        echo "\n========================================\n";
        echo "  INSTRUÇÕES PARA IMPORTAÇÃO\n";
        echo "========================================\n\n";
        
        echo "1. Acesse o phpMyAdmin\n";
        echo "2. Crie uma nova base de dados: 'recepcaotb'\n";
        echo "3. Selecione a base criada\n";
        echo "4. Vá em 'Importar'\n";
        echo "5. Selecione o arquivo: {$filename}\n";
        echo "6. Configure:\n";
        echo "   - Charset: utf8mb4_general_ci\n";
        echo "   - Formato: SQL\n";
        echo "   - Tamanho máximo: 50MB+\n";
        echo "7. Clique em 'Executar'\n\n";
        
        echo "⏱️ Tempo estimado de importação: 2-5 minutos\n";
        echo "🔐 Credenciais de login: admin@terradobugio.com / admin123\n\n";
        
        // Verificar dados no banco atual
        try {
            $pdo = new PDO("mysql:host={$host};dbname={$database};charset=utf8mb4", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            echo "📊 DADOS INCLUÍDOS NO EXPORT:\n";
            echo "========================================\n";
            
            // Contar registros por tabela
            $tables = ['pessoas', 'usuarios', 'frequencias', 'sessoes'];
            foreach ($tables as $table) {
                try {
                    $stmt = $pdo->query("SELECT COUNT(*) as count FROM {$table}");
                    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                    echo "• {$table}: {$count} registros\n";
                } catch (Exception $e) {
                    echo "• {$table}: Tabela não encontrada\n";
                }
            }
            
        } catch (Exception $e) {
            echo "⚠️ Não foi possível verificar dados: " . $e->getMessage() . "\n";
        }
        
    } else {
        echo "❌ ERRO: Arquivo não foi criado!\n";
        if (!empty($output)) {
            echo "Saída do comando:\n" . implode("\n", $output) . "\n";
        }
    }
} else {
    echo "❌ ERRO NA EXPORTAÇÃO!\n";
    echo "Código de retorno: {$return_code}\n";
    if (!empty($output)) {
        echo "Saída do comando:\n" . implode("\n", $output) . "\n";
    }
}

echo "\n========================================\n";
echo "Script finalizado em " . date('Y-m-d H:i:s') . "\n";
echo "========================================\n";
?>
