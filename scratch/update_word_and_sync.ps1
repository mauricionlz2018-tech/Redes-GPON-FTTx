Stop-Process -Name WINWORD -Force -ErrorAction SilentlyContinue

$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\docs\Documentacion_Residencias_avance.docx'
$altPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\docs\Documentacion_Residencias (4).docx'

Write-Output "Abriendo documento en Word para actualizar campos y todos los índices..."
$d = $w.Documents.Open($docPath, [ref]$false, [ref]$false)

Write-Output "Actualizando campos globales..."
$d.Fields.Update()

Write-Output "Total de tablas de contenido encontradas: $($d.TablesOfContents.Count)"
for ($t = 1; $t -le $d.TablesOfContents.Count; $t++) {
    Write-Output "Actualizando Índice #$t..."
    $d.TablesOfContents.Item($t).Update()
}

$totalPages = $d.ComputeStatistics(2)
Write-Output "Total de páginas tras actualización: $totalPages"

$d.Save()
$d.Close([ref]$false)
$w.Quit()

Write-Output "Sincronizando con $altPath..."
Copy-Item -Path $docPath -Destination $altPath -Force
Write-Output "Sincronización completada con éxito."
