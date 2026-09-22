$ppt = New-Object -ComObject PowerPoint.Application
$p = "C:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\scratch/test5.pptx"
try {
    $pres = $ppt.Presentations.Open($p, 1, 0, 0)
    Write-Output "SUCCESS"
    $pres.Close()
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
}
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
