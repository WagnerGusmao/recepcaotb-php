@echo off
echo ========================================
echo Migration: Rate Limits Table
echo ========================================
echo.

echo Executando SQL...
mysql -u root recepcaotb_local < php\migrations\004_create_rate_limits_table.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Migration executada com sucesso!
    echo.
    echo Verificando tabela criada...
    mysql -u root recepcaotb_local -e "DESCRIBE rate_limits;"
    echo.
    echo ✓ Tabela 'rate_limits' criada!
) else (
    echo.
    echo ✗ Erro ao executar migration
    echo Código de erro: %ERRORLEVEL%
)

echo.
pause
