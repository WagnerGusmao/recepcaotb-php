@echo off
echo ========================================
echo   Sistema recepcaotb - Ambiente Local
echo ========================================
echo.

echo 1. Verificando PHP...
php --version
if %errorlevel% neq 0 (
    echo ERRO: PHP nao encontrado!
    echo Verifique se o XAMPP esta instalado.
    pause
    exit /b 1
)

echo.
echo 2. Instalando dependencias...
cd php
composer install --ignore-platform-reqs
cd ..

echo.
echo 3. Configurando banco de dados...
echo Acesse: http://localhost/recepcaotb-16-10-PHP_MySQL/setup_local.php
echo Para configurar o banco automaticamente.
echo.

echo 4. Iniciando servidor de desenvolvimento...
echo Servidor rodando em: http://localhost:8000
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.

php -S localhost:8000 router_local.php

pause
