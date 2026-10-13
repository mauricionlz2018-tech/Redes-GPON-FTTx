$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\docs\Documentacion_Residencias_avance.docx'
$d = $w.Documents.Open($docPath, [ref]$false, [ref]$true)

$check = @(160, 165, 174, 179, 195, 206, 207, 250, 261, 263, 759, 770, 772, 1198, 1205, 1210, 1214, 1238, 1374)

Write-Output "=== PAGINAS FISICAS EXACTAS ==="
# In Word COM, Document.Range.Paragraphs can be accessed directly or search
foreach ($idx in $check) {
    # Find paragraph by index
    $p = $d.Paragraphs.Item($idx + 1)
    $t = $p.Range.Text.Trim()
    if ($t.Length -gt 35) { $t = $t.Substring(0, 35) }
    $pg = $p.Range.Information(3) # wdActiveEndPageNumber
    $sec = $p.Range.Information(1)
    Write-Output "Index $idx -> Pagina $pg (Seccion $sec) : '$t'"
}

$d.Close([ref]$false)
$w.Quit()

