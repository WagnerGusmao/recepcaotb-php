@echo off
chcp 65001 > nul
echo ==========================================
echo 🚀 Preparando Deploy para Hostinger
echo ==========================================
echo.

:: Criar pasta temporária para deploy
echo 📁 Criando pasta temporária...
if exist deploy_temp rmdir /s /q deploy_temp
mkdir deploy_temp

:: Copiar arquivo .env de produção
echo 📋 Configurando .env de produção...
copy .env.production deploy_temp\.env > nul

:: Copiar arquivos principais
echo 📄 Copiando arquivos principais...
copy index.html deploy_temp\ > nul
copy login.html deploy_temp\ > nul
copy trocar-senha.html deploy_temp\ > nul
copy painel-simples.html deploy_temp\ > nul
copy favicon.ico deploy_temp\ > nul
copy .htaccess deploy_temp\ > nul
copy router_local.php deploy_temp\ > nul

:: Copiar pastas
echo 📂 Copiando pastas...
xcopy /E /I /Y css deploy_temp\css > nul
xcopy /E /I /Y js deploy_temp\js > nul
xcopy /E /I /Y imagem deploy_temp\imagem > nul

:: Copiar pasta php (excluindo vendor e composer)
echo 📦 Copiando estrutura PHP...
xcopy /E /I /Y php deploy_temp\php > nul

:: Criar pastas necessárias
echo 📁 Criando pastas de logs e backups...
if not exist deploy_temp\php\logs mkdir deploy_temp\php\logs
if not exist deploy_temp\php\backups mkdir deploy_temp\php\backups
echo. > deploy_temp\php\logs\.gitkeep
echo. > deploy_temp\php\backups\.gitkeep

:: Copiar backup mais recente
echo 💾 Copiando backup do banco de dados...
if exist backups\*.sql (
    for /f "delims=" %%i in ('dir /b /o-d backups\*.sql') do (
        copy "backups\%%i" deploy_temp\ > nul
        echo    ✓ Backup incluído: %%i
        goto :backup_copied
    )
)
:backup_copied

:: Copiar scripts úteis
echo 🔧 Copiando scripts de setup...
copy create_admin.php deploy_temp\ > nul
copy setup_tables.php deploy_temp\ > nul
copy resetar_senha_admin.php deploy_temp\ > nul

:: Criar arquivo README de deploy
echo 📝 Criando README de deploy...
(
echo # Deploy Terra do Bugio - Hostinger
echo.
echo ## Passos para Deploy:
echo.
echo 1. Faça upload de todos os arquivos para public_html/
echo 2. Importe o arquivo .sql no phpMyAdmin
echo 3. Verifique se o .env está configurado corretamente
echo 4. Acesse: https://ivory-worm-865052.hostingersite.com/
echo.
echo ## Credenciais do Banco:
echo - Host: localhost
echo - Database: u746854799_tbrecepcao
echo - Usuário: u746854799_recepcaotb
echo.
echo ## Documentação Completa:
echo Consulte DEPLOY_HOSTINGER.md no projeto original
) > deploy_temp\README_DEPLOY.txt

:: Criar arquivo ZIP
echo 📦 Criando arquivo ZIP...
powershell -command "Compress-Archive -Path deploy_temp\* -DestinationPath recepcaotb_hostinger.zip -Force"

echo.
echo ✅ Deploy preparado com sucesso!
echo.
echo 📦 Arquivo criado: recepcaotb_hostinger.zip
echo 📂 Pasta temporária: deploy_temp\
echo.
echo 📋 Próximos passos:
echo    1. Faça upload do arquivo recepcaotb_hostinger.zip no Hostinger
echo    2. Extraia o arquivo no public_html/
echo    3. Importe o backup SQL no phpMyAdmin
echo    4. Acesse a URL e teste o sistema
echo.
echo 📖 Documentação completa: DEPLOY_HOSTINGER.md
echo.
pause
