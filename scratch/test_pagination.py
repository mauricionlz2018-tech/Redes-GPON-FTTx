import docx
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls, qn
import shutil
import subprocess

temp_docx = 'scratch/test_pagination.docx'
shutil.copyfile('docs/Documentacion_Residencias_avance.docx', temp_docx)

doc = docx.Document(temp_docx)

# Section 0 (Caratula): no footer visible
s0 = doc.sections[0]._sectPr
# Keep start=1 or clean up

# Section 1 (Preliminares): upperRoman, start=3
# It's already upperRoman, start=3.

# Section 2 (Cuerpo / Capitulos): decimal, consecutive (no start, or continue)
s2 = doc.sections[2]._sectPr
for el in s2.xpath('./w:pgNumType'):
    s2.remove(el)
new_pg2 = parse_xml(f'<w:pgNumType {nsdecls("w")} w:fmt="decimal"/>')
s2.append(new_pg2)

# Section 3 (Conclusiones): upperRoman, consecutive (no start)
s3 = doc.sections[3]._sectPr
for el in s3.xpath('./w:pgNumType'):
    s3.remove(el)
new_pg3 = parse_xml(f'<w:pgNumType {nsdecls("w")} w:fmt="upperRoman"/>')
s3.append(new_pg3)

# Section 4 (Referencias): no page numbers
s4 = doc.sections[4]._sectPr
for el in s4.xpath('./w:pgNumType'):
    s4.remove(el)

# Section 5 (Anexos): no page numbers
s5 = doc.sections[5]._sectPr
for el in s5.xpath('./w:pgNumType'):
    s5.remove(el)

doc.save(temp_docx)
print("Saved temporary document. Now inspecting with Word COM...")

