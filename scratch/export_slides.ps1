$ppt = New-Object -ComObject PowerPoint.Application
$presPath = "C:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\docs\PRESENTACION_AVANCE_RESIDENCIA_GPON_FINAL.pptx"
$outDir = "C:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\scratch\slides_export"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}
$pres = $ppt.Presentations.Open($presPath, 1, 0, 0)
$pres.SaveAs($outDir, 17)
$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Output "Export completed successfully!"
Get-ChildItem $outDir

