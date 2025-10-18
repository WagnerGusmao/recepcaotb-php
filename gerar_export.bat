@echo off
echo ========================================
echo   GERADOR DE EXPORT - Sistema recepcaotb
echo ========================================
echo.
echo Gerando exportacao completa do banco de dados...
echo.

php gerar_export_completo.php

echo.
echo ========================================
echo   EXPORT CONCLUIDO!
echo ========================================
echo.
echo O arquivo foi salvo na pasta 'exports/'
echo Use este arquivo para importar no phpMyAdmin
echo.
pause
