@echo off
chcp 65001 >nul
echo ================================================
echo 📥 IMPORTAR BACKUP DO BANCO DE DADOS
echo ================================================
echo.

REM Definir caminhos
set BACKUP_FILE=C:\Projetos\BD\recepcaotb_EXPORT_COMPLETO_2025-10-20_22-18-10.sql
set DB_NAME=recepcaotb_local
set DB_USER=root
set DB_PASS=

echo 📄 Arquivo: %BACKUP_FILE%
echo 💾 Banco: %DB_NAME%
echo 👤 Usuário: %DB_USER%
echo.

REM Verificar se arquivo existe
if not exist "%BACKUP_FILE%" (
    echo ❌ ERRO: Arquivo não encontrado!
    echo    %BACKUP_FILE%
    pause
    exit /b 1
)

echo 🔄 Importando backup...
echo    (Isso pode levar alguns minutos)
echo.

REM Tentar importar
mysql -u %DB_USER% %DB_NAME% < "%BACKUP_FILE%" 2>&1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ IMPORTAÇÃO CONCLUÍDA!
    echo.
    
    REM Verificar registros
    echo 📊 Verificando dados...
    echo.
    php -r "require 'php/config/database.php'; try { $db = new Database(); $pdo = $db->connect(); $tables = ['usuarios' => 'Usuários', 'pessoas' => 'Pessoas', 'frequencias' => 'Frequências', 'voluntarios' => 'Voluntários']; foreach ($tables as $table => $label) { try { $stmt = $pdo->query('SELECT COUNT(*) as total FROM ' . $table); $result = $stmt->fetch(PDO::FETCH_ASSOC); if ($result['total'] > 0) { echo '   ✓ ' . $label . ': ' . number_format($result['total']) . \" registros\n\"; } } catch (Exception $e) {} } echo \"\n\"; echo \"👥 Usuários disponíveis:\n\"; $stmt = $pdo->query('SELECT nome, email, tipo FROM usuarios WHERE ativo = 1 LIMIT 5'); while ($user = $stmt->fetch(PDO::FETCH_ASSOC)) { echo \"   • {$user['nome']} ({$user['email']}) - {$user['tipo']}\n\"; } } catch (Exception $e) { echo 'Erro: ' . $e->getMessage(); }"
    
    echo.
    echo 🎉 BACKUP RESTAURADO COM SUCESSO!
) else (
    echo.
    echo ❌ ERRO na importação!
    echo.
    echo 💡 Possíveis soluções:
    echo    1. Verifique se o MySQL está no PATH do sistema
    echo    2. Ou use o caminho completo, ex:
    echo       "C:\xampp\mysql\bin\mysql.exe" -u root recepcaotb_local ^< "%BACKUP_FILE%"
)

echo.
pause
