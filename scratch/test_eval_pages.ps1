$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\scratch\test_pagination.docx'
$d = $w.Documents.Open($docPath, [ref]$false, [ref]$true)

$testPages = @(1, 2, 3, 4, 13, 14, 15, 176, 177, 178, 179, 180, 189, 190)

Write-Output "=== EVALUACION DE NUMEROS DE PAGINA RENDERIZADOS ==="
foreach ($p in $testPages) {
    # Go to physical page $p
    $rng = $d.GoTo([ref]1, [ref]1, [ref]$p) # wdGoToPage, wdGoToAbsolute, $p
    $sec = $rng.Sections.Item(1)
    $footer = $sec.Footers.Item(1)
    
    # Check fields in footer
    $fieldVal = ""
    if ($footer.Range.Fields.Count -gt 0) {
        $fieldVal = $footer.Range.Fields.Item(1).Result.Text.Trim()
    }
    
    $secIdx = $rng.Information(1) # wdActiveEndSectionNumber
    $pageStr = $rng.Information(1) # active section
    Write-Output "Pagina Fisica $p (en Seccion $secIdx): FooterFieldResult='$fieldVal' | FooterRangeText='$($footer.Range.Text.Trim())'"
}

$d.Close([ref]$false)
$w.Quit()

