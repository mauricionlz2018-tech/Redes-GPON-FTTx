$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\docs\Documentacion_Residencias_avance.docx'
$d = $w.Documents.Open($docPath, [ref]$false, [ref]$true)

$queries = @(
    "Introducci",
    "Planteamiento del problema",
    "Justificaci",
    "Objetivos",
    "ANTECEDENTES",
    "Contexto de la organizaci",
    "MARCO TE",
    "fundamentos de redes",
    "DISENO Y MAQUETADO",
    "recolecci",
    "DESARROLLO (CODIFICACI",
    "PRUEBAS Y RESULTADOS",
    "Conclusiones",
    "Glosario",
    "REFERENCIAS",
    "Anexos"
)

Write-Output "=== BUSQUEDA RAPIDA DE PAGINAS ==="
foreach ($q in $queries) {
    $rng = $d.Content
    $find = $rng.Find
    $find.Text = $q
    $find.Forward = $true
    $find.Wrap = 0 # wdFindStop
    
    while ($find.Execute()) {
        $pg = $rng.Information(3) # wdActiveEndPageNumber
        if ($pg -gt 15) { # skip TOC
            $sec = $rng.Information(1)
            $txt = $rng.Paragraphs.Item(1).Range.Text.Trim()
            if ($txt.Length -gt 40) { $txt = $txt.Substring(0, 40) }
            Write-Output "Query '$q' -> Pagina $pg (Seccion $sec) : '$txt'"
            break
        }
    }
}

$d.Close([ref]$false)
$w.Quit()

