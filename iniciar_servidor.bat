@echo off
echo ========================================
echo   Sistema Terra do Bugio - Servidor
echo ========================================
echo.
echo Iniciando servidor PHP na porta 8080...
echo.
echo Acesse o sistema em:
echo   http://localhost:8080
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.
echo ========================================
echo.

cd /d "%~dp0"
php -S localhost:8080 router.php

pause
