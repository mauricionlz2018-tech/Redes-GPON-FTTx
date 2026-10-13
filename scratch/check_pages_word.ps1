$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\docs\Documentacion_Residencias_avance_BACKUP_08OCT_FINAL_PAG.docx'
$d = $w.Documents.Open($docPath, [ref]$false, [ref]$true)

Write-Output "Total pages: $($d.ComputeStatistics(2))"
Write-Output "Total sections: $($d.Sections.Count)"

$paras = @("Índice de contenido", "Introducción", "Planteamiento del problema", "CAPÍTULO I. ANTECEDENTES", "En el presente capítulo", "CAPÍTULO II. MARCO", "CAPÍTULO III. DISEÑO", "CAPÍTULO IV. DESARROLLO", "CAPÍTULO V. PRUEBAS", "Conclusiones", "REFERENCIAS", "Anexos")

foreach ($text in $paras) {
    $found = $false
    for ($i = 1; $i -le $d.Paragraphs.Count; $i++) {
        $p = $d.Paragraphs.Item($i)
        if ($p.Range.Text -match $text) {
            $pageNum = $p.Range.Information(3) # wdActiveEndPageNumber
            $secNum = $p.Range.Information(2)  # wdActiveEndSectionNumber
            Write-Output "'$text' -> Page $pageNum | Sec $secNum"
            $found = $true
            break
        }
    }
}

$d.Close([ref]$false)
$w.Quit()

