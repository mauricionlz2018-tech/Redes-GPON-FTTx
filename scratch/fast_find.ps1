$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\docs\Documentacion_Residencias_avance.docx'
$d = $w.Documents.Open($docPath, [ref]$false, [ref]$true)

$headings = @(
    "Introducción",
    "Planteamiento del problema",
    "Justificación",
    "Objetivo general",
    "CAPÍTULO I. ANTECEDENTES",
    "CAPÍTULO II. MARCO TEÓRICO",
    "CAPÍTULO III. DISEÑO Y MAQUETADO",
    "CAPÍTULO IV. DESARROLLO (CODIFICACIÓN)",
    "CAPÍTULO V. PRUEBAS Y RESULTADOS",
    "Conclusiones",
    "REFERENCIAS"
)

Write-Output "=== UBICACION RAPIDA DE ENCABEZADOS EN WORD ==="
foreach ($h in $headings) {
    $rng = $d.Content
    $find = $rng.Find
    $find.Text = $h
    $find.Forward = $true
    $find.Wrap = 0 # wdFindStop
    
    # Skip any match in TOC (page <= 15)
    while ($find.Execute()) {
        $pg = $rng.Information(3) # wdActiveEndPageNumber
        if ($pg -gt 15) {
            $sec = $rng.Information(1) # wdActiveEndSectionNumber
            Write-Output "Encabezado '$h' -> Pagina Fisica $pg (Seccion $sec)"
            break
        }
    }
}

$d.Close([ref]$false)
$w.Quit()

