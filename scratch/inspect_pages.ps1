$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\scratch\test_pagination.docx'
$d = $w.Documents.Open($docPath, [ref]$false, [ref]$true)

Write-Output "=== DETALLES DE TEST_PAGINATION EN WORD ==="
Write-Output "Total de paginas: $($d.ComputeStatistics(2))"
for ($i = 1; $i -le $d.Sections.Count; $i++) {
    $sec = $d.Sections.Item($i)
    $startPg = $sec.Range.Characters.Item(1).Information(3)
    $footer = $sec.Footers.Item(1)
    $footerText = $footer.Range.Text.Trim()
    $pn = $sec.Headers.Item(1).PageNumbers
    $re = $pn.RestartNumberingAtSection
    $sn = $pn.StartingNumber
    $st = $pn.NumberStyle
    Write-Output "Seccion $($i) : StartPhysicalPage=$startPg | Restart=$re | StartNum=$sn | Style=$st"
    Write-Output "   Footer text render: '$footerText'"
}

$d.Close([ref]$false)
$w.Quit()

