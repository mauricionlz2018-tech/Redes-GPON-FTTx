$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = 'c:\Users\karen\OneDrive\Documentos\Redes-Mapeo-GPON-FTTx\scratch\test_pagination.docx'
$d = $w.Documents.Open($docPath, [ref]$false, [ref]$true)
$p3 = $d.GoTo([ref]1, [ref]1, [ref]3)
$p14 = $d.GoTo([ref]1, [ref]1, [ref]14)
$p177 = $d.GoTo([ref]1, [ref]1, [ref]177)
Write-Output ("Page 3 Information(3): " + $p3.Information(3))
Write-Output ("Page 14 Information(3): " + $p14.Information(3))
Write-Output ("Page 177 Information(3): " + $p177.Information(3))
$d.Close([ref]$false)
$w.Quit()

