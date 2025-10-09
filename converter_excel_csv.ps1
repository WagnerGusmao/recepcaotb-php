# Script PowerShell para converter Excel para CSV
$excelFile = "Setembro_Freq.xlsm"
$csvFile = "backend\setembro_freq.csv"

Write-Host "Convertendo $excelFile para CSV..."

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    $workbook = $excel.Workbooks.Open((Resolve-Path $excelFile).Path)
    $worksheet = $workbook.Worksheets.Item(1)
    
    # Salvar como CSV
    $worksheet.SaveAs((Join-Path (Get-Location) $csvFile), 6) # 6 = CSV format
    
    $workbook.Close()
    $excel.Quit()
    
    Write-Host "✅ Conversão concluída: $csvFile"
    
    # Executar importação
    Write-Host "Iniciando importação das frequências..."
    Set-Location backend
    node processar_frequencia_mensal.js setembro_freq.csv
    
} catch {
    Write-Host "❌ Erro na conversão: $($_.Exception.Message)"
} finally {
    if ($excel) {
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    }
}