@echo off
chcp 65001 >nul
echo ================================================
echo 📥 IMPORTANDO BACKUP DO BANCO DE DADOS
echo ================================================
echo.

REM Configurações
set BACKUP_FILE=exports\recepcaotb_EXPORT_COMPLETO_2025-10-20_22-18-10.sql
set DB_NAME=recepcaotb_local
set DB_USER=root
set DB_PASS=

echo 📄 Arquivo: %BACKUP_FILE%
echo 📊 Banco de dados: %DB_NAME%
echo.

REM Verificar se arquivo existe
if not exist "%BACKUP_FILE%" (
    echo ❌ ERRO: Arquivo de backup não encontrado!
    echo    Procurado em: %BACKUP_FILE%
    pause
    exit /b 1
)

echo 🔄 Importando dados...
echo.

REM Importar via mysql
mysql -u %DB_USER% %DB_NAME% < "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!
    echo.
    echo 📊 Verificando registros importados...
    echo.
    
    REM Contar registros
    php -r "require 'php/config/database.php'; $db = new Database(); $pdo = $db->connect(); $tables = ['usuarios', 'pessoas', 'frequencias', 'voluntarios', 'frequencia_voluntarios']; foreach ($tables as $table) { try { $stmt = $pdo->query(\"SELECT COUNT(*) as total FROM $table\"); $result = $stmt->fetch(PDO::FETCH_ASSOC); echo '   • ' . $table . ': ' . $result['total'] . \" registros\n\"; } catch (Exception $e) {} }"
    
    echo.
    echo 🎉 Banco de dados restaurado!
) else (
    echo.
    echo ❌ ERRO na importação!
    echo.
    echo 💡 Possíveis soluções:
    echo    1. Verifique se o MySQL está rodando
    echo    2. Confirme as credenciais do banco
    echo    3. Certifique-se que o banco recepcaotb_local existe
)

echo.
pause
