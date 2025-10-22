# Script para habilitar extensão GD do PHP
# Execute como Administrador se necessário

Write-Host "🔧 Habilitando extensão GD do PHP..." -ForegroundColor Cyan

# Localizar php.ini
$phpIniPath = "C:\xampp\php\php.ini"

if (-not (Test-Path $phpIniPath)) {
    Write-Host "❌ Arquivo php.ini não encontrado em: $phpIniPath" -ForegroundColor Red
    Write-Host "Procurando php.ini..." -ForegroundColor Yellow
    
    # Tentar localizar automaticamente
    $phpIni = php --ini | Select-String "Loaded Configuration File"
    if ($phpIni) {
        $phpIniPath = ($phpIni -split ":")[1].Trim()
        Write-Host "✅ Encontrado em: $phpIniPath" -ForegroundColor Green
    } else {
        Write-Host "❌ Não foi possível localizar php.ini" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📄 Arquivo: $phpIniPath" -ForegroundColor White

# Fazer backup
$backupPath = "$phpIniPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $phpIniPath $backupPath
Write-Host "✅ Backup criado: $backupPath" -ForegroundColor Green

# Ler conteúdo
$content = Get-Content $phpIniPath

# Verificar se já está habilitado
if ($content -match "^extension=gd") {
    Write-Host "✅ Extensão GD já está habilitada!" -ForegroundColor Green
} else {
    # Habilitar extensão
    $newContent = $content -replace ';extension=gd', 'extension=gd'
    Set-Content $phpIniPath $newContent
    Write-Host "✅ Extensão GD habilitada!" -ForegroundColor Green
}

# Verificar outras extensões importantes
Write-Host "`n📋 Verificando extensões..." -ForegroundColor Cyan

$extensoesNecessarias = @('gd', 'mbstring', 'mysqli', 'pdo_mysql', 'zip', 'curl')

foreach ($ext in $extensoesNecessarias) {
    $habilitada = php -m | Select-String -Pattern "^$ext$" -Quiet
    if ($habilitada) {
        Write-Host "  ✅ $ext" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $ext (não habilitada)" -ForegroundColor Red
    }
}

Write-Host "`n🔄 Para aplicar as mudanças:" -ForegroundColor Yellow
Write-Host "  1. Reinicie o Apache no XAMPP Control Panel" -ForegroundColor White
Write-Host "  2. Ou reinicie o computador" -ForegroundColor White

Write-Host "`n✅ Processo concluído!" -ForegroundColor Green
Write-Host "`n🚀 Próximo passo: Execute 'composer install' novamente" -ForegroundColor Cyan
