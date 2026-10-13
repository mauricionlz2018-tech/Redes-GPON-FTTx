$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\scratch\test_sections_setup.docx'
$d = $w.Documents.Open($docPath, [ref]$false, [ref]$false)

Write-Output "Actualizando campos y TOC en Word..."
$d.Fields.Update()
if ($d.TablesOfContents.Count -gt 0) {
    $d.TablesOfContents.Item(1).Update()
    Write-Output "TOC actualizado exitosamente."
}

Write-Output "=== DETALLES DE TODAS LAS SECCIONES TRAS ACTUALIZACION ==="
Write-Output "Total de páginas: $($d.ComputeStatistics(2))"
for ($i = 1; $i -le $d.Sections.Count; $i++) {
    $sec = $d.Sections.Item($i)
    $startPg = $sec.Range.Characters.Item(1).Information(3)
    $pn = $sec.Headers.Item(1).PageNumbers
    $re = $pn.RestartNumberingAtSection
    $sn = $pn.StartingNumber
    $st = $pn.NumberStyle
    $fFirst = $sec.Footers.Item(2).Range.Text.Trim() # wdHeaderFooterFirstPage = 2
    $fNorm = $sec.Footers.Item(1).Range.Text.Trim()  # wdHeaderFooterPrimary = 1
    Write-Output "Seccion $($i) : StartPhysicalPage=$startPg | Restart=$re | StartNum=$sn | Style=$st"
    Write-Output "   FirstPageFooter='$fFirst' | PrimaryFooter='$fNorm'"
}

$d.Save()
$d.Close([ref]$false)
$w.Quit()
Write-Output "Listo!"
