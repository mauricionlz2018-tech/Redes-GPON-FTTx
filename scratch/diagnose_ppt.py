import os, subprocess, pptx

def test_pptx(filename):
    ps_code = f'''$ppt = New-Object -ComObject PowerPoint.Application
$p = "C:\\Users\\karen\\OneDrive\\Documentos\\Redes-Mapeo-GPON-FTTx\\{filename}"
try {{
    $pres = $ppt.Presentations.Open($p, 1, 0, 0)
    Write-Output "SUCCESS"
    $pres.Close()
}} catch {{
    Write-Output "ERROR: $($_.Exception.Message)"
}}
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
'''
    with open('scratch/temp_test.ps1', 'w', encoding='utf-8') as f:
        f.write(ps_code)
    res = subprocess.run(['powershell', '-ExecutionPolicy', 'Bypass', '-File', 'scratch/temp_test.ps1'], capture_output=True, text=True)
    return 'SUCCESS' in res.stdout, res.stdout.strip()

# Test 2: Text modification on Slide 1 & 2
prs = pptx.Presentation(r'docs/Plantilla presentacion de residencia_BACKUP.pptx')
s1 = prs.slides[0]
s1.shapes[3].text_frame.text = "Septiembre de 2026"
prs.save(r'scratch/test2.pptx')
ok, msg = test_pptx(r'scratch/test2.pptx')
print('Test 2 (text modification):', ok, msg)

# Test 3: Image blob replacement on Slide 3 & 4 & 12
prs = pptx.Presentation(r'docs/Plantilla presentacion de residencia_BACKUP.pptx')
with open('scratch/fig1_map_extracted.png', 'rb') as f:
    prs.slides[2].part.related_part('rId4')._blob = f.read()
with open('scratch/fig_2_bw_final.png', 'rb') as f:
    prs.slides[3].part.related_part('rId4')._blob = f.read()
with open(r'C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/cronograma_actividades_gpon_20sep.png', 'rb') as f:
    prs.slides[11].part.related_part('rId4')._blob = f.read()
prs.save(r'scratch/test3.pptx')
ok, msg = test_pptx(r'scratch/test3.pptx')
print('Test 3 (blob replacement):', ok, msg)

# Test 4: Removing shapes (e.g. from Slide 12)
prs = pptx.Presentation(r'docs/Plantilla presentacion de residencia_BACKUP.pptx')
s12 = prs.slides[11]
for shp in list(s12.shapes):
    if shp.shape_id in [200, 202, 203, 204, 205, 207, 208, 209]:
        sp = shp._element
        sp.getparent().remove(sp)
prs.save(r'scratch/test4.pptx')
ok, msg = test_pptx(r'scratch/test4.pptx')
print('Test 4 (remove shapes):', ok, msg)

# Test 5: Slide 10 add picture
prs = pptx.Presentation(r'docs/Plantilla presentacion de residencia_BACKUP.pptx')
s10 = prs.slides[9]
from pptx.util import Inches
s10.shapes.add_picture('scratch/fig_herramientas_gpon.png', Inches(1), Inches(2), Inches(7), Inches(3))
prs.save(r'scratch/test5.pptx')
ok, msg = test_pptx(r'scratch/test5.pptx')
print('Test 5 (add picture):', ok, msg)

