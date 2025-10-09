@echo off
echo Sincronizando projeto com GitHub...

REM Inicializar repositório Git (se não existir)
if not exist .git (
    echo Inicializando repositório Git...
    git init
    git branch -M main
)

REM Adicionar todos os arquivos
echo Adicionando arquivos...
git add .

REM Fazer commit
echo Fazendo commit...
git commit -m "Atualização do sistema: correção de datas e sincronização"

REM Verificar se já existe remote origin
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo ATENÇÃO: Configure o repositório remoto primeiro:
    echo git remote add origin https://github.com/wagnergusmao/terrabugiosenh.git
    echo.
    echo Depois execute: git push -u origin main
) else (
    echo Enviando para GitHub...
    git push
)

echo.
echo Sincronização concluída!
pause