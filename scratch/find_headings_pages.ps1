$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\docs\Documentacion_Residencias_avance.docx'
$d = $w.Documents.Open($docPath, [ref]$false, [ref]$true)

$headings = @(
    "Introducción",
    "Planteamiento del problema",
    "Justificación",
    "Objetivos",
    "CAPÍTULO I",
    "CAPÍTULO II",
    "CAPÍTULO III",
    "CAPÍTULO IV",
    "CAPÍTULO V",
    "Conclusiones",
    "REFERENCIAS"
)

Write-Output "=== BUSQUEDA DE ENCABEZADOS Y SUS PAGINAS ==="
foreach ($h in $headings) {
    $found = $false
    for ($i = 1; $i -le $d.Paragraphs.Count; $i++) {
        $p = $d.Paragraphs.Item($i)
        $t = $p.Range.Text.Trim()
        if ($t -like "*$h*" -and $p.Range.Information(3) -gt 13) { # after TOC
            $pg = $p.Range.Information(3)
            $sec = $p.Range.Information(1) # wdActiveEndSectionNumber
            Write-Output "Encabezado '$h' -> Pagina Fisica $pg (Seccion $sec) | Texto: '$t'"
            $found = $true
            break
        }
    }
}

$d.Close([ref]$false)
$w.Quit()

