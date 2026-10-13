$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\docs\Documentacion_Residencias_avance.docx'
$d = $w.Documents.Open($docPath, [ref]$false, [ref]$true)

$paras = @(160, 165, 174, 179, 195, 206, 207, 250, 759, 1198, 1205)

Write-Output "=== PAGINAS FISICAS DE PARRAFOS CLAVE ==="
foreach ($pIdx in $paras) {
    # 1-indexed in Word COM
    $p = $d.Paragraphs.Item($pIdx + 1)
    $txt = $p.Range.Text.Trim()
    if ($txt.Length -gt 35) { $txt = $txt.Substring(0, 35) }
    $pg = $p.Range.Information(3) # wdActiveEndPageNumber
    Write-Output "P$pIdx (Page $pg): '$txt'"
}

$d.Close([ref]$false)
$w.Quit()

